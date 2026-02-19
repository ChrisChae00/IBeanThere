'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';
import { getMyCollections, addCafeToCollection, removeCafeFromCollection, createCollection, getCafeSaveStatus } from '@/lib/api/collections';
import { isAuthError } from '@/lib/api/client';
import type { Collection, CafeSaveStatus } from '@/types/api';

interface CollectionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafeId: string;
  cafeName: string;
  onSaveComplete?: () => void;
}

/**
 * YouTube-style collection selector modal.
 * Allows users to add/remove a cafe from multiple collections.
 */
export default function CollectionSelectorModal({
  isOpen,
  onClose,
  cafeId,
  cafeName,
  onSaveComplete,
}: CollectionSelectorModalProps) {
  const t = useTranslations('collections');
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedCollectionIds, setSavedCollectionIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New collection form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch collections and save status
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [collectionsData, saveStatus] = await Promise.all([
          getMyCollections(),
          getCafeSaveStatus(cafeId),
        ]);
        
        setCollections(collectionsData);
        setSavedCollectionIds(new Set(saveStatus.saved_collection_ids));
      } catch (err) {
        if (isAuthError(err)) {
          setError(t('login_required'));
        } else {
          setError(t('load_failed'));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isOpen, cafeId, t]);

  const handleToggleCollection = useCallback(async (collectionId: string) => {
    if (isSaving) return;
    
    setIsSaving(true);
    const isCurrentlySaved = savedCollectionIds.has(collectionId);
    
    // Optimistic update
    setSavedCollectionIds(prev => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
    
    try {
      if (isCurrentlySaved) {
        await removeCafeFromCollection(collectionId, cafeId);
      } else {
        await addCafeToCollection(collectionId, cafeId);
      }
    } catch (err) {
      // Revert on error
      setSavedCollectionIds(prev => {
        const next = new Set(prev);
        if (isCurrentlySaved) {
          next.add(collectionId);
        } else {
          next.delete(collectionId);
        }
        return next;
      });
      setError(t('save_failed'));
    } finally {
      setIsSaving(false);
    }
  }, [cafeId, isSaving, savedCollectionIds, t]);

  const handleCreateCollection = useCallback(async () => {
    if (!newCollectionName.trim() || isCreating) return;
    
    setIsCreating(true);
    
    try {
      const newCollection = await createCollection({
        name: newCollectionName.trim(),
        icon_type: 'custom',
      });
      
      // Add cafe to new collection
      await addCafeToCollection(newCollection.id, cafeId);
      
      setCollections(prev => [...prev, newCollection]);
      setSavedCollectionIds(prev => new Set([...prev, newCollection.id]));
      setNewCollectionName('');
      setShowNewForm(false);
    } catch (err) {
      setError(t('create_failed'));
    } finally {
      setIsCreating(false);
    }
  }, [cafeId, newCollectionName, isCreating, t]);

  const handleClose = useCallback(() => {
    onSaveComplete?.();
    onClose();
  }, [onClose, onSaveComplete]);

  const getCollectionIcon = (iconType: string, isSelected: boolean) => {
    if (iconType === 'favourite') {
      return <HeartIcon filled={isSelected} size={20} color={isSelected ? '#ef4444' : undefined} />;
    }
    if (iconType === 'save_later') {
      return <BookmarkIcon filled={isSelected} size={20} color={isSelected ? '#3b82f6' : undefined} />;
    }
    return (
      <div className={`w-5 h-5 rounded-full bg-[var(--color-primary)] ${
        isSelected ? '' : 'opacity-40'
      }`} />
    );
  };

  // Sort: Favourite first, then Save for Later, then custom by position
  const sortedCollections = [...collections].sort((a, b) => {
    if (a.icon_type === 'favourite') return -1;
    if (b.icon_type === 'favourite') return 1;
    if (a.icon_type === 'save_later') return -1;
    if (b.icon_type === 'save_later') return 1;
    return a.position - b.position;
  });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('save_to')}>
      <div className="min-h-[200px]">
        {/* Cafe name header */}
        <p className="text-sm text-[var(--color-textSecondary)] mb-4 truncate">
          {cafeName}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : (
          <>
            {/* Collection list */}
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {sortedCollections.map(collection => {
                const isSelected = savedCollectionIds.has(collection.id);
                const isSystemCollection = collection.icon_type === 'favourite' || collection.icon_type === 'save_later';
                
                return (
                  <button
                    key={collection.id}
                    onClick={() => handleToggleCollection(collection.id)}
                    disabled={isSaving}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                      transition-colors duration-150
                      ${isSelected 
                        ? 'bg-[var(--color-primary)]/10' 
                        : 'hover:bg-[var(--color-background)]'
                      }
                      disabled:opacity-50
                    `}
                  >
                    {/* Checkbox */}
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                      transition-colors duration-150
                      ${isSelected 
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
                        : 'border-gray-300'
                      }
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Icon */}
                    {getCollectionIcon(collection.icon_type, isSelected)}
                    
                    {/* Name */}
                    <span className="flex-1 truncate text-[var(--color-cardText)]">
                      {isSystemCollection ? t(collection.icon_type) : collection.name}
                    </span>
                    
                    {/* Item count */}
                    <span className="text-xs text-[var(--color-textSecondary)]">
                      {collection.item_count}
                    </span>
                  </button>
                );
              })}

              {/* Separator */}
              {sortedCollections.length > 0 && (
                <div className="h-px bg-[var(--color-border)] my-2" />
              )}

              {/* New collection form */}
              {showNewForm ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={e => setNewCollectionName(e.target.value)}
                    placeholder={t('collection_name_placeholder')}
                    className="flex-1 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreateCollection();
                      if (e.key === 'Escape') {
                        setShowNewForm(false);
                        setNewCollectionName('');
                      }
                    }}
                  />
                  <button
                    onClick={handleCreateCollection}
                    disabled={!newCollectionName.trim() || isCreating}
                    className="px-3 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-secondary)] disabled:opacity-50 transition-colors"
                  >
                    {isCreating ? <LoadingSpinner size="sm" /> : t('create')}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewForm(false);
                      setNewCollectionName('');
                    }}
                    className="px-3 py-2 text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-cardText)]"
                  >
                    {t('cancel')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewForm(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                >
                  <span className="w-5 h-5 flex items-center justify-center text-lg">+</span>
                  <span>{t('create_new')}</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
