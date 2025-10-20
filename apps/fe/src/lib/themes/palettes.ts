import { ThemePalette } from './types';

export const themes: Record<string, ThemePalette> = {
    morningCoffee: {
        name: 'morningCoffee',
        displayName: 'Morning Coffee',
        colors: {
          primary: '#6a533b', // Medium brown for main elements
          secondary: '#93795d', // Light brown/taupe for secondary elements
          accent: '#c2ac93', // Medium beige for accents
          background: '#e9d6c0', // Light beige for background
          surface: '#f5f0e8', // Very light warm cream for surfaces f5f0e8
          text: '#442f19', // Dark brown for main text
          textSecondary: '#6a533b', // Medium brown for secondary text
          border: '#c2ac93', // Medium beige for borders
          success: '#4CAF50', // Standard green
          warning: '#FFC107', // Standard amber
          error: '#F44336', // Standard red
        },
      },
    espresso: {
        name: 'espresso',
        displayName: 'Night Espresso',
        colors: {
          primary: '#d4c7b8', // Light cream for better contrast on dark surface
          secondary: '#5e432d', // Dark brown
          accent: '#8b7355', // Medium brown accent
          background: '#1A120B', // Very dark brown from image
          surface: '#3C2A21', // Dark brown surface from image
          text: '#e9ded2', // Light cream text
          textSecondary: '#d4c7b8', // Light beige secondary text
          border: '#5e432d', // Darker brown for better distinction from surface
          success: '#66BB6A', // Lighter green for dark mode
          warning: '#FFA726', // Lighter orange for dark mode
          error: '#EF5350', // Lighter red for dark mode
        },
      },
      matchaLatte: {
        name: 'matchaLatte',
        displayName: 'Matcha Latte',
        colors: {
          primary: '#5d7025', // Medium olive green 85a035
          secondary: '#85a035', // Dark olive green
          accent: '#a9bc71', // Light olive green
          background: '#f0f2e8', // Very light desaturated green
          surface: '#e0e8d0', // Light green surface
          text: '#4a5c2a', // Dark olive for text
          textSecondary: '#85a035', // Medium olive
          border: '#a9bc71', // Light olive border
          success: '#4CAF50', // Standard green
          warning: '#FFC107', // Standard amber
          error: '#F44336', // Standard red
        },
      },
  vanillaLatte: {
    name: 'vanillaLatte',
    displayName: 'Vanilla Latte',
    colors: {
      primary: '#362C1D', // Dark brown like vanilla pods
      secondary: '#8B7355', // Medium brown
      accent: '#F5E6A3', // Soft yellow like vanilla flower
      background: '#FFF8DC', // Very light cream background
      surface: '#FFF9F0', // Even whiter vanilla cream surface
      text: '#362C1D', // Dark brown text for readability
      textSecondary: '#8B7355', // Medium brown secondary text
      border: '#F5E6A3', // Soft yellow border like vanilla flower
      success: '#4CAF50', // Standard green
      warning: '#FFC107', // Standard amber
      error: '#F44336', // Standard red
    },
  },
};
