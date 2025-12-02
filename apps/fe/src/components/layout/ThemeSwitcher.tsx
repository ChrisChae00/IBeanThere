'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useRef } from 'react';

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (selectRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.font = '14px system-ui, -apple-system, sans-serif';
        const width = context.measureText(currentTheme.displayName).width;
        selectRef.current.style.width = `${width + 36}px`;
      }
    }
  }, [currentTheme.displayName]);

  return (
    <div className="relative inline-block bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-primary)] transition-colors group">
      <select 
        ref={selectRef}
        value={currentTheme.name}
        onChange={(e) => setTheme(e.target.value)}
        className="bg-transparent text-[var(--color-text)] group-hover:text-[var(--color-primaryText)] text-sm font-medium cursor-pointer focus:outline-none border-none appearance-none pl-2 pr-[18px] py-2 leading-normal transition-colors"
        aria-label="Select theme"
      >
        {availableThemes.map((theme) => (
          <option key={theme.name} value={theme.name}>
            {theme.displayName}
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

