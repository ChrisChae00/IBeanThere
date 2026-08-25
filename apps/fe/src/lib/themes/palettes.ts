import { ThemePalette } from './types';

/*
  Theme identity only. The colour values live in `src/styles/themes.css`, keyed by the
  same names, and reach the app as CSS custom properties — a theme switch is one
  attribute on <html>, not forty inline style writes.

  Anything that needs a theme's actual colour in JavaScript should read the published
  token (see `getCSSVariable` in `lib/markerStyles.ts`) rather than re-importing values
  here, so there is only ever one source of truth per colour.
*/
export const themes: Record<string, ThemePalette> = {
  morningCoffee: { name: 'morningCoffee', displayName: 'Morning Coffee' },
  espresso: { name: 'espresso', displayName: 'Dark Roast' },
  matchaLatte: { name: 'matchaLatte', displayName: 'Matcha Latte' },
  vanillaLatte: { name: 'vanillaLatte', displayName: 'Vanilla Latte' },
};

export const defaultThemeName = 'morningCoffee';
export const themeNames = Object.keys(themes);
