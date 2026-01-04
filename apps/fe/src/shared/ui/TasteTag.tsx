'use client';

import { useTranslations } from 'next-intl';
import type { TasteTag as TasteTagType } from '@/types/api';

export interface TasteTagProps {
  tag: TasteTagType;
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export default function TasteTag({ 
  tag, 
  size = 'sm', 
  removable = false,
  onRemove 
}: TasteTagProps) {
  const t = useTranslations('profile.taste_tags');
  
  // Get localized tag name
  const tagLabel = t(tag);
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-medium rounded-full
        bg-[var(--color-primary)]/10 text-[var(--color-primary)]
        border border-[var(--color-primary)]/20
        transition-all duration-150
        ${removable ? 'pr-1' : ''}
        ${sizeClasses[size]}
      `}
    >
      <span className="opacity-70">#</span>
      <span>{tagLabel}</span>
      
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="
            ml-0.5 p-0.5 rounded-full
            hover:bg-[var(--color-primary)]/20
            focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]
            transition-colors
          "
          aria-label={`Remove ${tagLabel}`}
        >
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      )}
    </span>
  );
}
