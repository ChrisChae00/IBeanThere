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
  const showImage = imageUrl && !imageError;
  
  if (size === 'small') {
    return (
      <div className="w-full h-[120px] bg-[var(--color-primary)] rounded-lg flex items-center justify-center overflow-hidden mb-3 flex-shrink-0">
        {showImage ? (
          <img 
            src={imageUrl} 
            alt={alt}
            className="w-full h-full object-cover"
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
    <div className="w-full h-[200px] aspect-[4/3] bg-[var(--color-surface)]/50 flex items-center justify-center overflow-hidden relative flex-shrink-0">
      {showImage ? (
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-full h-full object-cover"
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

