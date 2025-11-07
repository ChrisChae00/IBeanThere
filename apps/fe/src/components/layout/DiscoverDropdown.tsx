'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface DiscoverDropdownProps {
  locale: string;
}

export default function DiscoverDropdown({ locale }: DiscoverDropdownProps) {
  const t = useTranslations('navigation');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors min-h-[44px] px-2"
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
        <div className="absolute left-0 mt-2 w-48 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg z-50">
          <div className="py-1">
            <Link
              href={`/${locale}/discover/explore-map`}
              className="flex items-center px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {t('explore_map')}
            </Link>
            
            <Link
              href={`/${locale}/discover/pending-spots`}
              className="flex items-center px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('pending_spots')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

