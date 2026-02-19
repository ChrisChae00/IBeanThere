'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';
import { getMyCollections, createCollection, deleteCollection, updateCollection, generateShareLink } from '@/lib/api/collections';
import { isAuthError } from '@/lib/api/client';
import type { Collection } from '@/types/api';
import CollectionDetailModal from './CollectionDetailModal';
import CollectionCreateModal from './CollectionCreateModal';

interface MyCollectionsSectionProps {
  isOwnProfile?: boolean;
  collectionsPublic?: boolean;
  onToggleCollectionsPublic?: (isPublic: boolean) => void;
}

/**
 * Collections section for the profile page.
 * Shows user's collections in a mobile-optimized grid.
 */
export default function MyCollectionsSection({ isOwnProfile = true, collectionsPublic = false, onToggleCollectionsPublic }: MyCollectionsSectionProps) {
  const t = useTranslations('collections');
  const tProfile = useTranslations('profile');
  const router = useRouter();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      try {
        const data = await getMyCollections();
        setCollections(data);
      } catch (err) {
        if (isAuthError(err)) {
          // Not logged in, no collections to show
          setCollections([]);
        } else {
          setError(t('load_failed'));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollections();
  }, [t]);

  const handleCreateCollection = useCallback(async (name: string) => {
    try {
      const newCollection = await createCollection({
        name: name.trim(),
        icon_type: 'custom',
      });
      setCollections(prev => [...prev, newCollection]);
      setShowCreateModal(false);
    } catch (err) {
      throw err;
    }
  }, []);

  const handleDeleteCollection = useCallback(async (collectionId: string) => {
    try {
      await deleteCollection(collectionId);
      setCollections(prev => prev.filter(c => c.id !== collectionId));
      setSelectedCollection(null);
    } catch (err) {
      throw err;
    }
  }, []);

  const handleUpdateCollection = useCallback(async (collectionId: string, data: { name?: string }) => {
    try {
      const updated = await updateCollection(collectionId, data);
      setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, ...updated } : c));
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(prev => prev ? { ...prev, ...updated } : null);
      }
    } catch (err) {
      throw err;
    }
  }, [selectedCollection]);

  const handleItemCountChange = useCallback((collectionId: string, delta: number) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId ? { ...c, item_count: Math.max(0, (c.item_count || 0) + delta) } : c
    ));
  }, []);

  const handleShare = useCallback(async (collectionId: string) => {
    const { share_url } = await generateShareLink(collectionId);
    const fullUrl = `${window.location.origin}${share_url}`;
    await navigator.clipboard.writeText(fullUrl);
    return fullUrl;
  }, []);

  const handleNavigateToCafe = useCallback((path: string) => {
    setSelectedCollection(null);
    router.push(path);
  }, [router]);

  const getCollectionIcon = (iconType: string) => {
    if (iconType === 'favourite') {
      return <HeartIcon filled size={20} color="#ef4444" />;
    }
    if (iconType === 'save_later') {
      return <BookmarkIcon filled size={20} color="#3b82f6" />;
    }
    // Custom collection - primary color circle
    return (
      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]" />
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

  const displayCollections = sortedCollections;

  if (isLoading) {
    return (
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!isOwnProfile && displayCollections.length === 0) {
    return null; // Don't show section if no public collections for other users
  }

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-xl p-4 sm:p-6 border border-[var(--color-border)] shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {isOwnProfile ? tProfile('my_collections') : tProfile('public_collections')}
          </h2>
          <div className="flex items-center gap-3">
            {isOwnProfile && onToggleCollectionsPublic && (
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {tProfile('collections_public_label')}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleCollectionsPublic(!collectionsPublic)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    collectionsPublic ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      collectionsPublic ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </label>
            )}
            {isOwnProfile && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-secondary)] transition-colors active:scale-[0.98]"
              >
                + {t('create_new')}
              </button>
            )}
          </div>
        </div>

        {/* Collections Grid */}
        {displayCollections.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-secondary)]">
            <p>{t('no_collections')}</p>
            <p className="text-sm mt-1">{t('empty_hint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayCollections.map(collection => {
              return (
                <button
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection)}
                  className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg hover:bg-[var(--color-cardBackground)] transition-colors text-left group"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getCollectionIcon(collection.icon_type)}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--color-text)] truncate">
                        {getCollectionName(collection)}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {t('cafes', { count: collection.item_count || 0 })}
                    </span>
                  </div>
                  
                  {/* Arrow */}
                  <svg 
                    className="w-4 h-4 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Collection Detail Modal */}
      {selectedCollection && (
        <CollectionDetailModal
          collection={selectedCollection}
          isOpen={!!selectedCollection}
          onClose={() => setSelectedCollection(null)}
          onDelete={isOwnProfile ? handleDeleteCollection : undefined}
          onUpdate={isOwnProfile ? handleUpdateCollection : undefined}
          onShare={handleShare}
          onNavigateToCafe={handleNavigateToCafe}
          isOwnProfile={isOwnProfile}
          onItemCountChange={handleItemCountChange}
        />
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <CollectionCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCollection}
        />
      )}
    </>
  );
}
