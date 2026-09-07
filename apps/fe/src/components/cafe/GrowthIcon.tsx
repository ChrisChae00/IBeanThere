'use client';

import Image from 'next/image';

/*
  The five growth stages, as painted art rather than drawn icons. What this replaces
  was five inline SVGs whose every colour came from a `--growth-*` token, so each
  theme repainted the bean, the soil and the leaves; the illustrations are one fixed
  set instead, for the same reason the map's own pins are fixed -- the paper they are
  painted on does not change with the theme, and a stage a reader recognises should
  look the same wherever it appears.

  The art is square and full-bleed, and the circles are cut straight out of it at build
  time (`media-src/bean-growth/` into `public/growth/`) rather than being inset inside a
  padded square: the soil is painted to the frame's own edge, so any padding leaves a
  band of sky under it where the ground should be.
*/
const STAGES = [
  { src: '/growth/seed.webp', name: 'Bean Dropped' },
  { src: '/growth/sprout.webp', name: 'Sprouting' },
  { src: '/growth/growing.webp', name: 'Growing' },
  { src: '/growth/tree.webp', name: 'Sapling' },
  { src: '/growth/harvest.webp', name: 'Fruiting Tree' },
] as const;

interface GrowthIconProps {
  /** 0 for a cafe with no bean in it yet, 1-5 for the stages above. */
  level: number;
  /**
     A pixel box, for the places that draw the badge at one fixed size. Left out, the
     badge takes its size from `className`, which is what a responsive row needs.
   */
  size?: number;
  animate?: boolean;
  className?: string;
}

export function GrowthIcon({ level, size, animate = false, className = '' }: GrowthIconProps) {
  const box = size ? { width: size, height: size } : undefined;

  // No bean here yet. An empty ring rather than a faded stage: nothing has started.
  if (level < 1) {
    return (
      <span
        className={`inline-block rounded-full border border-border bg-surface ${className}`}
        style={box}
        title="No bean"
      />
    );
  }

  const stage = STAGES[Math.min(level, STAGES.length) - 1];

  return (
    <span
      className={`relative inline-block overflow-hidden rounded-full ${animate ? 'animate-bounce' : ''} ${className}`}
      style={box}
      title={stage.name}
    >
      {/*
        `sizes` is the largest the badge is ever drawn (the landing index, 96px), so a
        phone is not handed the 3x file for a 24px row in the beans list.
      */}
      <Image src={stage.src} alt={stage.name} fill sizes="96px" className="object-cover" />
    </span>
  );
}

// Export level thresholds for reference
export const GROWTH_THRESHOLDS = {
  SLEEPING_BEAN: 1,
  SPROUTING: 3,
  GROWING: 5,
  SAPLING: 10,
  FRUITING_TREE: 15
};

export function getGrowthLevel(dropCount: number): number {
  if (dropCount >= 15) return 5;
  if (dropCount >= 10) return 4;
  if (dropCount >=  5) return 3;
  if (dropCount >=  3) return 2;
  if (dropCount >=  1) return 1;
  return 0;
}
