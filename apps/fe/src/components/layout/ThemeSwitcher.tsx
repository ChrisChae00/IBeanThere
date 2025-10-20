'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 hover:bg-[var(--color-background)] transition-colors min-h-[44px]">
      {/* Theme Icon */}
      
      {/* Label */}
      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
        Theme:
      </span>
      
      {/* Dropdown */}
      <select 
        value={currentTheme.name}
        onChange={(e) => setTheme(e.target.value)}
        className="bg-transparent text-[var(--color-text)] text-sm font-medium cursor-pointer focus:outline-none border-none appearance-none pr-6"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          backgroundSize: '1.25rem'
        }}
        aria-label="Select theme"
      >
        {availableThemes.map((theme) => (
          <option key={theme.name} value={theme.name}>
            {theme.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}

