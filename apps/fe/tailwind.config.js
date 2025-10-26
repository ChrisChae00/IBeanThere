/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'primary': '0 4px 6px -1px var(--color-primary), 0 2px 4px -1px var(--color-primary)',
        'primary-lg': '0 10px 15px -3px var(--color-primary), 0 4px 6px -2px var(--color-primary)',
        'primary-xl': '0 12px 16px -4px var(--color-primary), 0 4px 8px -2px var(--color-primary)',
        'inset-primary': 'inset -5px -10px 10px -3px color-mix(in srgb, var(--color-cardShadow) 40%, transparent),inset 5px 6px 10px -3px color-mix(in srgb, var(--color-cardShadow) 40%, transparent), inset 0px 0px 12px color-mix(in srgb, var(--color-cardShadow) 50%, transparent)',
      }
    },
  },
  plugins: [],
}

