import type { CategoryAccent } from '@/data/coffee/types';

/**
 * Tints are written as color-mix() rather than Tailwind's `/40` opacity modifier.
 * The palette tokens are `var(--color-*)` strings, and Tailwind v3 cannot apply an
 * opacity modifier to a value it can't parse — `bg-[var(--color-primary)]/40`
 * silently compiles to nothing. These classes must stay literal for the JIT scanner.
 */

type Ladder = {
  /** Circular stage marker sitting on the rail. */
  marker: string;
  /** Thin accent bar leading each drink chip. */
  bar: string;
  /** Era pill next to the stage name. */
  era: string;
};

const primary: Ladder[] = [
  {
    marker:
      'bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)]',
    bar: 'bg-[color-mix(in_srgb,var(--color-primary)_35%,transparent)]',
    era: 'border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)]',
  },
  {
    marker:
      'bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] border-[color-mix(in_srgb,var(--color-primary)_42%,transparent)]',
    bar: 'bg-[color-mix(in_srgb,var(--color-primary)_55%,transparent)]',
    era: 'border-[color-mix(in_srgb,var(--color-primary)_42%,transparent)]',
  },
  {
    marker:
      'bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] border-[color-mix(in_srgb,var(--color-primary)_58%,transparent)]',
    bar: 'bg-[color-mix(in_srgb,var(--color-primary)_75%,transparent)]',
    era: 'border-[color-mix(in_srgb,var(--color-primary)_58%,transparent)]',
  },
  {
    marker: 'bg-[var(--color-primary)] border-[var(--color-primary)]',
    bar: 'bg-[var(--color-primary)]',
    era: 'border-[color-mix(in_srgb,var(--color-primary)_70%,transparent)]',
  },
];

const secondary: Ladder[] = [
  {
    marker:
      'bg-[color-mix(in_srgb,var(--color-secondary)_8%,transparent)] border-[color-mix(in_srgb,var(--color-secondary)_28%,transparent)]',
    bar: 'bg-[color-mix(in_srgb,var(--color-secondary)_35%,transparent)]',
    era: 'border-[color-mix(in_srgb,var(--color-secondary)_28%,transparent)]',
  },
  {
    marker:
      'bg-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)] border-[color-mix(in_srgb,var(--color-secondary)_42%,transparent)]',
    bar: 'bg-[color-mix(in_srgb,var(--color-secondary)_55%,transparent)]',
    era: 'border-[color-mix(in_srgb,var(--color-secondary)_42%,transparent)]',
  },
  {
    marker:
      'bg-[color-mix(in_srgb,var(--color-secondary)_24%,transparent)] border-[color-mix(in_srgb,var(--color-secondary)_58%,transparent)]',
    bar: 'bg-[color-mix(in_srgb,var(--color-secondary)_75%,transparent)]',
    era: 'border-[color-mix(in_srgb,var(--color-secondary)_58%,transparent)]',
  },
  {
    marker: 'bg-[var(--color-secondary)] border-[var(--color-secondary)]',
    bar: 'bg-[var(--color-secondary)]',
    era: 'border-[color-mix(in_srgb,var(--color-secondary)_70%,transparent)]',
  },
];

const ladders: Record<CategoryAccent, Ladder[]> = { primary, secondary };

/** Deeper stages carry a denser tint, so the page reads as a descent. */
export function stageLadder(accent: CategoryAccent, depth: number): Ladder {
  const steps = ladders[accent] ?? primary;
  return steps[Math.min(Math.max(depth, 0), steps.length - 1)];
}

/** The deepest step fills solid, so its emoji needs the inverted text colour. */
export const MARKER_BASE =
  'grid h-11 w-11 shrink-0 place-items-center rounded-full border text-lg leading-none';
