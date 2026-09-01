'use client';

import { useEffect, useState } from 'react';

/*
  The line where one section's colour becomes the next one's, drawn as a wave
  instead of as a straight edge -- the surface of a cup rather than a ruled
  boundary. Four of them: the page rising into the hero photograph, the page
  turning dark for registration, back to light after it, and up onto the raised
  surface the closing action sits on.

  The shape is different on every load. It is generated on the client after
  mount rather than during render, which is the whole reason there is a fixed
  starting path: a `Math.random()` read while rendering produces one shape on
  the server and a different one in the browser, and React discards the markup
  it just streamed. The first path is a real wave, so the swap is a shape
  settling, not a divider appearing.
*/

const WAVE_W = 1200;
const WAVE_H = 120;
/* Four segments: enough for two crests, few enough to stay a calm surface. */
const WAVE_SEGMENTS = 4;

/**
 * A wave whose crest heights come from `next`, filled downwards.
 *
 * Each segment is a cubic with both handles pulled fully to the horizontal, so
 * every joint is flat -- that is what keeps the curve smooth across the seams
 * instead of showing a corner at each control point.
 */
function wavePath(next: () => number) {
  const step = WAVE_W / WAVE_SEGMENTS;
  const heights = Array.from(
    { length: WAVE_SEGMENTS + 1 },
    () => WAVE_H * 0.5 + (next() * 2 - 1) * WAVE_H * 0.34,
  );

  let d = `M0 ${heights[0].toFixed(1)}`;
  for (let index = 0; index < WAVE_SEGMENTS; index += 1) {
    const left = index * step;
    const right = left + step;
    const handle = step / 2;
    d += ` C${(left + handle).toFixed(1)} ${heights[index].toFixed(1)},`;
    d += ` ${(right - handle).toFixed(1)} ${heights[index + 1].toFixed(1)},`;
    d += ` ${right.toFixed(1)} ${heights[index + 1].toFixed(1)}`;
  }
  return `${d} L${WAVE_W} ${WAVE_H} L0 ${WAVE_H} Z`;
}

/* Rendered on the server and for the first client paint. */
const WAVE_STILL = wavePath(
  (() => {
    const fixed = [0.62, 0.28, 0.74, 0.34, 0.58];
    let cursor = 0;
    return () => fixed[cursor++ % fixed.length];
  })(),
);

export default function WaveDivider({
  from = 'transparent',
  to,
}: {
  /**
   * Colour above the line. Left out where the wave is laid over a page whose
   * content it must not paint over -- the footer's, which pours into whatever
   * happens to be above it.
   */
  from?: string;
  /** Colour below the line -- the section the wave is pouring into. */
  to: string;
}) {
  const [path, setPath] = useState(WAVE_STILL);

  useEffect(() => setPath(wavePath(Math.random)), []);

  return (
    <div
      aria-hidden
      className="pointer-events-none w-full"
      /* Scales with the page so the wave is never a hairline on a phone nor a
         band on a wide screen. */
      style={{ background: from, height: 'clamp(56px, 8vw, 128px)' }}
    >
      {/* `none`: the wave stretches to the viewport rather than keeping its
          own 10:1 ratio and leaving the colour unresolved at the sides. */}
      <svg
        viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
        preserveAspectRatio="none"
        /* One pixel taller than the box: the fill lands on a fractional
           device pixel at most zoom levels, and stopping exactly on the
           boundary leaves a hairline of the wrong colour under the wave. */
        className="block w-full"
        style={{ height: 'calc(100% + 1px)' }}
      >
        <path d={path} fill={to} style={{ transition: 'd 900ms ease-out' }} />
      </svg>
    </div>
  );
}
