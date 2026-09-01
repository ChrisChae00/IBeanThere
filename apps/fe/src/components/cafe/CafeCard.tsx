'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GoogleCafePhoto, TrendingCafeResponse } from '@/types/api';
import CafeCardImage from './CafeCardImage';
import DropBeanButton from './DropBeanButton';
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
}

const sizeStyles: Record<CafeCardSize, {
  frame: string;
  radius: string;
  body: string;
  title: string;
  meta: string;
  row: string;
  image: 'small' | 'large';
}> = {
  sm: {
    frame: 'bg-background h-full',
    radius: 'rounded-xl',
    body: 'p-3',
    title: 'text-base mb-0.5 line-clamp-1',
    meta: 'mb-2',
    row: 'mt-1',
    image: 'small'
  },
  lg: {
    frame: 'bg-surface',
    radius: 'rounded-2xl',
    body: 'p-4',
    title: 'text-sm mb-1.5 line-clamp-2',
    meta: 'mb-3',
    row: 'mt-2',
    image: 'large'
  }
};

export default function CafeCard({
  cafe,
  locale,
  size = 'lg',
  googlePhoto,
  googlePhotoLoading
}: CafeCardProps) {
  const tMap = useTranslations('map');
  const s = sizeStyles[size];

  const cafeImage = cafe.main_image || cafe.image;
  const cafePath = getCafePath(cafe, locale);

  // The trending endpoint returns coordinates as strings; the search one does not.
  const latitude = typeof cafe.latitude === 'string' ? parseFloat(cafe.latitude) : cafe.latitude;
  const longitude = typeof cafe.longitude === 'string' ? parseFloat(cafe.longitude) : cafe.longitude;

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

      <div className="overflow-hidden flex-1 flex flex-col">
        <CafeCardImage
          imageUrl={cafeImage}
          alt={cafe.name}
          size={s.image}
          googlePhoto={googlePhoto}
          googlePhotoLoading={googlePhotoLoading}
          locale={locale}
        />
      </div>
      <div className={`flex flex-col mt-auto ${s.body}`}>
        {/* A cafe's name is data, not a headline: body face, not the display serif. */}
        <h3 className={`font-sans font-semibold text-ink-primary ${s.title}`} title={cafe.name}>
          {cafe.name}
        </h3>
        <p className={`text-xs text-ink-secondary truncate ${s.meta}`} title={cafe.address}>
          {extractCity(cafe.address)}
        </p>
        <div className={`flex items-center justify-between gap-2 ${s.row}`}>
          {/* Trending tag - only show for top 3 */}
          {cafe.trending_rank && cafe.trending_rank <= 3 ? (
            <span className="landing-micro rounded-(--radius-pill) border border-brand bg-brand/12 px-3 py-1.5 text-ink-primary">
              {tMap('trending')}
            </span>
          ) : cafe.status === 'pending' ? (
            <span className="landing-micro rounded-(--radius-pill) border border-edge-rule px-3 py-1.5 text-ink-secondary">
              {tMap('pending')}
            </span>
          ) : (
            <span /> /* Empty span to maintain flex layout */
          )}
          <div className="relative z-30">
            <DropBeanButton
              cafeId={cafe.id}
              cafeLat={latitude}
              cafeLng={longitude}
              size="sm"
              showGrowthInfo={false}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
