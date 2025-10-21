'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes } from '@/lib/themes/palettes';
import { ThemePalette } from '@/lib/themes/types';

interface ThemeContextType {
  currentTheme: ThemePalette;
  setTheme: (themeName: string) => void;
  availableThemes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && themes[savedTheme]) {
        return savedTheme;
      }
    }
    return 'morningCoffee';
  });

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[currentThemeName];
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--color-${key}`;
      root.style.setProperty(cssVarName, value);
    });
    
    // Save to localStorage
    localStorage.setItem('theme', currentThemeName);
  }, [currentThemeName]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
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