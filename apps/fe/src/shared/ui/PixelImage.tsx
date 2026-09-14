'use client';

import { useState } from 'react';
import Image from 'next/image';

/*
  magicui's `pixel-image`, rewritten as CSS: the photograph arrives as a grid of tiles
  fading in out of order, in grey, and takes its colour once they have landed
  (`.pixel-tile` and `.pixel-color` in globals.css).

  Where it departs from the original, and why:
  - Tile delays are a golden-ratio scatter, not `Math.random()`. The same markup has to
    come out of the server and the client, or every tile's inline style fails hydration.
  - The tiles are server-rendered at their from-state and held there until the photograph
    has loaded (`data-loaded`), rather than started on a timer. Started on page load, a
    photograph slower than the whole sequence arrived after it had finished and simply
    appeared. `next/image` reports an image that completed before hydration, too.
  - It fills its positioned parent instead of a fixed 384px square.
  - Tiles are `next/image`, lazy: every tile asks for the same URL, so it is one request,
    and none at all while the parent is `display: none`.
  - Decorative: one `aria-hidden` wrapper rather than an alt text per tile.
*/

const MAX_DELAY_MS = 1200;
const GOLDEN = 0.6180339887;

interface PixelImageProps {
  src: string;
  /* Forwarded to `next/image`; the component cannot know how wide its parent is. */
  sizes: string;
  rows?: number;
  cols?: number;
}

export default function PixelImage({ src, sizes, rows = 4, cols = 6 }: PixelImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      aria-hidden
      data-loaded={loaded || undefined}
      className="pixel-color absolute inset-0 select-none"
    >
      {Array.from({ length: rows * cols }, (_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        /*
          Half a pixel of overlap on every edge. Two tiles cut exactly on the same line
          each anti-alias it, and the ground shows through as a seam once both are in.
        */
        const edge = (percent: number) => `calc(${percent}% - 0.5px)`;
        const clipPath = `inset(${edge((row * 100) / rows)} ${edge(100 - ((col + 1) * 100) / cols)} ${edge(
          100 - ((row + 1) * 100) / rows
        )} ${edge((col * 100) / cols)})`;
        const delay = Math.round(((index * GOLDEN) % 1) * MAX_DELAY_MS);

        return (
          <div
            key={index}
            className="pixel-tile absolute inset-0"
            style={{ clipPath, animationDelay: `${delay}ms` }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes={sizes}
              draggable={false}
              onLoad={() => setLoaded(true)}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
