'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, defaultThemeName } from '@/lib/themes/palettes';
import { ThemePalette } from '@/lib/themes/types';

interface ThemeContextType {
  currentTheme: ThemePalette;
  setTheme: (themeName: string) => void;
  availableThemes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Reads the theme the pre-hydration script in the root layout already applied, so the
 * first client render agrees with what is on screen instead of flashing past it.
 */
function readAppliedTheme(): string {
  if (typeof document === 'undefined') return defaultThemeName;
  const applied = document.documentElement.dataset.theme;
  return applied && themes[applied] ? applied : defaultThemeName;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeName, setCurrentThemeName] = useState<string>(defaultThemeName);

  // The server cannot know the visitor's theme, so the first render always uses the
  // default and this reconciles with whatever the pre-hydration script picked.
  useEffect(() => {
    setCurrentThemeName(readAppliedTheme());
  }, []);

  const setTheme = (themeName: string) => {
    if (!themes[themeName]) return;
    setCurrentThemeName(themeName);
    document.documentElement.dataset.theme = themeName;
    try {
      localStorage.setItem('theme', themeName);
    } catch {
      // Private browsing and blocked storage are fine; the theme just will not persist.
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme: themes[currentThemeName],
      setTheme,
      availableThemes: Object.values(themes)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
