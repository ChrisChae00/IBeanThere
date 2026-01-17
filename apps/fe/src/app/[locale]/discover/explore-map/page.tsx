'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import MapSection from '@/components/map/MapSection';
import { getTrendingCafes } from '@/lib/api/cafes';
import { TrendingCafeResponse } from '@/types/api';
import { useLocation } from '@/hooks/useLocation';
import { calculateDistance } from '@/lib/utils/checkIn';
import { TrendingCafesSection, CafeGridCard } from '@/components/cafe';
import { CAFE_GRID_ITEMS_PER_PAGE } from '@/lib/constants/cafe';
import { PlusIcon } from '@/components/ui';

type FilterType = 'all' | 'closest' | 'top_rated' | 'most_popular';

interface CafeWithDistance extends TrendingCafeResponse {
  distance?: number;
}

export default function ExploreMapPage({
  params
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = useTranslations('discover.explore_map');
  const tMap = useTranslations('map');
  const { coords } = useLocation();
  const [trendingCafes, setTrendingCafes] = useState<CafeWithDistance[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<CafeWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Load trending cafes - refetch when location becomes available
  useEffect(() => {
    async function loadTrendingCafes() {
      try {
        setIsLoading(true);
        // Pass location if available for city-based trending
        const location = coords ? { lat: coords.latitude, lng: coords.longitude } : undefined;
        const cafes = await getTrendingCafes(12, 0, location);
        setTrendingCafes(cafes);
        setFilteredCafes(cafes);
      } catch (err) {
        console.error('Failed to load trending cafes:', err);
        setError('Failed to load trending cafes');
      } finally {
        setIsLoading(false);
      }
    }
    loadTrendingCafes();
  }, [coords]); // Refetch when coords change

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    
    let sorted = [...trendingCafes];
    
    switch (filter) {
      case 'all':
        setFilteredCafes(sorted);
        break;
      case 'closest':
        if (!coords) {
          // Show message if location not available
          setFilteredCafes(sorted);
          return;
        }
        // Calculate distances and sort
        sorted = sorted.map(cafe => ({
          ...cafe,
          distance: calculateDistance(
            coords.latitude,
            coords.longitude,
            typeof cafe.latitude === 'string' ? parseFloat(cafe.latitude) : cafe.latitude,
            typeof cafe.longitude === 'string' ? parseFloat(cafe.longitude) : cafe.longitude
          )
        }));
        sorted.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        setFilteredCafes(sorted);
        break;
      case 'top_rated':
        sorted.sort((a, b) => {
          const scoreA = typeof a.trending_score === 'string' ? parseFloat(a.trending_score) : (a.trending_score || 0);
          const scoreB = typeof b.trending_score === 'string' ? parseFloat(b.trending_score) : (b.trending_score || 0);
          return Number(scoreB) - Number(scoreA);
        });
        setFilteredCafes(sorted);
        break;
      case 'most_popular':
        sorted.sort((a, b) => (b.visit_count_14d || 0) - (a.visit_count_14d || 0));
        setFilteredCafes(sorted);
        break;
    }
  };
  
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Page Title Section with Gradient and CTA */}
      <section className="pt-6 pb-4 bg-gradient-to-b from-[var(--color-background)] to-[var(--color-surface)]/30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
                {t('title')}
              </h1>
              <p className="text-xl text-[var(--color-text-secondary)]">
                {t('subtitle')}
              </p>
            </div>
            <Link
              href={`/${locale}/discover/register-cafe`}
              className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 rounded-full font-semibold hover:bg-[var(--color-secondary)] transition-colors shadow-lg min-h-[44px] flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="text-xl font-bold" />
              {t('be_navigator')}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="pb-6">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Map */}
            <MapSection 
              locale={locale}
              mapTitle={tMap('map_title')}
              mapSubtitle={tMap('map_subtitle')}
            />

            {/* Top Trending Cafes */}
            <TrendingCafesSection
              cafes={trendingCafes}
              locale={locale}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              onClick={() => handleFilterChange('all')}
              className={`px-6 py-3 rounded-full font-medium transition-colors min-h-[44px] ${
                activeFilter === 'all'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primaryText)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]/80'
              }`}
            >
              {t('filter_all')}
            </button>
            <button 
              onClick={() => handleFilterChange('closest')}
              disabled={!coords}
              className={`px-6 py-3 rounded-full font-medium transition-colors min-h-[44px] ${
                activeFilter === 'closest'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primaryText)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]/80'
              } ${!coords ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!coords ? t('no_location') : ''}
            >
              {t('filter_closest')}
            </button>
            <button 
              onClick={() => handleFilterChange('top_rated')}
              className={`px-6 py-3 rounded-full font-medium transition-colors min-h-[44px] ${
                activeFilter === 'top_rated'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primaryText)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]/80'
              }`}
            >
              {t('filter_top_rated')}
            </button>
            <button 
              onClick={() => handleFilterChange('most_popular')}
              className={`px-6 py-3 rounded-full font-medium transition-colors min-h-[44px] ${
                activeFilter === 'most_popular'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primaryText)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]/80'
              }`}
            >
              {t('filter_most_popular')}
            </button>
          </div>
          <div className="text-center mt-4 text-sm text-[var(--color-text-secondary)]">
            {filteredCafes.length} {t('cafes_found')}
          </div>
        </div>
      </section>

      {/* Cafe Grid Section */}
      <section className="py-6">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: CAFE_GRID_ITEMS_PER_PAGE }).map((_, index) => (
                <div key={index} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-[var(--color-surface)]/50"></div>
                  <div className="p-4">
                    <div className="h-4 bg-[var(--color-surface)]/50 rounded mb-2"></div>
                    <div className="h-3 bg-[var(--color-surface)]/50 rounded w-2/3 mb-3"></div>
                    <div className="h-3 bg-[var(--color-surface)]/50 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : filteredCafes.length === 0 ? (
              <div className="col-span-full text-center py-16 space-y-4">
                <div className="text-lg font-medium text-[var(--color-text-secondary)]">
                  {tMap('no_cafes_available')}
                </div>
              </div>
            ) : (
              filteredCafes.map((cafe) => (
                <CafeGridCard
                  key={cafe.id}
                  cafe={cafe}
                  locale={locale}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Load More Section */}
      {filteredCafes.length > CAFE_GRID_ITEMS_PER_PAGE && (
        <section className="py-6">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <button className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[var(--color-secondary)] transition-colors shadow-lg min-h-[44px]">
              {tMap('load_more')}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

