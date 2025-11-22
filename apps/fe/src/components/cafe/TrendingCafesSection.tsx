'use client';

import { useTranslations } from 'next-intl';
import { TrendingCafeResponse } from '@/types/api';
import TrendingCafeCard from './TrendingCafeCard';
import { TRENDING_CAFES_COUNT, TRENDING_CAFES_COLUMNS } from '@/lib/constants/cafe';

interface TrendingCafesSectionProps {
  cafes: TrendingCafeResponse[];
  locale: string;
  isLoading: boolean;
  error?: string | null;
  onCheckIn?: (cafeId: string) => void;
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
        ) : cafes.length === 0 ? (
          <div className="col-span-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 hover:shadow-inset-primary transition-shadow">
            <div className="text-center py-12 space-y-4">
              <div className="text-lg font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                {tMap('no_cafes_available')}
              </div>
              <div className="text-[var(--color-text-secondary)] font-semibold flex items-center justify-center gap-2 hover:text-[var(--color-text)] transition-colors">
                <span className="text-2xl">🧭</span>
                <span>{tMap('be_the_navigator')}</span>
              </div>
            </div>
          </div>
        ) : (
          cafes.slice(0, TRENDING_CAFES_COUNT).map((cafe) => (
            <TrendingCafeCard 
              key={cafe.id} 
              cafe={cafe} 
              locale={locale}
              onCheckIn={onCheckIn}
            />
          ))
        )}
      </div>
    </div>
  );
}

