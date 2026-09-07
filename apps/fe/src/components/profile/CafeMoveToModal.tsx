'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Plus } from 'lucide-react';
import { Button, Modal, HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';
import {
  getMyCollections,
  addCafeToCollection,
  removeCafeFromCollection,
  createCollection,
  getCafeSaveStatus,
} from '@/lib/api/collections';
import type { Collection } from '@/types/api';

interface CafeMoveToModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafeId: string;
  cafeName: string;
  currentCollectionId: string;
  onMoveComplete: (targetCollectionIds: string[]) => void;
  /*
    A collection made here is made for real, so it has to be handed back to whoever owns
    the list of them. Without this it lived only in this modal's own state and was gone
    the moment the modal closed -- the collection existed on the server and the profile
    did not show it until the page was loaded again.
  */
  onCollectionCreated?: (collection: Collection) => void;
}

export default function CafeMoveToModal({
  isOpen,
  onClose,
  cafeId,
  cafeName,
  currentCollectionId,
  onMoveComplete,
  onCollectionCreated,
}: CafeMoveToModalProps) {
  const t = useTranslations('collections');

  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedCollectionIds, setSavedCollectionIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New collection form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedIds(new Set());
    setError(null);
    setShowNewForm(false);
    setNewCollectionName('');

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [collectionsData, saveStatus] = await Promise.all([
          getMyCollections(),
          getCafeSaveStatus(cafeId),
        ]);
        setCollections(collectionsData);
        setSavedCollectionIds(new Set(saveStatus.saved_collection_ids));
      } catch {
        setError(t('load_failed'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, cafeId, t]);

  const handleToggle = useCallback((collectionId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  }, []);

  const handleMove = useCallback(async () => {
    if (selectedIds.size === 0 || isMoving) return;

    setIsMoving(true);
    setError(null);

    try {
      // Add to all newly selected collections
      const newlyAdded: string[] = [];
      for (const id of selectedIds) {
        if (!savedCollectionIds.has(id)) {
          await addCafeToCollection(id, cafeId);
          newlyAdded.push(id);
        }
      }
      // Remove from current collection
      await removeCafeFromCollection(currentCollectionId, cafeId);
      onMoveComplete(newlyAdded);
      onClose();
    } catch {
      setError(t('move_failed'));
    } finally {
      setIsMoving(false);
    }
  }, [selectedIds, savedCollectionIds, isMoving, cafeId, currentCollectionId, onMoveComplete, onClose, t]);

  const handleCreateCollection = useCallback(async () => {
    if (!newCollectionName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newCollection = await createCollection({
        name: newCollectionName.trim(),
        icon_type: 'custom',
      });
      setCollections(prev => [...prev, newCollection]);
      setSelectedIds(prev => new Set([...prev, newCollection.id]));
      onCollectionCreated?.(newCollection);
      setNewCollectionName('');
      setShowNewForm(false);
    } catch {
      setError(t('create_failed'));
    } finally {
      setIsCreating(false);
    }
  }, [newCollectionName, isCreating, onCollectionCreated, t]);

  const getCollectionIcon = (iconType: string, isSelected: boolean) => {
    if (iconType === 'favourite') {
      return <HeartIcon filled={isSelected} size={20} className={isSelected ? "text-collection-favourite" : undefined} />;
    }
    if (iconType === 'save_later') {
      return <BookmarkIcon filled={isSelected} size={20} className={isSelected ? "text-collection-saved" : undefined} />;
    }
    return (
      <span
        className={`block h-5 w-5 rounded-(--radius-pill) bg-brand ${isSelected ? '' : 'opacity-40'}`}
      />
    );
  };

  // Exclude current collection, sort: Favourite first, Save for Later, then custom
  const sortedCollections = collections
    .filter(c => c.id !== currentCollectionId)
    .sort((a, b) => {
      if (a.icon_type === 'favourite') return -1;
      if (b.icon_type === 'favourite') return 1;
      if (a.icon_type === 'save_later') return -1;
      if (b.icon_type === 'save_later') return 1;
      return a.position - b.position;
    });

  const footer = (
    <div className="flex justify-end">
      <Button size="sm" onClick={handleMove} disabled={selectedIds.size === 0 || isMoving}>
        {isMoving ? <LoadingSpinner size="sm" /> : t('move')}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('move_to')}
      size="sm"
      footer={footer}
      zIndex="var(--z-modal-nested)"
    >
      <div className="min-h-[200px]">
        <p className="mb-4 truncate text-sm text-ink-secondary">
          {cafeName}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <p className="flex items-center justify-center gap-2 py-4 text-sm text-ink-primary">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-(--radius-pill) bg-state-danger" />
            {error}
          </p>
        ) : (
          <div className="scrollbar-quiet max-h-[300px] space-y-1 overflow-y-auto">
            {sortedCollections.map(collection => {
              const alreadySaved = savedCollectionIds.has(collection.id);
              const isSelected = selectedIds.has(collection.id) || alreadySaved;
              const isSystemCollection = collection.icon_type === 'favourite' || collection.icon_type === 'save_later';

              return (
                <button
                  key={collection.id}
                  onClick={() => !alreadySaved && handleToggle(collection.id)}
                  disabled={alreadySaved}
                  className={`menu-item py-2.5 ${isSelected ? 'is-active' : ''} ${
                    alreadySaved ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {getCollectionIcon(collection.icon_type, isSelected)}

                  <span className="flex-1 truncate font-sans text-ink-primary">
                    {isSystemCollection ? t(collection.icon_type) : collection.name}
                  </span>

                  <span className="landing-micro text-ink-secondary">{collection.item_count}</span>

                  {/*
                    A chosen row is `.is-active` and carries a check at its far end -- the
                    same mark every menu in the app uses for the row you are on. The box
                    this replaces was drawn with `--radius-control`, which on a 20px square
                    is a full circle: it read as a radio button in a list that takes more
                    than one answer.
                  */}
                  {isSelected && <Check className="menu-mark" />}
                </button>
              );
            })}

            {sortedCollections.length > 0 && (
              <div className="my-2 h-px bg-edge-rule" />
            )}

            {/* New collection form */}
            {showNewForm ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  placeholder={t('collection_name_placeholder')}
                  className="h-11 flex-1 rounded-(--input-radius) border border-edge-default bg-surface-raised px-3 text-sm text-ink-primary outline-none focus-visible:border-brand"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateCollection();
                    if (e.key === 'Escape') {
                      setShowNewForm(false);
                      setNewCollectionName('');
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim() || isCreating}
                >
                  {isCreating ? <LoadingSpinner size="sm" /> : t('create')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewCollectionName('');
                  }}
                >
                  {t('cancel')}
                </Button>
              </div>
            ) : (
              <button onClick={() => setShowNewForm(true)} className="menu-item py-2.5">
                <Plus className="menu-mark" />
                <span>{t('create_new')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
