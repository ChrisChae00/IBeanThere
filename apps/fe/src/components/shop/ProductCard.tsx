'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  title: string;
  description: string;
  price?: string;
  imageSrc?: string;
  /** i18n keys under shop.tags.*, e.g. 'tags.sustainable' */
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
  const t = useTranslations('shop');

  return (
    <div 
      className="group relative bg-surface rounded-xl overflow-hidden shadow-(--ibean-shadow-warm-sm) hover:shadow-(--ibean-shadow-warm-md) transition-all duration-300 border border-border flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface-hover">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/icons/coffee-logo.svg"
              alt={title}
              width={96}
              height={96}
              className="opacity-70"
            />
          </div>
        )}
        
        {/* Overlay for Coming Soon */}
        {isComingSoon && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-background text-text px-4 py-2 rounded-full font-medium text-sm shadow-lg">
              {t('product.coming_soon')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col grow">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="text-xs font-medium px-2 py-1 rounded-md bg-surface-hover text-textSecondary"
            >
              {t(`tags.${tag}` as any)}
            </span>
          ))}
        </div>
        
        <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-textSecondary mb-4 grow line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <span className="font-semibold text-text">
            {price || t('product.coming_soon')}
          </span>
          <button 
            className="text-sm font-medium text-primary hover:text-secondary transition-colors"
            disabled={isComingSoon}
          >
            {isComingSoon ? t('product.notify_me') : t('product.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}
