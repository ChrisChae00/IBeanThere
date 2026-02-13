/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        '8xl': '90rem',
      },
      boxShadow: {
        'primary': '0 4px 6px -1px var(--color-primary), 0 2px 4px -1px var(--color-primary)',
        'primary-lg': '0 10px 15px -3px var(--color-primary), 0 4px 6px -2px var(--color-primary)',
        'primary-xl': '0 12px 16px -4px var(--color-primary), 0 4px 8px -2px var(--color-primary)',
        'inset-primary': 'inset -5px -10px 10px -3px color-mix(in srgb, var(--color-cardShadow) 40%, transparent),inset 5px 6px 10px -3px color-mix(in srgb, var(--color-cardShadow) 40%, transparent), inset 0px 0px 12px color-mix(in srgb, var(--color-cardShadow) 50%, transparent)',
        'inset-background': 'inset 0 0 8px var(--color-background)',
      },
      colors: {
        primary: 'var(--color-primary)',
        primaryText: 'var(--color-primaryText)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        cardBackground: 'var(--color-cardBackground)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        textSecondary: 'var(--color-textSecondary)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        textHero: 'var(--color-textHero)',
        cardText: 'var(--color-cardText)',
        cardTextSecondary: 'var(--color-cardTextSecondary)',
        surfaceText: 'var(--color-surfaceText)',
        surfaceTextSecondary: 'var(--color-surfaceTextSecondary)',
        authText: 'var(--color-authText)',
        starFilled: 'var(--color-starFilled)',
        starEmpty: 'var(--color-starEmpty)',
        starEmptyOutline: 'var(--color-starEmptyOutline)',
        cardShadow: 'var(--color-cardShadow)',
        pending: 'var(--color-pending)',
        userMarkerMap: 'var(--color-userMarkerMap)',
        cafeMarker: 'var(--color-cafeMarker)',
      }
    },
  },
  plugins: [],
}

