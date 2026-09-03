'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { GoogleCafePhoto, TrendingCafeResponse } from '@/types/api';
import CafeCard from './CafeCard';
import { TRENDING_CAFES_COUNT } from '@/lib/constants/cafe';
import { PlusIcon } from '@/components/ui';

interface TrendingCafesSectionProps {
  cafes: TrendingCafeResponse[];
  locale: string;
  isLoading: boolean;
  googlePhotos?: Record<string, GoogleCafePhoto | null | 'loading'>;
}

const resolvedGooglePhoto = (photo?: GoogleCafePhoto | null | 'loading') =>
  photo === 'loading' ? undefined : photo;

export function RegisterCafeCTA({ variant }: { variant: 'empty' | 'minimal' }) {
  const tMap = useTranslations('map');
  const locale = useLocale();

  if (variant === 'empty') {
    return (
      <div className="col-span-full rounded-(--radius-card) border border-edge-rule bg-surface-raised">
        <div className="space-y-3 px-6 py-14 text-center">
          <p className="landing-micro text-ink-secondary">{tMap('no_cafes_available')}</p>
          <p className="text-xl font-semibold text-ink-primary">{tMap('be_the_navigator')}</p>
          <Link
            href={`/${locale}/discover/register-cafe`}
            className="btn-shade inline-flex min-h-11 items-center gap-2 rounded-(--btn-radius) bg-brand px-5 font-semibold text-ink-on-brand"
          >
            <PlusIcon size={16} />
            {tMap('register_new_cafe')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-(--radius-card) border border-dashed border-edge-rule px-4 py-3">
      <p className="text-sm text-ink-secondary">
        {tMap('few_cafes_nearby')}
      </p>
      <Link
        href={`/${locale}/discover/register-cafe`}
        className="control-flat inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-(--btn-radius) border border-edge-rule px-4 text-sm font-medium text-ink-primary"
      >
        <PlusIcon size={14} />
        {tMap('register_new_cafe')}
      </Link>
    </div>
  );
}

export default function TrendingCafesSection({
  cafes,
  locale,
  isLoading,
  googlePhotos = {},
}: TrendingCafesSectionProps) {
  const t = useTranslations('discover.explore_map');
  const tMap = useTranslations('map');

  const displayCafes = cafes.slice(0, TRENDING_CAFES_COUNT);

  return (
    <div className="flex flex-col rounded-(--radius-card) border border-edge-rule bg-surface-raised p-6">
      <div className="mb-6 shrink-0 border-b border-edge-rule pb-4">
        <h2 className="mb-2 text-2xl text-ink-primary">
          {t('trending_this_week')}
        </h2>
        <p className="text-ink-secondary">
          {tMap('top_cafes_subtitle')}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 flex-1">
        {isLoading ? (
          Array.from({ length: TRENDING_CAFES_COUNT }).map((_, index) => (
            <div key={index} className="animate-pulse overflow-hidden rounded-(--radius-card) border border-edge-rule">
              <div className="h-[180px] bg-surface-hover"></div>
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 rounded-sm bg-surface-hover"></div>
                <div className="h-3 w-1/2 rounded-sm bg-surface-hover"></div>
              </div>
            </div>
          ))
        ) : displayCafes.length === 0 ? (
          <RegisterCafeCTA variant="empty" />
        ) : (
          <>
            {displayCafes.map((cafe, index) => (
              <CafeCard
                size="sm"
                key={cafe.id}
                cafe={cafe}
                trendingRank={index + 1}
                locale={locale}
                googlePhoto={resolvedGooglePhoto(googlePhotos[cafe.id])}
                googlePhotoLoading={googlePhotos[cafe.id] === 'loading'}
              />
            ))}
            {displayCafes.length < TRENDING_CAFES_COUNT && (
              <RegisterCafeCTA variant="minimal" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
