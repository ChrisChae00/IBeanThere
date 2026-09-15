'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button, HeartIcon, BookmarkIcon, LoadingSpinner, Switch } from '@/shared/ui';
import { getMyCollections, createCollection, deleteCollection, updateCollection, generateShareLink } from '@/lib/api/collections';
import { isAuthError } from '@/lib/api/client';
import type { Collection } from '@/types/api';
import CollectionDetailModal from './CollectionDetailModal';
import CollectionCreateModal from './CollectionCreateModal';

interface MyCollectionsSectionProps {
  isOwnProfile?: boolean;
}

/**
 * Collections section for the profile page.
 * Shows user's collections in a mobile-optimized grid.
 */
export default function MyCollectionsSection({ isOwnProfile = true }: MyCollectionsSectionProps) {
  const t = useTranslations('collections');
  const tProfile = useTranslations('profile');
  const router = useRouter();
  const locale = useLocale();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const handleUpdateCollection = useCallback(async (collectionId: string, data: { name?: string; is_public?: boolean }) => {
    try {
      const updated = await updateCollection(collectionId, data);
      setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, ...updated } : c));
      setSelectedCollection(prev => prev?.id === collectionId ? { ...prev, ...updated } : prev);
    } catch (err) {
      throw err;
    }
  }, []);

  const handleItemCountChange = useCallback((collectionId: string, delta: number) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId ? { ...c, item_count: Math.max(0, (c.item_count || 0) + delta) } : c
    ));
  }, []);

  const handleShare = useCallback(async (collectionId: string) => {
    const { share_url } = await generateShareLink(collectionId);
    const fullUrl = `${window.location.origin}/${locale}${share_url}`;
    await navigator.clipboard.writeText(fullUrl);
    return fullUrl;
  }, [locale]);

  const handleNavigateToCafe = useCallback((path: string) => {
    setSelectedCollection(null);
    router.push(path);
  }, [router]);

  const getCollectionIcon = (iconType: string) => {
    if (iconType === 'favourite') {
      return <HeartIcon filled size={20} className="text-collection-favourite" />;
    }
    if (iconType === 'save_later') {
      return <BookmarkIcon filled size={20} className="text-collection-saved" />;
    }
    // Custom collection - primary color circle
    return (
      <div className="w-5 h-5 rounded-full bg-primary" />
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
      <div className="bg-surface rounded-xl p-6 border border-border shadow-xs">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-border shadow-xs">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!isOwnProfile && displayCollections.length === 0) {
    return null; // Don't show section if no public collections for other users
  }

  return (
    <>
      <div className="rounded-(--radius-card) border border-edge-rule bg-surface-raised p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          {/*
            The serif, not `font-sans`: the display face is the page's own voice and
            the body face is for data, so a section title written in the body face
            reads as another row rather than as the thing the rows belong to.
          */}
          <h2 className="min-w-0 text-xl text-ink-primary">
            {isOwnProfile ? tProfile('my_collections') : tProfile('public_collections')}
          </h2>
          {isOwnProfile && (
            /*
              Quiet, because the profile already spends its one filled control on Edit
              Profile. An outlined pill at 44px stood as tall as the title beside it and
              took the eye first; ghost keeps the 44px target without the weight.
            */
            <Button variant="ghost" size="sm" className="ml-auto shrink-0 whitespace-nowrap" onClick={() => setShowCreateModal(true)}>
              {t('create_new')}
            </Button>
          )}
        </div>
        {saveError && <p role="alert" className="mb-3 text-sm text-state-danger">{saveError}</p>}

        {/* Collections Grid */}
        {displayCollections.length === 0 ? (
          <div className="text-center py-8 text-ink-secondary">
            <p>{t('no_collections')}</p>
            <p className="text-sm mt-1">{t('empty_hint')}</p>
          </div>
        ) : (
          /*
            Rows on the panel's own surface, not cards. A card inside a panel is a
            second frame around something that never lifts off the page, and it put a
            16px curve 16px inside the panel's own 16px curve -- two circles that do
            not share a centre. `.menu-item` is what the collection dialog already
            uses for exactly this list: `--radius-control` on a hover fill mixed from
            the surface it sits on, so the row darkens instead of turning into the
            panel's colour and vanishing.
          */
          /*
            `divide-y` skips the last child by design, so the list closed on nothing.
            Re-enabling the rule on that one row keeps it identical to the others --
            same edge of the same box, so it sits at the row's own bottom rather than
            below its margin, which is where a rule drawn by the container would land.
          */
          <div className="divide-y divide-edge-rule [&>*:last-child]:border-b [&>*:last-child]:border-edge-rule">
            {displayCollections.map(collection => {
              return (
                <div key={collection.id} className="menu-item gap-3 py-2 my-1">
                <button
                  type="button"
                  onClick={() => setSelectedCollection(collection)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-brand"
                >
                  {/* Icon */}
                  <div className="shrink-0">
                    {getCollectionIcon(collection.icon_type)}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink-primary truncate">
                        {getCollectionName(collection)}
                      </span>
                    </div>
                    <span className="text-sm text-ink-secondary">
                      {t('cafes', { count: collection.item_count || 0 })}
                    </span>
                  </div>
                  
                </button>
                {isOwnProfile && (
                  <div className="shrink-0">
                    <Switch
                      checked={collection.is_public === false}
                      label={t('visibility_private')}
                      ariaLabel={`${getCollectionName(collection)}: ${t('visibility_private')}`}
                      disabled={savingId !== null}
                      onChange={async (next) => {
                        setSavingId(collection.id);
                        setSaveError(null);
                        try {
                          await handleUpdateCollection(collection.id, { is_public: !next });
                        } catch {
                          setSaveError(t('save_failed'));
                        } finally {
                          setSavingId(null);
                        }
                      }}
                    />
                  </div>
                )}
                </div>
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
          onCollectionCreated={(created) => setCollections(prev => [...prev, created])}
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
