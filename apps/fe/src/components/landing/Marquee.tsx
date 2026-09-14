'use client';

/*
  A running strip of the qualities people actually search a cafe for. It is
  decoration, but it is decoration made of product vocabulary rather than of
  shapes — the same reason the reference sets its band in words.

  The track is duplicated and translated by exactly -50%, so the seam lands on
  an identical copy and the loop has no visible restart.
*/

import { useReducedMotion } from 'framer-motion';

type MarqueeProps = {
  text: string;
  /** Seconds for one full pass. Longer strings want a longer duration. */
  duration?: number;
  className?: string;
  /**
   * `micro` is chrome -- a small uppercase strip between sections. `display`
   * sets the same words in the display face at reading size, so the strip is a
   * section in its own right rather than a divider.
   */
  size?: 'micro' | 'display';
};

export default function Marquee({
  text,
  duration = 42,
  className,
  size = 'micro',
}: MarqueeProps) {
  const reduced = useReducedMotion();
  const copy = `${text} · `;

  return (
    <div
      aria-hidden
      className={[
        'relative overflow-hidden',
        size === 'display' ? 'py-8 md:py-10' : 'py-4',
        'border-y border-edge-subtle text-ink-secondary',
        className ?? '',
      ].join(' ')}
    >
      <div
        className={`landing-marquee ${
          size === 'display' ? 'landing-display text-[clamp(1.5rem,3.2vw,2.75rem)]' : 'landing-micro'
        }`}
        style={{ ['--landing-marquee-duration' as string]: `${duration}s` }}
      >
        {/*
          Two copies, not one repeated in a loop: the animation moves the track
          by half its own width, so exactly two are required and a third would
          break the seam maths.
        */}
        <span className="whitespace-nowrap pr-0">{copy.repeat(4)}</span>
        <span className="whitespace-nowrap pr-0">{copy.repeat(4)}</span>
      </div>
      {!reduced ? (
        // Feathered ends so the strip reads as continuing past the viewport
        // rather than being cut by it.
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-surface-page to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-surface-page to-transparent" />
        </>
      ) : null}
    </div>
  );
}
