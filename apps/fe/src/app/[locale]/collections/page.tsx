'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';
import { getMyCollections, createCollection, deleteCollection, generateShareLink } from '@/lib/api/collections';
import type { Collection } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';

export default function CollectionsPage() {
  const t = useTranslations('collections');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isLoading: authLoading } = useAuth();
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New collection form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Share state
  const [shareLoading, setShareLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/signin`);
    }
  }, [authLoading, user, router, locale]);

  // Fetch collections
  useEffect(() => {
    if (!user) return;
    
    const fetchCollections = async () => {
      setIsLoading(true);
      try {
        const data = await getMyCollections();
        setCollections(data);
      } catch (err) {
        setError(t('load_failed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollections();
  }, [user, t]);

  const handleCreateCollection = useCallback(async () => {
    if (!newCollectionName.trim() || isCreating) return;
    
    setIsCreating(true);
    try {
      const newCollection = await createCollection({
        name: newCollectionName.trim(),
        icon_type: 'custom',
      });
      setCollections(prev => [...prev, newCollection]);
      setNewCollectionName('');
      setShowNewForm(false);
    } catch (err) {
      setError(t('create_failed'));
    } finally {
      setIsCreating(false);
    }
  }, [newCollectionName, isCreating, t]);

  const handleDeleteCollection = useCallback(async (collectionId: string, iconType: string) => {
    if (iconType === 'favourite' || iconType === 'save_later') {
      return; // Cannot delete system collections
    }
    
    if (!confirm(t('delete_confirm'))) return;
    
    try {
      await deleteCollection(collectionId);
      setCollections(prev => prev.filter(c => c.id !== collectionId));
    } catch (err) {
      setError(t('load_failed'));
    }
  }, [t]);

  const handleShare = useCallback(async (collectionId: string) => {
    setShareLoading(collectionId);
    try {
      const { share_url } = await generateShareLink(collectionId);
      const fullUrl = `${window.location.origin}${share_url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(collectionId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      setError(t('load_failed'));
    } finally {
      setShareLoading(null);
    }
  }, [t]);

  const getCollectionIcon = (iconType: string) => {
    if (iconType === 'favourite') {
      return <HeartIcon filled size={24} color="#ef4444" />;
    }
    if (iconType === 'save_later') {
      return <BookmarkIcon filled size={24} color="#3b82f6" />;
    }
    return (
      <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm">
        📁
      </div>
    );
  };

  const getCollectionName = (collection: Collection) => {
    if (collection.icon_type === 'favourite') return t('favourite');
    if (collection.icon_type === 'save_later') return t('save_later');
    return collection.name;
  };

  // Sort: Favourite first, then Save for Later, then custom by position
  const sortedCollections = [...collections].sort((a, b) => {
    if (a.icon_type === 'favourite') return -1;
    if (b.icon_type === 'favourite') return 1;
    if (a.icon_type === 'save_later') return -1;
    if (b.icon_type === 'save_later') return 1;
    return a.position - b.position;
  });

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-cardText)]">
          {t('my_collections')}
        </h1>
        <button
          onClick={() => setShowNewForm(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-secondary)] transition-colors font-medium"
        >
          + {t('create_new')}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* New Collection Form */}
      {showNewForm && (
        <div className="mb-6 p-4 bg-[var(--color-cardBackground)] rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              placeholder={t('collection_name_placeholder')}
              className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-secondary)] disabled:opacity-50 transition-colors"
            >
              {isCreating ? <LoadingSpinner size="sm" /> : t('create')}
            </button>
            <button
              onClick={() => {
                setShowNewForm(false);
                setNewCollectionName('');
              }}
              className="px-4 py-2 text-[var(--color-textSecondary)] hover:text-[var(--color-cardText)]"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-textSecondary)]">
          {t('no_collections')}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCollections.map(collection => {
            const isSystemCollection = collection.icon_type === 'favourite' || collection.icon_type === 'save_later';
            
            return (
              <div
                key={collection.id}
                className="bg-[var(--color-cardBackground)] rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/${locale}/collections/${collection.id}`}
                  className="flex items-center gap-4 p-4"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getCollectionIcon(collection.icon_type)}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--color-cardText)] truncate">
                      {getCollectionName(collection)}
                    </h3>
                    <p className="text-sm text-[var(--color-textSecondary)]">
                      {t('items', { count: collection.item_count || 0 })}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <svg className="w-5 h-5 text-[var(--color-textSecondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                {/* Actions */}
                <div className="flex items-center gap-2 px-4 pb-3 border-t border-[var(--color-border)] pt-2">
                  <button
                    onClick={() => handleShare(collection.id)}
                    disabled={shareLoading === collection.id}
                    className="text-sm text-[var(--color-primary)] hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    {shareLoading === collection.id ? (
                      <LoadingSpinner size="sm" />
                    ) : copiedId === collection.id ? (
                      <>✓ {t('share_link_copied')}</>
                    ) : (
                      <>{t('share')}</>
                    )}
                  </button>
                  
                  {!isSystemCollection && (
                    <>
                      <span className="text-[var(--color-border)]">|</span>
                      <button
                        onClick={() => handleDeleteCollection(collection.id, collection.icon_type)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        {t('delete')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
