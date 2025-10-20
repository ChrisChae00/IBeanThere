'use client';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="theme-selector">
      <label htmlFor="theme-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
        Theme:
      </label>
      <select 
        id="theme-select"
        value={currentTheme.name}
        onChange={(e) => setTheme(e.target.value)}
        style={{
          background: 'var(--color-background)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          padding: '0.5rem',
          fontSize: '0.9rem',
          cursor: 'pointer'
        }}
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
