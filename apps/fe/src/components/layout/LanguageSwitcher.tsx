'use client';

import { usePathname } from 'next/navigation';
import { locales } from '@/i18n/request';
import { useEffect, useRef } from 'react';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const selectRef = useRef<HTMLSelectElement>(null);
  
  const currentLocale = pathname.split('/')[1] || 'en';
  
  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');
    window.location.href = newPathname;
  };

  const languageNames: Record<string, string> = {
    en: 'English',
    ko: '한국어'
  };

  useEffect(() => {
    if (selectRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.font = '14px system-ui, -apple-system, sans-serif';
        const width = context.measureText(languageNames[currentLocale]).width;
        selectRef.current.style.width = `${width + 54}px`;
      }
    }
  }, [currentLocale, languageNames]);

  return (
    <div className="relative inline-block bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-primary)] transition-colors group">
      <svg 
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text)] group-hover:text-[var(--color-primaryText)] pointer-events-none transition-colors" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
      
      <select
        ref={selectRef}
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-transparent text-[var(--color-text)] group-hover:text-[var(--color-primaryText)] text-sm font-medium cursor-pointer focus:outline-none border-none pl-7 pr-[18px] py-2 leading-normal appearance-none transition-colors"
        aria-label="Select language"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {languageNames[locale] || locale.toUpperCase()}
          </option>
        ))}
      </select>
      <svg 
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text)] group-hover:text-[var(--color-primaryText)] pointer-events-none transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

