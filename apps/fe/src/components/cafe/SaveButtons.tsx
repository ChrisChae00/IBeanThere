'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { HeartIcon, BookmarkIcon } from '@/shared/ui';
import { toggleFavourite, toggleSaveForLater, getCafeSaveStatus } from '@/lib/api/collections';
import { isAuthError } from '@/lib/api/client';
import type { CafeSaveStatus } from '@/types/api';

interface SaveButtonsProps {
  cafeId: string;
  initialStatus?: CafeSaveStatus;
  onOpenCollectionSelector?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /*
    Bumped when something outside these buttons has changed what is saved — closing the
    list picker, above all. Without it the bookmark keeps the state it had when it
    opened the picker, so un-ticking every list there left a filled bookmark on a cafe
    saved nowhere.
  */
  syncToken?: number;
}

/*
  Two controls, not three. Saving used to be a bookmark *and* a separate
  "add to collection" button, which asked the reader to decide which kind of saving
  they meant before they had saved anything.

  Now the bookmark is the whole gesture: one press files the cafe under "Saved for
  later" and opens the list picker on top of that. Choosing another list moves it
  there — the default is not left behind as a second copy — and closing the picker
  without choosing leaves it saved. Pressing it again reopens the picker; unfiling is
  done by unticking there, where the reader can see what they are removing.

  The heart is a separate mark, not a filing, and nothing here touches it: a place you
  like stays liked whether or not it is in any list.
*/
export default function SaveButtons({
  cafeId,
  initialStatus,
  onOpenCollectionSelector,
  size = 'md',
  className = '',
  syncToken = 0,
}: SaveButtonsProps) {
  const t = useTranslations('collections');
  
  const [isFavourited, setIsFavourited] = useState(initialStatus?.is_favourited ?? false);
  const [isSaved, setIsSaved] = useState(initialStatus?.is_saved ?? false);
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(!initialStatus);
  const [error, setError] = useState<string | null>(null);

  // Fetch on mount, and again whenever `syncToken` says the state is stale.
  useEffect(() => {
    if (initialStatus && syncToken === 0) {
      setIsFetching(false);
      return;
    }


    const fetchStatus = async () => {
      try {
        /*
          The session is read straight from the Supabase client — a local cookie read —
          rather than waiting on the auth context, whose `isLoading` only clears after
          it has also fetched the user's profile from the backend. Waiting for that put
          a second round trip in front of this one, and a saved cafe showed an empty
          bookmark for the whole of it.
        */
        const { createClient } = await import('@/shared/lib/supabase/client');
        const { data: { session } } = await createClient().auth.getSession();

        if (!session) {
          setIsFavourited(false);
          setIsSaved(false);
          return;
        }

        const status = await getCafeSaveStatus(cafeId);
        setIsFavourited(status.is_favourited);
        setIsSaved(status.is_saved);
      } catch (err) {
        // Silently fail - user may not be authenticated
        if (!isAuthError(err)) {
          console.error('Failed to fetch save status:', err);
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchStatus();
  }, [cafeId, initialStatus, syncToken]);

  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 24;
  
  const buttonBaseClass = `
    flex items-center justify-center rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2
  `;
  
  const buttonSizeClass = size === 'sm' 
    ? 'p-1.5' 
    : size === 'lg' 
    ? 'p-3' 
    : 'p-2';

  const handleFavouriteClick = useCallback(async () => {
    if (isQuickSaving) return;

    setIsQuickSaving(true);
    setError(null);

    // Optimistic update
    setIsFavourited(prev => !prev);

    try {
      await toggleFavourite(cafeId);
    } catch (err) {
      // Revert on error
      setIsFavourited(prev => !prev);
      if (isAuthError(err)) {
        setError('login_required');
      } else {
        setError('save_failed');
      }
    } finally {
      setIsQuickSaving(false);
    }
  }, [cafeId, isQuickSaving]);

  const handleSaveClick = useCallback(async () => {
    if (isQuickSaving) return;

    setIsQuickSaving(true);
    setError(null);

    /*
      A filled bookmark opens the picker rather than unsaving. Unsaving from here would
      have to guess what the reader meant — clear the default list, or every list the
      cafe is filed in — and either guess throws away filing they did on purpose. The
      picker shows them what is ticked and lets them untick it.
    */
    if (isSaved) {
      setIsQuickSaving(false);
      onOpenCollectionSelector?.();
      return;
    }

    setIsSaved(true);

    try {
      await toggleSaveForLater(cafeId);
      // The picker opens on top of a save that has already happened.
      onOpenCollectionSelector?.();
    } catch (err) {
      setIsSaved(false);
      if (isAuthError(err)) {
        setError('login_required');
      } else {
        setError('save_failed');
      }
    } finally {
      setIsQuickSaving(false);
    }
  }, [cafeId, isQuickSaving, isSaved, onOpenCollectionSelector]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Favourite Button */}
      <button
        onClick={handleFavouriteClick}
        disabled={isQuickSaving}
        className={`${buttonBaseClass} ${buttonSizeClass} ${
          isFavourited 
            ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
            : 'text-textSecondary hover:text-red-500 hover:bg-red-50'
        }`}
        title={isFavourited ? t('remove_favourite') : t('add_favourite')}
        aria-label={isFavourited ? t('remove_favourite') : t('add_favourite')}
      >
        <HeartIcon 
          filled={isFavourited} 
          size={iconSize}
          color={isFavourited ? '#ef4444' : undefined}
        />
      </button>

      {/* Save for Later Button */}
      <button
        onClick={handleSaveClick}
        disabled={isQuickSaving}
        className={`${buttonBaseClass} ${buttonSizeClass} ${
          isSaved 
            ? 'text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100' 
            : 'text-textSecondary hover:text-blue-500 hover:bg-blue-50'
        }`}
        title={isSaved ? t('edit_saved') : t('save_later')}
        aria-label={isSaved ? t('edit_saved') : t('save_later')}
      >
        <BookmarkIcon 
          filled={isSaved} 
          size={iconSize}
          color={isSaved ? '#3b82f6' : undefined}
        />
      </button>

      {/* Error tooltip */}
      {error && (
        <span className="text-xs text-red-500 ml-2">
          {t(error)}
        </span>
      )}
    </div>
  );
}
