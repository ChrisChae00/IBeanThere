'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { TrendingCafeResponse } from '@/types/api';
import TrendingCafeCard from './TrendingCafeCard';
import { TRENDING_CAFES_COUNT } from '@/lib/constants/cafe';
import { PlusIcon } from '@/components/ui';

interface TrendingCafesSectionProps {
  cafes: TrendingCafeResponse[];
  locale: string;
  isLoading: boolean;
  error?: string | null;
  onCheckIn?: (cafeId: string) => void;
}

function RegisterCafeCTA({ variant }: { variant: 'empty' | 'minimal' }) {
  const tMap = useTranslations('map');
  const locale = useLocale();

  if (variant === 'empty') {
    return (
      <div className="col-span-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 hover:shadow-inset-primary transition-shadow">
        <div className="text-center py-12 space-y-4">
          <div className="text-lg font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            {tMap('no_cafes_available')}
          </div>
          <div className="text-[var(--color-text-secondary)] font-semibold flex items-center justify-center gap-2 hover:text-[var(--color-text)] transition-colors">
            <span className="text-2xl">🧭</span>
            <span>{tMap('be_the_navigator')}</span>
          </div>
          <Link
            href={`/${locale}/discover/register-cafe`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon size={16} />
            {tMap('register_new_cafe')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] border border-dashed border-[var(--color-border)] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-sm text-[var(--color-text-secondary)]">
        {tMap('few_cafes_nearby')}
      </p>
      <Link
        href={`/${locale}/discover/register-cafe`}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-full text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
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
  error,
  onCheckIn
}: TrendingCafesSectionProps) {
  const t = useTranslations('discover.explore_map');
  const tMap = useTranslations('map');

  const displayCafes = cafes.slice(0, TRENDING_CAFES_COUNT);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col shadow-lg">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          {t('trending_this_week')}
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          {tMap('top_cafes_subtitle')}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 flex-1">
        {isLoading ? (
          Array.from({ length: TRENDING_CAFES_COUNT }).map((_, index) => (
            <div key={index} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 animate-pulse">
              <div className="w-16 h-16 bg-[var(--color-surface)] rounded-lg mb-3"></div>
              <div className="h-4 bg-[var(--color-surface)] rounded mb-2"></div>
              <div className="h-3 bg-[var(--color-surface)] rounded w-2/3"></div>
            </div>
          ))
        ) : displayCafes.length === 0 ? (
          <RegisterCafeCTA variant="empty" />
        ) : (
          <>
            {displayCafes.map((cafe) => (
              <TrendingCafeCard
                key={cafe.id}
                cafe={cafe}
                locale={locale}
                onCheckIn={onCheckIn}
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
