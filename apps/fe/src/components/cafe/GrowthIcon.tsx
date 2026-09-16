'use client';

import Image from 'next/image';

/*
  The five growth stages, as painted art rather than drawn icons. What this replaces
  was five inline SVGs whose every colour came from a `--growth-*` token, so each
  theme repainted the bean, the soil and the leaves; the illustrations are one fixed
  set instead, for the same reason the map's own pins are fixed -- the paper they are
  painted on does not change with the theme, and a stage a reader recognises should
  look the same wherever it appears.

  The stages no longer grow one plant by degrees. They follow coffee itself -- sprout,
  tree, cherry, green bean, roasted bean -- so the subject and the silhouette change
  outright between steps, which is what a 24px row in the beans list can actually
  resolve. It also ends where the product's name does.

  The files in `public/growth/` are the delivered art itself, square and full bleed,
  with the cream ground painted to the frame's own edge. That is what makes the
  circle below safe: there is no alpha at the rim to bleed through the mask. Next/image
  resizes per call site, so the source can stay as large as it arrived.
*/
const STAGES = [
  { src: '/growth/growth-1-sprout.png', name: 'First Sprout' },
  { src: '/growth/growth-2-tree.png', name: 'Coffee Tree' },
  { src: '/growth/growth-3-cherry.png', name: 'Coffee Cherry' },
  { src: '/growth/growth-4-green-bean.png', name: 'Green Bean' },
  { src: '/growth/growth-5-roasted-bean.png', name: 'Roasted Bean' },
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
        className={`inline-block rounded-full border border-border bg-surface ${className}`}
        style={box}
        title="No bean"
      />
    );
  }

  const stage = STAGES[Math.min(level, STAGES.length) - 1];

  return (
    <span
      className={`relative inline-block overflow-hidden rounded-full ${className}`}
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

export function getGrowthLevel(dropCount: number): number {
  if (dropCount >= 15) return 5;
  if (dropCount >= 10) return 4;
  if (dropCount >=  5) return 3;
  if (dropCount >=  3) return 2;
  if (dropCount >=  1) return 1;
  return 0;
}
