'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ImageGalleryPreviewProps } from '@/types/gallery';

export default function ImageGalleryPreview({
  images,
  maxDisplay = 5,
  onImageClick,
  onViewAllClick,
  className = ''
}: ImageGalleryPreviewProps) {
  const t = useTranslations('gallery');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) {
    return null;
  }

  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  const handleImageError = (index: number) => {
    setErrorImages((prev) => new Set(prev).add(index));
  };

  // Layout based on number of images
  const getGridClasses = () => {
    switch (displayImages.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-3 grid-rows-2';
    }
  };

  const getItemClasses = (index: number, total: number) => {
    // First image is larger when we have 5 images
    if (total >= 5 && index === 0) {
      return 'col-span-2 row-span-2';
    }
    return '';
  };

  return (
    <div className={`${className}`}>
      <div className={`grid ${getGridClasses()} gap-2 rounded-xl overflow-hidden`}>
        {displayImages.map((image, index) => {
          const isLast = index === displayImages.length - 1 && remainingCount > 0;
          const hasError = errorImages.has(index);
          const isLoaded = loadedImages.has(index);

          return (
            <div
              key={index}
              className={`relative aspect-square cursor-pointer overflow-hidden bg-[var(--color-surface)] ${getItemClasses(index, displayImages.length)}`}
              onClick={() => onImageClick?.(index)}
            >
              {/* Loading placeholder */}
              {!isLoaded && !hasError && (
                <div className="absolute inset-0 animate-pulse bg-[var(--color-surface)]" />
              )}

              {/* Error state */}
              {hasError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]">
                  <svg className="w-8 h-8 text-[var(--color-textSecondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <img
                  src={image.url}
                  alt={image.alt || `Photo ${index + 1}`}
                  className={`w-full h-full object-cover transition-all duration-300 hover:scale-105 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                />
              )}

              {/* "View more" overlay on last image */}
              {isLast && (
                <div
                  className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewAllClick?.();
                  }}
                >
                  <span className="text-white text-lg font-semibold">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All button */}
      {images.length > 1 && onViewAllClick && (
        <button
          onClick={onViewAllClick}
          className="mt-3 w-full py-2.5 px-4 text-sm font-medium text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {t('all_photos')} ({images.length})
        </button>
      )}
    </div>
  );
}
