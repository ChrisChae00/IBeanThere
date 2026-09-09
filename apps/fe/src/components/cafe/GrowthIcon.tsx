'use client';

import Image from 'next/image';

/*
  The five growth stages, as painted art rather than drawn icons. What this replaces
  was five inline SVGs whose every colour came from a `--growth-*` token, so each
  theme repainted the bean, the soil and the leaves; the illustrations are one fixed
  set instead, for the same reason the map's own pins are fixed -- the paper they are
  painted on does not change with the theme, and a stage a reader recognises should
  look the same wherever it appears.

  The files in `public/growth/` are the delivered art itself -- square, full bleed, no
  crop and no mask, and no second copy under `media-src/` because there is nothing to
  derive. A circular cut was tried first and is not here: the soil is painted to the
  frame's own edge, so it either left a band of sky under the ground or clipped the
  leaves, and the stages are due to be redrawn anyway. Next/image resizes per call
  site, so the source can stay as large as it arrived.
*/
const STAGES = [
  { src: '/growth/bean-growth-seed.png', name: 'Bean Dropped' },
  { src: '/growth/bean-growth-sprout.png', name: 'Sprouting' },
  { src: '/growth/bean-growth-growing.png', name: 'Growing' },
  { src: '/growth/bean-growth-tree.png', name: 'Sapling' },
  { src: '/growth/bean-growth-harvest.png', name: 'Fruiting Tree' },
] as const;

interface GrowthIconProps {
  /** 0 for a cafe with no bean in it yet, 1-5 for the stages above. */
  level: number;
  /**
     A pixel box, for the places that draw the badge at one fixed size. Left out, the
     badge takes its size from `className`, which is what a responsive row needs.
   */
  size?: number;
  className?: string;
}

export function GrowthIcon({ level, size, className = '' }: GrowthIconProps) {
  const box = size ? { width: size, height: size } : undefined;

  // No bean here yet. An empty frame rather than a faded stage: nothing has started.
  if (level < 1) {
    return (
      <span
        className={`inline-block border border-border bg-surface ${className}`}
        style={box}
        title="No bean"
      />
    );
  }

  const stage = STAGES[Math.min(level, STAGES.length) - 1];

  return (
    <span
      className={`relative inline-block ${className}`}
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
