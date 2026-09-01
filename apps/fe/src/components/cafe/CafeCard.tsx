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
    <article className={`group ${s.frame} border border-border ${s.radius} overflow-hidden transition-shadow flex flex-col relative`}>
      <Link
        href={cafePath}
        aria-label={cafe.name}
        className={`absolute inset-0 z-20 ${s.radius} focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand`}
      />
      {/* Hover shadow overlay - renders on top of all content */}
      <div className={`absolute inset-0 ${s.radius} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-inset-primary z-10`} />

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
        <h3 className={`font-semibold text-text ${s.title}`} title={cafe.name}>
          {cafe.name}
        </h3>
        <p className={`text-xs text-ink-secondary truncate ${s.meta}`} title={cafe.address}>
          {extractCity(cafe.address)}
        </p>
        <div className={`flex items-center justify-between gap-2 ${s.row}`}>
          {/* Trending tag - only show for top 3 */}
          {cafe.trending_rank && cafe.trending_rank <= 3 ? (
            <span className="bg-primary text-primaryText px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
              🔥 {tMap('trending')}
            </span>
          ) : cafe.status === 'pending' ? (
            <span className="bg-surface-hover text-ink-secondary border border-border px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              ⏳ {tMap('pending')}
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
