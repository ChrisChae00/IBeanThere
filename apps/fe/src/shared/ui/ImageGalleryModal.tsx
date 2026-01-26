'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import type { ImageGalleryModalProps, GalleryImage } from '@/types/gallery';
import ImageLightbox from './ImageLightbox';

export default function ImageGalleryModal({
  images,
  isOpen,
  onClose,
  onImageClick,
  title
}: ImageGalleryModalProps) {
  const t = useTranslations('gallery');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useState(() => {
    setMounted(true);
  });

  if (!mounted) {
    // SSR guard
    if (typeof window === 'undefined') return null;
    setMounted(true);
  }

  if (!isOpen || images.length === 0) {
    return null;
  }

  const handleImageClick = (index: number) => {
    if (onImageClick) {
      onImageClick(index);
    } else {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[1500] bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-[var(--color-cardBackground)] rounded-2xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-cardBackground)] rounded-t-2xl">
            <h2 className="text-lg font-semibold text-[var(--color-cardText)]">
              {title || t('all_photos')} ({images.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-surface)] transition-colors"
              aria-label={t('close')}
            >
              <svg className="w-5 h-5 text-[var(--color-cardText)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image Grid */}
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-[var(--color-surface)] group"
                  onClick={() => handleImageClick(index)}
                >
                  {/* Loading placeholder */}
                  {!loadedImages.has(index) && (
                    <div className="absolute inset-0 animate-pulse bg-[var(--color-surface)]" />
                  )}
                  <img
                    src={image.url}
                    alt={image.alt || `Photo ${index + 1}`}
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                      loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(index)}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>,
    document.body
  );
}
