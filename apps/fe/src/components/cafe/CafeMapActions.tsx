'use client';

import { useTranslations } from 'next-intl';
import NavigationButton from './NavigationButton';
import { CAFE_ACTION_CLASS } from './cafeActionClass';

/*
  The two ways out to a map, in one place: the cafe page and the map's own card showed
  the same pair at two different sizes, and the pair drifted apart every time one of them
  was touched.
*/
export default function CafeMapActions({
  name,
  address,
  latitude,
  longitude,
  sourceUrl,
}: {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  sourceUrl?: string;
}) {
  const t = useTranslations('cafe.modal');

  const href =
    sourceUrl && sourceUrl.startsWith('https://www.google.com/maps')
      ? sourceUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${name}, ${address || `${latitude},${longitude}`}`
        )}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={href} target="_blank" rel="noopener noreferrer" className={CAFE_ACTION_CLASS}>
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <span>{t('google_maps')}</span>
      </a>
      {latitude && longitude && (
        <NavigationButton latitude={latitude} longitude={longitude} size="sm" />
      )}
    </div>
  );
}
