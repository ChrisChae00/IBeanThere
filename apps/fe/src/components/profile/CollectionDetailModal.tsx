'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Menu } from '@base-ui/react/menu';
import { Coffee, MoreVertical } from 'lucide-react';
import { Button, HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/base/dialog';

import {
  getCollectionDetail,
  removeCafeFromAllCollections,
  removeCafeFromCollection,
} from '@/lib/api/collections';
import { getCafePath } from '@/lib/utils/slug';
import type { Collection, CollectionDetail, CollectionItem } from '@/types/api';
import CafeMoveToModal from './CafeMoveToModal';

interface CollectionDetailModalProps {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (collectionId: string) => Promise<void>;
  onUpdate?: (collectionId: string, data: { name?: string }) => Promise<void>;
  onShare?: (collectionId: string) => Promise<string>;
  onNavigateToCafe?: (path: string) => void;
  isOwnProfile?: boolean;
  onItemCountChange?: (collectionId: string, delta: number) => void;
  /*
    A collection made from inside the move-to modal. It has to travel back up to the
    section that owns the list, or it exists on the server and nowhere on screen until
    the page is loaded again.
  */
  onCollectionCreated?: (collection: Collection) => void;
}

/*
  One collection, and what can be done to the cafes in it.

  What this replaces was a `fixed inset-0` div with `onClick={onClose}` on it. Two things
  followed from that, and both of them were reported as the feature simply not working.
  The move-to modal is rendered from here, so although Base UI portals it to the body it
  is still this component's child in the React tree -- and React bubbles events through
  the tree, not the DOM. Every click inside the move-to modal therefore reached that
  backdrop handler and closed the whole stack: picking a collection did nothing, and
  "create new collection" dismissed everything without creating anything.

  The row menu was the second: an absolutely positioned div inside the list, which is a
  `max-h` scroll box, so the menu was clipped by it and could only be seen by scrolling
  the list down to it. It is a Base UI menu now, portalled out and ranked above both
  modals, so it opens over the panel where the finger already is.
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
  onItemCountChange,
  onCollectionCreated,
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

  const [moveModalItem, setMoveModalItem] = useState<CollectionItem | null>(null);
  /*
    Taking a cafe out of every collection it is in cannot be undone from here, so it is
    asked before it is done. Removing it from this one collection is not: the cafe is
    still saved wherever else it was, and the move-to modal puts it back in a press.
  */
  const [removeAllItem, setRemoveAllItem] = useState<CollectionItem | null>(null);
  const [isRemovingAll, setIsRemovingAll] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        setDetail(await getCollectionDetail(collection.id));
      } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      setError(t('load_failed'));
      setIsDeleting(false);
    }
  }, [collection.id, onDelete, isDeleting, t]);

  const handleRemoveEverywhere = useCallback(async () => {
    if (!removeAllItem || isRemovingAll) return;

    setIsRemovingAll(true);
    try {
      const removedFrom = await removeCafeFromAllCollections(removeAllItem.cafe_id);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((item) => item.cafe_id !== removeAllItem.cafe_id),
              item_count: prev.item_count - 1,
            }
          : null,
      );
      removedFrom.forEach((id) => onItemCountChange?.(id, -1));
      setRemoveAllItem(null);
    } catch {
      setError(t('load_failed'));
    } finally {
      setIsRemovingAll(false);
    }
  }, [removeAllItem, isRemovingAll, onItemCountChange, t]);

  const handleRemoveCafe = useCallback(
    async (cafeId: string) => {
      try {
        await removeCafeFromCollection(collection.id, cafeId);
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((item) => item.cafe_id !== cafeId),
                item_count: prev.item_count - 1,
              }
            : null,
        );
        onItemCountChange?.(collection.id, -1);
      } catch {
        setError(t('load_failed'));
      }
    },
    [collection.id, t, onItemCountChange],
  );

  const collectionIcon =
    collection.icon_type === 'favourite' ? (
      <HeartIcon filled size={24} className="text-collection-favourite" />
    ) : collection.icon_type === 'save_later' ? (
      <BookmarkIcon filled size={24} className="text-collection-saved" />
    ) : (
      <span className="block h-6 w-6 rounded-(--radius-pill) bg-brand" />
    );

  const isSystemCollection =
    collection.icon_type === 'favourite' || collection.icon_type === 'save_later';

  const collectionName = isSystemCollection ? t(collection.icon_type) : collection.name;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="z-(--z-modal) rounded-(--radius-card) border-edge-rule bg-surface-raised p-6 sm:max-w-2xl"
      >
        <div className="flex items-center gap-3 border-b border-edge-rule pb-4">
          <span className="shrink-0">{collectionIcon}</span>

          {isEditing && !isSystemCollection ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-(--input-height) flex-1 rounded-(--input-radius) border border-edge-default bg-surface-raised px-3 text-lg font-semibold text-ink-primary outline-none focus-visible:border-brand"
              autoFocus
            />
          ) : (
            <div className="min-w-0 flex-1">
              {/* The name is data, so it takes the body face rather than the display serif. */}
              <DialogTitle className="truncate font-sans text-lg font-semibold text-ink-primary">
                {collectionName}
              </DialogTitle>
              <p className="landing-micro mt-1 text-ink-secondary">
                {t('cafes', { count: detail?.item_count ?? collection.item_count ?? 0 })}
              </p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-ink-primary">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-(--radius-pill) bg-state-danger"
            />
            {error}
          </p>
        ) : detail?.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-secondary">{t('empty_hint')}</p>
        ) : (
          <div className="scrollbar-quiet max-h-[400px] space-y-1 overflow-y-auto">
            {detail?.items.map((item) => (
              <div key={item.id} className="menu-item group gap-3 py-2">
                <div
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                  onClick={() => {
                    const path = getCafePath({ id: item.cafe_id, slug: item.cafe_slug }, locale);
                    if (onNavigateToCafe) {
                      onNavigateToCafe(path);
                    } else {
                      window.location.href = path;
                    }
                  }}
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-(--radius-control) bg-surface-sunken">
                    {item.cafe_main_image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.cafe_main_image}
                        alt={item.cafe_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-ink-secondary">
                        <Coffee className="h-5 w-5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-sans text-base font-medium text-ink-primary">
                      {item.cafe_name}
                    </h3>
                    {item.cafe_address && (
                      <p className="truncate text-sm text-ink-secondary">{item.cafe_address}</p>
                    )}
                  </div>
                </div>

                {isOwnProfile && (
                  <Menu.Root>
                    <Menu.Trigger
                      aria-label={t('more_options')}
                      className="nav-pill flex h-11 w-11 shrink-0 items-center justify-center text-ink-secondary"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Menu.Trigger>

                    {/*
                      Portalled to the body, and it has to be. The panel centres itself
                      with a translate, and a transformed element becomes the containing
                      block for `fixed` descendants -- a menu portalled into it is placed
                      against the panel's own box and lands half a screen away from the
                      row that opened it.
                    */}
                    <Menu.Portal>
                      {/*
                        Placed against the viewport rather than the row, because the row
                        sits in that scroll box: an absolutely placed menu would be
                        offset by the scroll and cut off at its edge.
                      */}
                      <Menu.Positioner
                        side="bottom"
                        align="end"
                        sideOffset={4}
                        positionMethod="fixed"
                        collisionPadding={8}
                        className="z-(--z-modal-popover)"
                      >
                        <Menu.Popup className="menu-panel min-w-40 motion-slide-up">
                          <Menu.Item
                            className="menu-item outline-hidden"
                            onClick={() => setMoveModalItem(item)}
                          >
                            {t('move_to')}
                          </Menu.Item>
                          {/*
                            Two removals, because they are two different sizes of action
                            and one word was covering both. Taking the cafe out of this
                            list leaves it saved everywhere else; taking the cafe out
                            clears it from every collection at once, so that one asks
                            first.
                          */}
                          <Menu.Item
                            className="menu-item text-state-danger outline-hidden"
                            onClick={() => handleRemoveCafe(item.cafe_id)}
                          >
                            {t('remove_from_collection')}
                          </Menu.Item>
                          <Menu.Item
                            className="menu-item text-state-danger outline-hidden"
                            onClick={() => setRemoveAllItem(item)}
                          >
                            {t('remove_everywhere')}
                          </Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                )}
              </div>
            ))}
          </div>
        )}

        {removeAllItem && (
          <div className="flex flex-wrap items-center gap-3 border-t border-edge-rule pt-4">
            <p className="flex-1 text-sm text-ink-primary">
              {t('remove_everywhere_confirm')}
            </p>
            {/*
              A dot in the danger colour beside an ink label, not a red plate.
              `variant="danger"` paints a 10% tint and sets the label in `--state-danger`
              on top of it, which is the pairing this system measured at 2.4-3.5:1 and
              ruled out: the state colour is emphasis, never the text colour.
            */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<span aria-hidden="true" className="block h-1.5 w-1.5 rounded-(--radius-pill) bg-state-danger" />}
              onClick={handleRemoveEverywhere}
              disabled={isRemovingAll}
            >
              {isRemovingAll ? <LoadingSpinner size="sm" /> : t('remove_everywhere')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRemoveAllItem(null)}>
              {t('cancel')}
            </Button>
          </div>
        )}

        {isOwnProfile && !removeAllItem && (
          <div className="flex flex-wrap items-center gap-2 border-t border-edge-rule pt-4">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={isSaving || !editName.trim()}>
                  {isSaving ? <LoadingSpinner size="sm" /> : t('save')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(collection.name);
                  }}
                >
                  {t('cancel')}
                </Button>
              </>
            ) : showDeleteConfirm ? (
              <>
                <span className="text-sm text-ink-primary">{t('delete_confirm')}</span>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<span aria-hidden="true" className="block h-1.5 w-1.5 rounded-(--radius-pill) bg-state-danger" />}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <LoadingSpinner size="sm" /> : t('delete')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  {t('cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleShare} disabled={shareLoading}>
                  {shareLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : shareCopied ? (
                    t('share_link_copied')
                  ) : (
                    t('share')
                  )}
                </Button>

                {!isSystemCollection && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      {t('edit')}
                    </Button>
                    {/*
                      Plain, not danger-coloured: `control-flat` sets the label colour of
                      every non-filled button, so a `text-` utility here loses to it, and
                      the confirm step is what carries the weight anyway. The row menu's
                      Remove is the exception on record -- `.menu-item` leaves its colour
                      to the call site, which is how the log out row takes danger too.
                    */}
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                      {t('delete')}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>

      {moveModalItem && (
        <CafeMoveToModal
          isOpen={!!moveModalItem}
          onClose={() => setMoveModalItem(null)}
          cafeId={moveModalItem.cafe_id}
          cafeName={moveModalItem.cafe_name}
          currentCollectionId={collection.id}
          onCollectionCreated={onCollectionCreated}
          onMoveComplete={(targetCollectionIds) => {
            setDetail((prev) =>
              prev
                ? {
                    ...prev,
                    items: prev.items.filter((i) => i.cafe_id !== moveModalItem.cafe_id),
                    item_count: prev.item_count - 1,
                  }
                : null,
            );
            onItemCountChange?.(collection.id, -1);
            targetCollectionIds.forEach((id) => onItemCountChange?.(id, 1));
            setMoveModalItem(null);
          }}
        />
      )}
    </Dialog>
  );
}
