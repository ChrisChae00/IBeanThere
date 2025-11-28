'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductCardProps {
  title: string;
  description: string;
  price?: string;
  imageSrc?: string;
  tags?: string[];
  isComingSoon?: boolean;
}

export default function ProductCard({
  title,
  description,
  price,
  imageSrc,
  tags = [],
  isComingSoon = true,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-[var(--color-surface)] rounded-xl overflow-hidden shadow-[var(--ibean-shadow-soft)] hover:shadow-[var(--ibean-shadow-warm)] transition-all duration-300 border border-[var(--color-border)] flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-surface-hover)]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-textSecondary)]">
            <span className="text-4xl">☕</span>
          </div>
        )}
        
        {/* Overlay for Coming Soon */}
        {isComingSoon && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-[var(--color-background)] text-[var(--color-text)] px-4 py-2 rounded-full font-medium text-sm shadow-lg">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="text-xs font-medium px-2 py-1 rounded-md bg-[var(--color-surface-hover)] text-[var(--color-textSecondary)]"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-[var(--color-textSecondary)] mb-4 flex-grow line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--color-border)]">
          <span className="font-semibold text-[var(--color-text)]">
            {price || 'Coming Soon'}
          </span>
          <button 
            className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
            disabled={isComingSoon}
          >
            {isComingSoon ? 'Notify Me' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
