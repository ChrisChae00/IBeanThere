'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Images } from 'lucide-react';
import type { GalleryImage } from '@/types/gallery';

/*
  The photograph is the first thing on a cafe's page, at the size a photograph is
  worth looking at, and it is also the door into the rest of them: the strip of
  thumbnails this replaced showed six 96px squares and asked the reader to find
  "View All" to see anything properly.

  The whole frame is the control. The badge in the corner says how many there are
  and is not itself clickable — a button inside a button is two targets where the
  reader sees one.

  It sits at the top of the details card rather than in a card of its own: the
  photograph and the cafe's details are the same subject.
*/

/*
  The frame takes the photograph's own shape, clamped. Fixing it at 16:9 letterboxed
  or beheaded every portrait shot, and letting it run free would give a phone-shot
  portrait a frame taller than the screen. Between these two the crop is a trim
  rather than a cut, and there is never a blank band: the image always covers.

  Wide is 16:9, tall is 4:5 — the tallest shape that still leaves the page's first
  screen showing something other than one photograph.
*/
const WIDEST = 16 / 9;
const TALLEST = 4 / 5;

export default function CafePhotoHero({
  images,
  cafeName,
  onOpen,
  overlay,
  cornerAction,
}: {
  images: GalleryImage[];
  cafeName: string;
  onOpen: () => void;
  /** Sits over the photograph, top left — the founding crew. */
  overlay?: React.ReactNode;
  /** Sits over the photograph, top right — the overflow menu. */
  cornerAction?: React.ReactNode;
}) {
  const t = useTranslations('cafe.detail');
  const [ratio, setRatio] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        aria-label={t('view_all')}
        /* No rule or radius of its own: it is the top of a card, and the card's
           border and radius already draw that edge. */
        className="group relative block w-full overflow-hidden bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
        style={{ aspectRatio: ratio ?? WIDEST }}
      >
        <img
          src={images[0].url}
          alt={images[0].alt || cafeName}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            if (!naturalWidth || !naturalHeight) return;
            setRatio(
              Math.min(WIDEST, Math.max(TALLEST, naturalWidth / naturalHeight)),
            );
          }}
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />

        {/*
          The badge sits on the photo, so its ground is the scrim and its ink is
          `--ink-on-media` — a theme surface colour here would be invisible over half
          the photographs it lands on.
        */}
        <span
          className="landing-micro absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-(--radius-pill) px-3 py-1.5 text-ink-on-media backdrop-blur-[2px]"
          style={{ background: 'color-mix(in srgb, var(--scrim-media) 72%, transparent)' }}
        >
          <Images className="size-3.5" aria-hidden />
          {images.length}
        </span>
      </button>

      {/* Outside the button: these carry their own targets and are not part of the
          "open the gallery" one. */}
      {overlay && <div className="absolute left-4 top-4">{overlay}</div>}
      {cornerAction && <div className="absolute right-3 top-3">{cornerAction}</div>}
    </div>
  );
}
