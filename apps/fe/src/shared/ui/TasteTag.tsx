'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import type { TasteTag as TasteTagType } from '@/types/api';

export interface TasteTagProps {
  tag: TasteTagType;
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
}

/*
  One of the eight things a person says they like in a coffee.

  It is a label, not a control and not a claim, so it draws a rule and takes no fill:
  the 10% brand wash it used to sit in read as a chosen state, which is what the brand
  fill means everywhere else in the app. `TasteTagSelector` is where a tag *is* chosen,
  and there it is a `control-flat` pill like every other group of choices.
*/

const sizeClasses = {
  sm: 'text-xs px-2.5 py-1',
  md: 'text-sm px-3 py-1.5',
} as const;

export default function TasteTag({ tag, size = 'sm', removable = false, onRemove }: TasteTagProps) {
  const t = useTranslations('profile.taste_tags');
  const tagLabel = t(tag);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-(--radius-pill) border border-edge-default font-medium text-ink-secondary ${sizeClasses[size]} ${removable ? 'pr-1.5' : ''}`}
    >
      <span aria-hidden="true" className="text-ink-secondary/70">
        #
      </span>
      <span>{tagLabel}</span>

      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-(--radius-pill) p-0.5 text-ink-secondary hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label={`Remove ${tagLabel}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
