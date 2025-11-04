'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { StarRating } from '@/components/ui';
import MapSection from '@/components/map/MapSection';
import { getTrendingCafes } from '@/lib/api/cafes';
import { TrendingCafeResponse } from '@/types/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TrendingCafesPage({
  params
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = useTranslations('trending_cafes');
  const [trendingCafes, setTrendingCafes] = useState<TrendingCafeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrendingCafes() {
      try {
        setIsLoading(true);
        const cafes = await getTrendingCafes(12, 0);
        setTrendingCafes(cafes);
      } catch (err) {
        console.error('Failed to load trending cafes:', err);
        setError('Failed to load trending cafes');
      } finally {
        setIsLoading(false);
      }
    }
    loadTrendingCafes();
  }, []);
  
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Page Title Section with Gradient */}
      <section className="pt-6 pb-4 bg-gradient-to-b from-[var(--color-background)] to-[var(--color-surface)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="pt-4 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Map */}
            <MapSection 
              locale={locale}
              mapTitle={t('map_title')}
              mapSubtitle={t('map_subtitle')}
            />

            {/* Top Trending Cafes */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col shadow-lg">
              <div className="mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                  {t('top_cafes_title')}
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                  {t('top_cafes_subtitle')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 animate-pulse">
                      <div className="w-16 h-16 bg-[var(--color-surface)] rounded-lg mb-3"></div>
                      <div className="h-4 bg-[var(--color-surface)] rounded mb-2"></div>
                      <div className="h-3 bg-[var(--color-surface)] rounded w-2/3"></div>
                    </div>
                  ))
                ) : trendingCafes.length === 0 ? (
                  <div className="col-span-2 text-center py-12 space-y-4">
                    <div className="text-lg font-medium text-[var(--color-text-secondary)]">
                      {t('no_cafes_available')}
                    </div>
                    <div className="text-[var(--color-text-secondary)] font-semibold flex items-center justify-center gap-2">
                      <span className="text-2xl">🧭</span>
                      <span>{t('be_the_navigator')}</span>
                    </div>
                  </div>
                ) : (
                  trendingCafes.slice(0, 4).map((cafe, index) => (
                    <div key={cafe.id} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 hover:shadow-inset-primary transition-shadow flex flex-col justify-between">
                      <div className="w-16 h-16 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                        <div className="text-white text-2xl">☕️</div>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-[var(--color-text)] mb-0.5 truncate" title={cafe.name}>
                          {cafe.name}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-3 truncate" title={cafe.address}>
                          {cafe.address}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="bg-[var(--color-accent)]/10 text-[var(--color-textSecondary)] px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            🔥 {t('trending')}
                          </span>
                          <button className="ml-auto bg-[var(--color-primary)] text-[var(--color-primaryText)] px-3 py-1 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors">
                            {t('visit')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-secondary)] transition-colors min-h-[44px]">
              {t('all')}
            </button>
            <button className="bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-surface)]/80 transition-colors border border-[var(--color-border)] min-h-[44px]">
              {t('nearby')}
            </button>
            <button className="bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-surface)]/80 transition-colors border border-[var(--color-border)] min-h-[44px]">
              {t('highest_rated')}
            </button>
            <button className="bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-surface)]/80 transition-colors border border-[var(--color-border)] min-h-[44px]">
              {t('most_reviewed')}
            </button>
          </div>
        </div>
      </section>

      {/* Cafe Grid Section */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-[var(--color-surface)]/50"></div>
                  <div className="p-4">
                    <div className="h-4 bg-[var(--color-surface)]/50 rounded mb-2"></div>
                    <div className="h-3 bg-[var(--color-surface)]/50 rounded w-2/3 mb-3"></div>
                    <div className="h-3 bg-[var(--color-surface)]/50 rounded w-1/2"></div>
                  </div>
                </div>
              ))
        ) : trendingCafes.length === 0 ? (
          <div className="col-span-full text-center py-16 space-y-4">
            <div className="text-lg font-medium text-[var(--color-text-secondary)]">
              {t('no_cafes_available')}
            </div>
            {/* <div className="text-[var(--color-accent)] font-semibold flex items-center justify-center gap-2">
              <span className="text-2xl">🧭</span>
              <span>{t('be_the_navigator')}</span>
            </div> */}
          </div>
        ) : (
              trendingCafes.map((cafe, index) => (
                <div key={cafe.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:shadow-inset-primary transition-shadow">
                  <div className="h-44 bg-[var(--color-surface)]/50 flex items-center justify-center">
                    <div className="text-4xl text-[var(--color-text-secondary)]">☕️</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[var(--color-text)] mb-1.5 text-sm truncate" title={cafe.name}>
                      {cafe.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-3 truncate" title={cafe.address}>
                      {cafe.address}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="bg-[var(--color-accent)]/10 text-[var(--color-textSecondary)] px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        🔥 {t('trending')}
                      </span>
                      <button className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-3 py-1 rounded-lg text-xs font-medium hover:bg-[var(--color-secondary)] transition-colors">
                        {t('visit')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Load More Section */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <button className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[var(--color-secondary)] transition-colors shadow-lg min-h-[44px]">
            {t('load_more')}
          </button>
        </div>
      </section>
    </main>
  );
}
