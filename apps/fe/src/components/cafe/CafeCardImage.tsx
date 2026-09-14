'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { GoogleCafePhoto } from '@/types/api';

interface CafeCardImageProps {
  imageUrl?: string;
  alt: string;
  size?: 'small' | 'large';
  googlePhoto?: GoogleCafePhoto | null;
  googlePhotoLoading?: boolean;
  locale?: string;
}

// Cafe rows carry arbitrary OSM `image` URLs, and next/image throws a runtime error on
// any host missing from next.config's remotePatterns. Keep this list in sync with it;
// anything else renders as a plain <img> and degrades to the placeholder on error.
const OPTIMIZED_IMAGE_HOSTS = [
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '').split('/')[0],
  'storage.googleapis.com',
  'commons.wikimedia.org',
].filter(Boolean);

function isOptimizable(url: string): boolean {
  if (url.startsWith('/')) return true;
  try {
    return OPTIMIZED_IMAGE_HOSTS.includes(new URL(url).host);
  } catch {
    return false;
  }
}

export default function CafeCardImage({
  imageUrl,
  alt,
  size = 'large',
  googlePhoto,
  googlePhotoLoading = false,
  locale = 'en',
}: CafeCardImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedImageUrl = imageUrl || googlePhoto?.image_url;
  const isGooglePhoto = !imageUrl && Boolean(googlePhoto);
  const showImage = resolvedImageUrl && !imageError;
  const useNextImage = !isGooglePhoto && Boolean(resolvedImageUrl && isOptimizable(resolvedImageUrl));

  useEffect(() => {
    setImageError(false);
    setIsLoaded(false);
  }, [resolvedImageUrl]);

  const height = size === 'small' ? 'h-full min-h-[180px]' : 'h-full min-h-[200px]';
  const fallbackIconSize = size === 'small' ? 'w-12 h-12 md:w-16 md:h-16' : 'w-16 h-16 md:w-20 md:h-20';
  /* Under a photo: a quiet ground for the letterboxing. Without one: the sunken
     surface, so an image-less card reads as an empty slot rather than a coloured tile. */
  const bgColor = showImage ? 'bg-surface-raised' : 'bg-surface-sunken';

  return (
    <div className={`w-full ${height} ${bgColor} flex items-center justify-center overflow-hidden shrink-0 relative`}>
      {(googlePhotoLoading || (showImage && !isLoaded)) && (
        <div className="absolute inset-0 bg-surface-hover animate-pulse" />
      )}
      {showImage ? (
        !useNextImage ? (
          <img
            src={resolvedImageUrl}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <Image
            src={resolvedImageUrl}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover object-center transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setImageError(true)}
          />
        )
      ) : !googlePhotoLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <img
            src="/icons/coffee-logo.svg"
            alt="Cafe logo"
            className={`${fallbackIconSize} ${size === 'large' ? 'opacity-60' : ''}`}
          />
        </div>
      ) : null}
      {isGooglePhoto && !imageError && googlePhoto?.source_url ? (
        <a
          href={googlePhoto.source_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={locale === 'ko' ? 'Google Maps에서 원본 사진 보기' : 'View original photo on Google Maps'}
          className="absolute bottom-0 right-0 z-30 flex min-h-11 min-w-11 items-end justify-end p-2 rounded-[var(--radius-pill)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink-on-media"
        >
          <span className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-[var(--radius-pill)] bg-scrim-media px-2 font-sans text-xs text-ink-on-media">
            Google Maps
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-current stroke-2">
              <path d="M6 3h7v7M13 3 5 11" />
              <path d="M11 9v4H3V5h4" />
            </svg>
          </span>
        </a>
      ) : null}
    </div>
  );
}
