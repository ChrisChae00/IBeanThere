'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { NavigationApp, getNavigationApps, openNavigation } from '@/lib/utils/navigation';

interface NavigationButtonProps {
  latitude: number;
  longitude: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function NavigationButton({
  latitude,
  longitude,
  size = 'md',
  className = '',
}: NavigationButtonProps) {
  const t = useTranslations('cafe.navigation');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Close on escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleAppClick = (appId: NavigationApp) => {
    openNavigation(latitude, longitude, appId);
    setIsOpen(false);
  };

  const buttonPadding = size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  const apps = getNavigationApps();

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 bg-[var(--color-surface)] text-[var(--color-cardText)] hover:bg-[var(--color-surfaceHover)] border border-[var(--color-border)] rounded-lg transition-colors font-medium ${buttonPadding} ${fontSize}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span>{t('get_directions')}</span>
        <svg
          className={`${iconSize} transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-[var(--color-cardBackground)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden z-[1050]">
          <ul className="py-1" role="menu">
            {apps.map((app) => (
              <li key={app.id} role="none">
                <button
                  onClick={() => handleAppClick(app.id)}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--color-cardText)] hover:bg-[var(--color-surfaceHover)] transition-colors flex items-center gap-2"
                  role="menuitem"
                >
                  <span>{t(app.labelKey)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
