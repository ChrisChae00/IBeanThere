'use client';

import { useTranslations } from 'next-intl';
import { TasteTag as TasteTagType } from '@/types/api';
import { TasteTag } from '@/shared/ui';

const ALL_TASTE_TAGS: TasteTagType[] = [
  'acidic',
  'full_body',
  'light_roast',
  'dessert_lover',
  'work_friendly',
  'cozy',
  'roastery',
  'specialty',
];

export interface TasteTagSelectorProps {
  selectedTags: TasteTagType[];
  onChange: (tags: TasteTagType[]) => void;
  maxTags?: number;
}

export default function TasteTagSelector({
  selectedTags,
  onChange,
  maxTags = 5,
}: TasteTagSelectorProps) {
  const t = useTranslations('profile');
  
  const handleTagClick = (tag: TasteTagType) => {
    if (selectedTags.includes(tag)) {
      // Remove tag
      onChange(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < maxTags) {
      // Add tag
      onChange([...selectedTags, tag]);
    }
  };
  
  const isMaxReached = selectedTags.length >= maxTags;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--color-text)]">
          {t('taste_tags_label')}
        </label>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {selectedTags.length}/{maxTags}
        </span>
      </div>
      
      <p className="text-xs text-[var(--color-text-secondary)]">
        {t('select_taste_tags')}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {ALL_TASTE_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isDisabled = !isSelected && isMaxReached;
          
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              disabled={isDisabled}
              className={`
                inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 border
                ${isSelected
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : isDisabled
                    ? 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] opacity-50 cursor-not-allowed'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                }
              `}
            >
              <span className="opacity-70">#</span>
              {t(`taste_tags.${tag}`)}
              {isSelected && (
                <svg className="w-3.5 h-3.5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
