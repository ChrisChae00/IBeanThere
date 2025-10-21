import { ThemePalette } from './types';

export const themes: Record<string, ThemePalette> = {
    morningCoffee: {
        name: 'morningCoffee',
        displayName: 'Morning Coffee',
        colors: {
          primary: '#8C5A3A', // Medium brown for main elements
          primaryText: '#f5f0e8', // Light cream text on primary background
          secondary: '#AB7743', // Light brown/taupe for secondary elements
          accent: '#c2ac93', // Medium beige for accents
          background: '#e9d6c0', // Light beige for background
          cardBackground: '#f5f0e8', // Very light warm cream for surfaces f5f0e8
          surface: '#f5f0e8', // Very light warm cream for surfaces f5f0e8
          text: '#442f19', // Dark brown for main text
          textSecondary: '#93795d', // Light brown for secondary text (hover state, lighter)
          border: '#c2ac93', // Medium beige for borders
          success: '#4CAF50', // Standard green
          warning: '#FFC107', // Standard amber
          error: '#F44336', // Standard red
          textHero: '#f5f0e8', // Light beige for hero text
          cardText: '#442f19', // Dark brown for card text
          cardTextSecondary: '#93795d', // Light brown for secondary text (hover state, lighter)
        },   
      },
    espresso: {
        name: 'espresso',
        displayName: 'Dark Roast',
        colors: {
          primary: '#d4c7b8', // Light cream for better contrast on dark surface
          primaryText: '#1A120B', // Dark background color for text on light primary
          secondary: '#5e432d', // Dark brown
          accent: '#8b7355', // Medium brown accent
          background: '#1A120B', // Very dark brown from image 2A1A13
          cardBackground: '#d4c7b8', // Dark brown surface from image
          surface: '#3C2A21', // Dark brown surface from image
          text: '#e9ded2', // Light cream text
          textSecondary: '#d4c7b8', // Light beige secondary text
          border: '#5e432d', // Darker brown for better distinction from surface
          success: '#66BB6A', // Lighter green for dark mode
          warning: '#FFA726', // Lighter orange for dark mode
          error: '#EF5350', // Lighter red for dark mode
          textHero: '#e9ded2', // Light beige for hero text
          cardText: '#1A120B', // Dark background color for text on light primary
          cardTextSecondary: '#5e432d', // Dark brown secondary text
        },
      },
      matchaLatte: {
        name: 'matchaLatte',
        displayName: 'Matcha Latte',
        colors: {
          primary: '#85a035', // Medium olive green 85a035
          primaryText: '#f0f2e8', // Light cream text on primary background
          secondary: '#5d7025', // Dark olive green
          accent: '#a9bc71', // Light olive green 5d7025
          background: '#e0e8d0', // Very light desaturated green
          cardBackground: '#f0f2e8', // Light green surface e0e8d0
          surface: '#f0f2e8', // Light green surface e0e8d0
          text: '#4a5c2a', // Dark olive for text
          textSecondary: '#85a035', // Medium olive
          border: '#a9bc71', // Light olive border
          success: '#4CAF50', // Standard green
          warning: '#FFC107', // Standard amber
          error: '#F44336', // Standard red
          textHero: '#f0f2e8', // Light beige for hero text // Medium olive green for cta text
          cardText: '#4a5c2a', // Dark olive for card text
          cardTextSecondary: '#85a035', // Medium olive secondary text
        },
      },
  vanillaLatte: {
    name: 'vanillaLatte',
    displayName: 'Vanilla Latte',
    colors: {
      primary: '#362C1D', // Dark brown like vanilla pods
      primaryText: '#FFF9F0', // Light vanilla cream text on primary background
      secondary: '#C7A17A', // Medium brown 8B7355 93795d
      accent: '#F5E6A3', // Soft yellow like vanilla flower
      background: '#FFF8DC', // Very light cream background
      cardBackground: 'rgba(255, 249, 240, 0.7)', // Very light cream background
      surface: 'rgba(255, 249, 240, 0.75)', // Even whiter vanilla cream surface
      text: '#362C1D', // Dark brown text for readability
      textSecondary: '#8B7355', // Medium brown secondary text
      border: '#F5E6A3', // Soft yellow border like vanilla flower
      success: '#4CAF50', // Standard green
      warning: '#FFC107', // Standard amber
      error: '#F44336', // Standard red
      textHero: '#FFF9F0', // Very light cream for hero text  
      cardText: '#362C1D', // Dark brown for card text
      cardTextSecondary: '#8B7355', // Medium brown secondary text
    },
  },
};
