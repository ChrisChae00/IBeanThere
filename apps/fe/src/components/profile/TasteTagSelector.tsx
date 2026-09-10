'use client';

import { useTranslations } from 'next-intl';
import { TasteTag as TasteTagType } from '@/types/api';

const ALL_TASTE_TAGS: TasteTagType[] = [
  'bean_hunter',
  'origin_chaser',
  'filter_first',
  'roaster_pilgrim',
  'light_roast',
  'dark_roast',
  'quiet_corner',
  'work_friendly',
  'sweet_tooth',
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
        <label className="block text-sm font-medium text-ink-primary">
          {t('taste_tags_label')}
        </label>
        <span className="text-xs text-ink-secondary">
          {selectedTags.length}/{maxTags}
        </span>
      </div>
      
      <p className="text-xs text-ink-secondary">
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
              aria-pressed={isSelected}
              className={`control-flat inline-flex items-center gap-1 rounded-(--radius-pill) px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected ? 'is-active' : ''
              }`}
            >
              {/* No tick beside the label: the brand fill is what "chosen" means on
                  every other group of controls in the app, and a mark on top of it
                  says the same thing twice while making the pill jump a few pixels
                  wider the moment it is picked. `aria-pressed` carries it for a
                  reader who cannot see the fill. */}
              <span aria-hidden="true" className="opacity-70">#</span>
              {t(`taste_tags.${tag}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
