'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GoogleCafePhoto, TrendingCafeResponse } from '@/types/api';
import CafeCardImage from './CafeCardImage';
import { getCafePath } from '@/lib/utils/slug';
import { extractCity } from '@/lib/utils/address';

/*
  One card for both places a cafe is listed: the explore grid (`lg`) and the trending
  panel (`sm`). They were two files that differed by a radius, a background and a font
  size, and had already drifted — only one of them rendered the pending badge.
*/
type CafeCardSize = 'sm' | 'lg';

interface CafeCardProps {
  cafe: TrendingCafeResponse;
  locale: string;
  size?: CafeCardSize;
  googlePhoto?: GoogleCafePhoto | null;
  googlePhotoLoading?: boolean;
  /* The trending panel knows a cafe's rank from its position in the list it was given;
     the row itself carries `trending_rank` only sometimes. */
  trendingRank?: number;
}

const sizeStyles: Record<CafeCardSize, {
  frame: string;
  radius: string;
  body: string;
  title: string;
  image: 'small' | 'large';
}> = {
  sm: {
    frame: 'bg-surface h-full',
    radius: 'rounded-(--radius-card)',
    body: 'p-4',
    title: 'text-sm line-clamp-1',
    image: 'small'
  },
  lg: {
    frame: 'bg-surface',
    radius: 'rounded-(--radius-card)',
    body: 'p-5',
    title: 'text-base line-clamp-2',
    image: 'large'
  }
};

export default function CafeCard({
  cafe,
  locale,
  size = 'lg',
  googlePhoto,
  googlePhotoLoading,
  trendingRank
}: CafeCardProps) {
  const tMap = useTranslations('map');
  const s = sizeStyles[size];

  const cafeImage = cafe.main_image || cafe.image;
  /* Trending is the one badge that claims something, so it is painted; pending only
     qualifies the record, and stays a quiet plate on the photograph. */
  const rank = trendingRank ?? cafe.trending_rank;
  const badge =
    rank && rank <= 3
      ? { label: tMap('trending'), tone: 'bg-brand-hover text-ink-on-brand' }
      : cafe.status === 'pending'
        ? { label: tMap('pending'), tone: 'bg-scrim-media text-ink-on-media' }
        : null;
  const cafePath = getCafePath(cafe, locale);

  return (
    <article className={`group ${s.frame} border border-edge-rule ${s.radius} overflow-hidden transition-shadow flex flex-col relative`}>
      <Link
        href={cafePath}
        aria-label={cafe.name}
        /* `inherit` so the focus ring and the hover shade follow whatever radius the
           card is actually wearing, including none. */
        className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand" 
      />
      {/* Hover shadow overlay - renders on top of all content */}
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-inset-primary z-10" />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <CafeCardImage
          imageUrl={cafeImage}
          alt={cafe.name}
          size={s.image}
          googlePhoto={googlePhoto}
          googlePhotoLoading={googlePhotoLoading}
          locale={locale}
        />
        {/*
          The status rides the photograph rather than taking a row of its own under it:
          it is a property of the place in the picture, and the body below is then only
          the two lines that name it.
        */}
        {badge && (
          <span className={`landing-micro absolute top-3 left-3 z-10 rounded-(--radius-pill) px-3 py-1.5 ${badge.tone}`}>
            {badge.label}
          </span>
        )}
      </div>
      {/* Place, then name. The card lists a cafe; acting on it happens on its page. */}
      <div className={`mt-auto flex flex-col ${s.body}`}>
        <p className="landing-micro text-ink-secondary truncate" title={cafe.address}>
          {extractCity(cafe.address)}
        </p>
        {/* A cafe's name is data, not a headline: body face, not the display serif. */}
        <h3
          className={`mt-2 font-sans font-semibold leading-snug text-ink-primary ${s.title}`}
          title={cafe.name}
        >
          {cafe.name}
        </h3>
      </div>
    </article>
  );
}
