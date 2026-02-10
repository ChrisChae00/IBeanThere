'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';
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
}

export default function CafeMoveToModal({
  isOpen,
  onClose,
  cafeId,
  cafeName,
  currentCollectionId,
  onMoveComplete,
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
      setNewCollectionName('');
      setShowNewForm(false);
    } catch {
      setError(t('create_failed'));
    } finally {
      setIsCreating(false);
    }
  }, [newCollectionName, isCreating, t]);

  const getCollectionIcon = (iconType: string, isSelected: boolean) => {
    if (iconType === 'favourite') {
      return <HeartIcon filled={isSelected} size={20} color={isSelected ? '#ef4444' : undefined} />;
    }
    if (iconType === 'save_later') {
      return <BookmarkIcon filled={isSelected} size={20} color={isSelected ? '#3b82f6' : undefined} />;
    }
    return (
      <div className={`w-5 h-5 rounded-full bg-[var(--color-primary)] ${isSelected ? '' : 'opacity-40'}`} />
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
      <button
        onClick={handleMove}
        disabled={selectedIds.size === 0 || isMoving}
        className="px-5 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-secondary)] disabled:opacity-50 transition-colors"
      >
        {isMoving ? <LoadingSpinner size="sm" /> : t('move')}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('move_to')} size="sm" footer={footer} zIndex={1002}>
      <div className="min-h-[200px]">
        <p className="text-sm text-[var(--color-textSecondary)] mb-4 truncate">
          {cafeName}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500 text-sm">{error}</div>
        ) : (
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {sortedCollections.map(collection => {
              const alreadySaved = savedCollectionIds.has(collection.id);
              const isSelected = selectedIds.has(collection.id) || alreadySaved;
              const isSystemCollection = collection.icon_type === 'favourite' || collection.icon_type === 'save_later';

              return (
                <button
                  key={collection.id}
                  onClick={() => !alreadySaved && handleToggle(collection.id)}
                  disabled={alreadySaved}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-colors duration-150
                    ${isSelected
                      ? 'bg-[var(--color-primary)]/10'
                      : 'hover:bg-[var(--color-background)]'
                    }
                    ${alreadySaved ? 'opacity-50 cursor-not-allowed' : ''}
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
        )}
      </div>
    </Modal>
  );
}
