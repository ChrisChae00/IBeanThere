'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface DiscoverDropdownProps {
  locale: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function DiscoverDropdown({ locale, onMouseEnter, onMouseLeave }: DiscoverDropdownProps) {
  const t = useTranslations('navigation');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div 
      className="relative"
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors min-h-[44px] px-2 flex items-center gap-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{t('discover')}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-48 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg z-50">
          <div className="py-1">
            <Link
              href={`/${locale}/discover/explore-map`}
              className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('explore_map')}
            </Link>
            <Link
              href={`/${locale}/discover/pending-spots`}
              className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('pending_spots')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

