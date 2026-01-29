'use client';

import { useState } from 'react';

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
  
  if (size === 'small') {
    return (
      <div className={`w-full h-[180px] ${showImage ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-accent)]'} flex items-center justify-center overflow-hidden flex-shrink-0 relative`}>
        {/* Blur placeholder while loading */}
        {showImage && !isLoaded && (
          <div className="absolute inset-0 bg-[var(--color-surface)] animate-pulse" />
        )}
        {showImage ? (
          <img 
            src={imageUrl} 
            alt={alt}
            loading="lazy"
            className={`w-full h-full object-cover object-center transition-opacity duration-300 bg${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <img 
            src="/icons/coffee-logo.svg" 
            alt="Cafe logo"
            className="w-12 h-12 md:w-16 md:h-16"
          />
        )}
      </div>
    );
  }
  
  return (
    <div className={`w-full h-[200px] aspect-[4/3] ${showImage ? 'bg-[var(--color-surface)]/50' : 'bg-[var(--color-accent)]'} flex items-center justify-center overflow-hidden relative flex-shrink-0`}>
      {/* Blur placeholder while loading */}
      {showImage && !isLoaded && (
        <div className="absolute inset-0 bg-[var(--color-surface)] animate-pulse" />
      )}
      {showImage ? (
        <img 
          src={imageUrl} 
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
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
            className="w-16 h-16 md:w-20 md:h-20 opacity-60"
          />
        </div>
      )}
    </div>
  );
}
