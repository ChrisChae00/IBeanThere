import { ThemePalette } from './types';

export const themes: Record<string, ThemePalette> = {
    morningCoffee: {
        name: 'morningCoffee',
        displayName: 'Morning Coffee',
        colors: {
          primary: '#8C5A3A', // Medium brown for main elements
          primaryText: '#f5f0e8', // Light cream text on primary background
          secondary: '#AB7743', // Light brown/taupe for secondary elements
          accent: '#D9B896', // Medium beige for accents
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
          surfaceText: '#442f19', // Text for surface (same as cardText since surface is light)
          surfaceTextSecondary: '#93795d', // Secondary text for surface
          authText: '#442f19', // Dark brown text (same as text) for auth pages on secondary background
          starFilled: '#FFA500', // Vibrant orange for filled stars
          starEmpty: '#D3D3D3', // Light gray with better contrast
          starEmptyOutline: '#B0B0B0', // Darker gray for star outline
          cardShadow: '#8C5A3A', // Same as primary for morning coffee
          pending: '#9CA3AF', // Gray for pending markers
          white: '#FFFFFF', // White for contrast
          userMarkerMap: '#D24C28', // Secondary color for user marker
          cafeMarker: '#8C5A3A', // Same as primary for visibility on map
        },   
      },
    espresso: {
        name: 'espresso',
        displayName: 'Dark Roast',
        colors: {
          primary: '#d4c7b8', // Light cream for better contrast on dark surface
          primaryText: '#1A120B', // Dark background color for text on light primary
          secondary: '#5e432d', // Dark brown
          accent: '#6B4F3A', // Medium brown accent 
          background: '#1A120B', // Very dark brown from image 2A1A13
          cardBackground: '#2A1A13', // Slightly lighter surface for dark mode cards
          surface: '#3C2A21', // Dark brown surface from image
          text: '#e9ded2', // Light cream text
          textSecondary: '#d4c7b8', // Light beige secondary text
          border: '#5e432d', // Darker brown for better distinction from surface
          success: '#66BB6A', // Lighter green for dark mode
          warning: '#FFA726', // Lighter orange for dark mode
          error: '#EF5350', // Lighter red for dark mode
          textHero: '#e9ded2', // Light beige for hero text
          cardText: '#e9ded2', // Light text for dark card background
          cardTextSecondary: '#d4c7b8', // Light beige secondary text
          surfaceText: '#e9ded2', // Light text for dark surface
          surfaceTextSecondary: '#d4c7b8', // Light secondary text for dark surface
          authText: '#e9ded2', // Light cream text (same as text) for auth pages on secondary background
          starFilled: '#FFB347', // Warm orange for dark mode
          starEmpty: '#808080', // Medium gray for better contrast in dark mode
          starEmptyOutline: '#606060', // Darker gray for star outline
          cardShadow: '#d4c7b8', // Same as primary for espresso
          pending: '#9CA3AF', // Gray for pending markers
          white: '#FFFFFF', // White for contrast
          userMarkerMap: '#D24C28', // Secondary color for user marker
          cafeMarker: '#1A120B', // Dark color for visibility on map (same as primaryText)
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
          surfaceText: '#4a5c2a', // Text for surface (same as cardText since surface is light)
          surfaceTextSecondary: '#85a035', // Secondary text for surface
          authText: '#e0e8d0', // Very light desaturated green (same as background) for auth pages on secondary background
          starFilled: '#FF8C00', // Dark orange for matcha theme
          starEmpty: '#A0A0A0', // Medium gray for better contrast
          starEmptyOutline: '#808080', // Darker gray for star outline
          cardShadow: '#85a035', // Same as primary for matcha latte
          pending: '#9CA3AF', // Gray for pending markers
          white: '#FFFFFF', // White for contrast
          userMarkerMap: '#E78E17', // Secondary color for user marker
          cafeMarker: '#85a035', // Same as primary for visibility on map
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
      cardBackground: '#FFF9F0', // Very light cream background (opaque for better readability)
      surface: '#FFF9F0', // Even whiter vanilla cream surface (opaque)
      text: '#362C1D', // Dark brown text for readability
      textSecondary: '#8B7355', // Medium brown secondary text
      border: '#F5E6A3', // Soft yellow border like vanilla flower
      success: '#4CAF50', // Standard green
      warning: '#FFC107', // Standard amber
      error: '#F44336', // Standard red
      textHero: '#FFF9F0', // Very light cream for hero text  
      cardText: '#362C1D', // Dark brown for card text
      cardTextSecondary: '#8B7355', // Medium brown secondary text
      surfaceText: '#362C1D', // Text for surface (same as cardText since surface is light)
      surfaceTextSecondary: '#8B7355', // Secondary text for surface
      authText: '#362C1D', // Dark brown text (same as text) for auth pages on secondary background
          starFilled: '#FF7F50', // Coral orange for vanilla theme
          starEmpty: '#A0A0A0', // Medium gray for better contrast (same as matcha latte)
          starEmptyOutline: '#808080', // Darker gray for star outline (same as matcha latte)
          cardShadow: '#9d6345', // Rose brown for vanilla theme card shadows
      pending: '#9CA3AF', // Gray for pending markers
      white: '#FFFFFF', // White for contrast
      userMarkerMap: '#E78E17', // Secondary color for user marker
      cafeMarker: '#362C1D', // Same as primary for visibility on map
    },
  },
};
