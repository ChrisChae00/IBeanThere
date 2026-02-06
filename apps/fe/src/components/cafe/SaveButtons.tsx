'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { HeartIcon, BookmarkIcon, AddToCollectionIcon } from '@/shared/ui';
import { toggleFavourite, toggleSaveForLater, getCafeSaveStatus } from '@/lib/api/collections';
import type { CafeSaveStatus } from '@/types/api';

interface SaveButtonsProps {
  cafeId: string;
  initialStatus?: CafeSaveStatus;
  onOpenCollectionSelector?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * SaveButtons component for cafe detail page.
 * Contains Favourite, Save for Later, and Add to Collection buttons.
 */
export default function SaveButtons({
  cafeId,
  initialStatus,
  onOpenCollectionSelector,
  size = 'md',
  className = '',
}: SaveButtonsProps) {
  const t = useTranslations('collections');
  
  const [isFavourited, setIsFavourited] = useState(initialStatus?.is_favourited ?? false);
  const [isSaved, setIsSaved] = useState(initialStatus?.is_saved ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 24;
  
  const buttonBaseClass = `
    flex items-center justify-center rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
  `;
  
  const buttonSizeClass = size === 'sm' 
    ? 'p-1.5' 
    : size === 'lg' 
    ? 'p-3' 
    : 'p-2';

  const handleFavouriteClick = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    // Optimistic update
    setIsFavourited(prev => !prev);
    
    try {
      await toggleFavourite(cafeId);
    } catch (err) {
      // Revert on error
      setIsFavourited(prev => !prev);
      if (err instanceof Error && err.message === 'NOT_AUTHENTICATED') {
        setError('login_required');
      } else {
        setError('save_failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, [cafeId, isLoading]);

  const handleSaveClick = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    // Optimistic update
    setIsSaved(prev => !prev);
    
    try {
      await toggleSaveForLater(cafeId);
    } catch (err) {
      // Revert on error
      setIsSaved(prev => !prev);
      if (err instanceof Error && err.message === 'NOT_AUTHENTICATED') {
        setError('login_required');
      } else {
        setError('save_failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, [cafeId, isLoading]);

  const handleAddToCollection = useCallback(() => {
    if (onOpenCollectionSelector) {
      onOpenCollectionSelector();
    }
  }, [onOpenCollectionSelector]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Favourite Button */}
      <button
        onClick={handleFavouriteClick}
        disabled={isLoading}
        className={`${buttonBaseClass} ${buttonSizeClass} ${
          isFavourited 
            ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
            : 'text-[var(--color-textSecondary)] hover:text-red-500 hover:bg-red-50'
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
        disabled={isLoading}
        className={`${buttonBaseClass} ${buttonSizeClass} ${
          isSaved 
            ? 'text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100' 
            : 'text-[var(--color-textSecondary)] hover:text-blue-500 hover:bg-blue-50'
        }`}
        title={isSaved ? t('remove_save') : t('save_later')}
        aria-label={isSaved ? t('remove_save') : t('save_later')}
      >
        <BookmarkIcon 
          filled={isSaved} 
          size={iconSize}
          color={isSaved ? '#3b82f6' : undefined}
        />
      </button>

      {/* Add to Collection Button */}
      {onOpenCollectionSelector && (
        <button
          onClick={handleAddToCollection}
          disabled={isLoading}
          className={`${buttonBaseClass} ${buttonSizeClass} text-[var(--color-textSecondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10`}
          title={t('add_to_collection')}
          aria-label={t('add_to_collection')}
        >
          <AddToCollectionIcon size={iconSize} />
        </button>
      )}

      {/* Error tooltip */}
      {error && (
        <span className="text-xs text-red-500 ml-2">
          {t(error)}
        </span>
      )}
    </div>
  );
}
