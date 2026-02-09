'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';

import { getCollectionDetail, removeCafeFromCollection } from '@/lib/api/collections';
import { getCafePath } from '@/lib/utils/slug';
import type { Collection, CollectionDetail } from '@/types/api';

interface CollectionDetailModalProps {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (collectionId: string) => Promise<void>;
  onUpdate?: (collectionId: string, data: { name?: string }) => Promise<void>;
  onShare?: (collectionId: string) => Promise<string>;
  onNavigateToCafe?: (path: string) => void;
  isOwnProfile?: boolean;
}

/**
 * Modal for viewing collection details and managing items.
 */
export default function CollectionDetailModal({
  collection,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
  onShare,
  onNavigateToCafe,
  isOwnProfile = true,
}: CollectionDetailModalProps) {
  const t = useTranslations('collections');
  const params = useParams();
  const locale = params.locale as string;
  
  const [detail, setDetail] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [isSaving, setIsSaving] = useState(false);
  
  // Share state
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  
  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  // Fetch collection details
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCollectionDetail(collection.id);
        setDetail(data);
      } catch (err) {
        setError(t('load_failed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetail();
  }, [isOpen, collection.id, t]);

  // Reset edit state when collection changes
  useEffect(() => {
    setEditName(collection.name);
    setIsEditing(false);
  }, [collection]);

  const handleSave = useCallback(async () => {
    if (!onUpdate || isSaving) return;
    
    setIsSaving(true);
    try {
      await onUpdate(collection.id, { name: editName.trim() });
      setIsEditing(false);
    } catch (err) {
      setError(t('save_failed'));
    } finally {
      setIsSaving(false);
    }
  }, [collection.id, editName, onUpdate, isSaving, t]);

  const handleShare = useCallback(async () => {
    if (!onShare || shareLoading) return;
    
    setShareLoading(true);
    try {
      await onShare(collection.id);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      setError(t('load_failed'));
    } finally {
      setShareLoading(false);
    }
  }, [collection.id, onShare, shareLoading, t]);

  const handleDelete = useCallback(async () => {
    if (!onDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete(collection.id);
    } catch (err) {
      setError(t('load_failed'));
      setIsDeleting(false);
    }
  }, [collection.id, onDelete, isDeleting, t]);

  const handleRemoveCafe = useCallback(async (cafeId: string) => {
    try {
      await removeCafeFromCollection(collection.id, cafeId);
      setDetail(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.cafe_id !== cafeId),
        item_count: prev.item_count - 1,
      } : null);
    } catch (err) {
      setError(t('load_failed'));
    }
  }, [collection.id, t]);

  const getCollectionIcon = (iconType: string) => {
    if (iconType === 'favourite') {
      return <HeartIcon filled size={24} color="#ef4444" />;
    }
    if (iconType === 'save_later') {
      return <BookmarkIcon filled size={24} color="#3b82f6" />;
    }
    return (
      <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]" />
    );
  };

  const getCollectionName = () => {
    if (collection.icon_type === 'favourite') return t('favourite');
    if (collection.icon_type === 'save_later') return t('save_later');
    return collection.name;
  };

  const isSystemCollection = collection.icon_type === 'favourite' || collection.icon_type === 'save_later';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[var(--color-cardBackground)] rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-cardText)] hover:bg-[var(--color-surface)]/80 transition"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="p-6 sm:p-8 min-h-[300px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-border)]">
          {getCollectionIcon(collection.icon_type)}
          
          {isEditing && !isSystemCollection ? (
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-lg font-semibold border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              autoFocus
            />
          ) : (
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[var(--color-cardText)]">
                {getCollectionName()}
              </h2>
              <p className="text-sm text-[var(--color-textSecondary)]">
                {t('items', { count: detail?.item_count ?? collection.item_count ?? 0 })}
              </p>
            </div>
          )}
        </div>
        
        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : detail?.items.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-textSecondary)]">
            {t('no_collections')}
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {detail?.items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-background)] group"
              >
                <div
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    const path = getCafePath({ id: item.cafe_id, slug: item.cafe_slug }, locale);
                    if (onNavigateToCafe) {
                      onNavigateToCafe(path);
                    } else {
                      window.location.href = path;
                    }
                  }}
                >
                  {/* Cafe Image */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-background)]">
                    {item.cafe_main_image ? (
                      <img
                        src={item.cafe_main_image}
                        alt={item.cafe_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        ☕
                      </div>
                    )}
                  </div>

                  {/* Cafe Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--color-cardText)] truncate">
                      {item.cafe_name}
                    </h3>
                    {item.cafe_address && (
                      <p className="text-sm text-[var(--color-textSecondary)] truncate">
                        {item.cafe_address}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Remove button */}
                {isOwnProfile && (
                  <button
                    onClick={() => handleRemoveCafe(item.cafe_id)}
                    className="p-1.5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all"
                    title={t('remove')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {isOwnProfile && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !editName.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-secondary)] disabled:opacity-50 transition-colors"
                >
                  {isSaving ? <LoadingSpinner size="sm" /> : t('save')}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(collection.name);
                  }}
                  className="px-4 py-2 text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-cardText)]"
                >
                  {t('cancel')}
                </button>
              </>
            ) : (
              <>
                {/* Share */}
                <button
                  onClick={handleShare}
                  disabled={shareLoading}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/10 disabled:opacity-50 transition-colors"
                >
                  {shareLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : shareCopied ? (
                    <>✓ {t('share_link_copied')}</>
                  ) : (
                    t('share')
                  )}
                </button>
                
                {/* Edit (custom collections only) */}
                {!isSystemCollection && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-[var(--color-textSecondary)] hover:text-[var(--color-cardText)] transition-colors"
                  >
                    {t('edit')}
                  </button>
                )}
                
                {/* Delete (custom collections only) */}
                {!isSystemCollection && (
                  showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {isDeleting ? <LoadingSpinner size="sm" /> : t('delete')}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-2 text-sm text-[var(--color-textSecondary)]"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      {t('delete')}
                    </button>
                  )
                )}
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
