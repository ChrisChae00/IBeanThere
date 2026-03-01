'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CafeCardImageProps {
  imageUrl?: string;
  alt: string;
  size?: 'small' | 'large';
}

export default function CafeCardImage({
  imageUrl,
  alt,
  size = 'large'
}: CafeCardImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const showImage = imageUrl && !imageError;

  const height = size === 'small' ? 'h-full min-h-[180px]' : 'h-full min-h-[200px]';
  const fallbackIconSize = size === 'small' ? 'w-12 h-12 md:w-16 md:h-16' : 'w-16 h-16 md:w-20 md:h-20';
  const bgColor = showImage
    ? size === 'small' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface)]/50'
    : 'bg-[var(--color-accent)]';

  return (
    <div className={`w-full ${height} ${bgColor} flex items-center justify-center overflow-hidden flex-shrink-0 relative`}>
      {showImage && !isLoaded && (
        <div className="absolute inset-0 bg-[var(--color-surface)] animate-pulse" />
      )}
      {showImage ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover object-center transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <img
            src="/icons/coffee-logo.svg"
            alt="Cafe logo"
            className={`${fallbackIconSize} ${size === 'large' ? 'opacity-60' : ''}`}
          />
        </div>
      )}
    </div>
  );
}
