'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import MapSection from '@/components/map/MapSection';
import { getTrendingCafes, type TrendingSortBy } from '@/lib/api/cafes';
import { TrendingCafeResponse } from '@/types/api';
import { useLocation } from '@/hooks/useLocation';
import { TrendingCafesSection, CafeGridCard } from '@/components/cafe';
import { CAFE_GRID_ITEMS_PER_PAGE, TRENDING_CAFES_COUNT } from '@/lib/constants/cafe';

type FilterType = 'all' | 'closest' | 'most_popular';

// Sorting happens on the server: the grid only ever holds the pages fetched so
// far, so sorting client-side would only reorder those and leave later pages
// appended out of order.
const FILTER_SORT: Record<FilterType, TrendingSortBy> = {
  all: 'trending',
  closest: 'distance',
  most_popular: 'popular',
};

interface ExploreMapClientProps {
  locale: string;
  initialCafes: TrendingCafeResponse[];
}

export default function ExploreMapClient({ locale, initialCafes }: ExploreMapClientProps) {
  const t = useTranslations('discover.explore_map');
  const tMap = useTranslations('map');
  const { coords } = useLocation();

  // Panel always shows the trending order, independent of the grid's filter
  const [trendingCafes, setTrendingCafes] = useState<TrendingCafeResponse[]>(
    initialCafes.slice(0, TRENDING_CAFES_COUNT)
  );
  const [cafes, setCafes] = useState<TrendingCafeResponse[]>(initialCafes);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hasMore, setHasMore] = useState(initialCafes.length === CAFE_GRID_ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const location = useMemo(
    () => (coords ? { lat: coords.latitude, lng: coords.longitude } : undefined),
    [coords]
  );

  // Refresh the trending panel once coordinates arrive so it shows local results
  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    getTrendingCafes(TRENDING_CAFES_COUNT, 0, location, 'trending').then((top) => {
      if (!cancelled && top.length > 0) setTrendingCafes(top);
    });

    return () => {
      cancelled = true;
    };
  }, [location]);

  // Load page 1 of the grid whenever the filter or the location changes
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      // The server already rendered page 1 for the default filter without location
      if (!location && activeFilter === 'all') return;
    }

    let cancelled = false;
    setIsLoading(true);

    getTrendingCafes(CAFE_GRID_ITEMS_PER_PAGE, 0, location, FILTER_SORT[activeFilter])
      .then((page) => {
        if (cancelled) return;
        setCafes(page);
        setHasMore(page.length === CAFE_GRID_ITEMS_PER_PAGE);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location, activeFilter]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const page = await getTrendingCafes(
        CAFE_GRID_ITEMS_PER_PAGE,
        cafes.length,
        location,
        FILTER_SORT[activeFilter]
      );
      setCafes((prev) => [...prev, ...page]);
      // A short page means the server has nothing left to give
      setHasMore(page.length === CAFE_GRID_ITEMS_PER_PAGE);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleShowLess = () => {
    setCafes((prev) => prev.slice(0, CAFE_GRID_ITEMS_PER_PAGE));
    setHasMore(true);
  };

  const filterButtonClass = (filter: FilterType) =>
    `px-6 py-3 rounded-full font-medium transition-colors min-h-[44px] ${
      activeFilter === filter
        ? 'bg-primary text-primaryText'
        : 'bg-surface text-text border border-border hover:bg-surface/80'
    }`;

  return (
    <>
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
              isLoading={false}
            />
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setActiveFilter('all')}
              className={filterButtonClass('all')}
            >
              {t('filter_all')}
            </button>
            <button
              onClick={() => setActiveFilter('closest')}
              disabled={!coords}
              className={`${filterButtonClass('closest')} ${!coords ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!coords ? t('no_location') : ''}
            >
              {t('filter_closest')}
            </button>
            <button
              onClick={() => setActiveFilter('most_popular')}
              className={filterButtonClass('most_popular')}
            >
              {t('filter_most_popular')}
            </button>
          </div>
          <div className="text-center mt-4 text-sm text-(--color-text-secondary)">
            {t('showing_cafes', { count: cafes.length })}
          </div>
        </div>
      </section>

      {/* Cafe Grid Section */}
      <section className="py-6">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: CAFE_GRID_ITEMS_PER_PAGE }).map((_, index) => (
                <div key={index} className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-surface/50"></div>
                  <div className="p-4">
                    <div className="h-4 bg-surface/50 rounded-sm mb-2"></div>
                    <div className="h-3 bg-surface/50 rounded-sm w-2/3 mb-3"></div>
                    <div className="h-3 bg-surface/50 rounded-sm w-1/2"></div>
                  </div>
                </div>
              ))
            ) : cafes.length === 0 ? (
              <div className="col-span-full text-center py-16 space-y-4">
                <div className="text-lg font-medium text-(--color-text-secondary)">
                  {tMap('no_cafes_available')}
                </div>
              </div>
            ) : (
              cafes.map((cafe) => (
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
      {!isLoading && (hasMore || cafes.length > CAFE_GRID_ITEMS_PER_PAGE) ? (
        <section className="py-6">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 justify-center">
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-primary text-primaryText px-8 py-4 rounded-full font-semibold text-lg hover:bg-secondary transition-colors shadow-lg min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {tMap('load_more')}
                </button>
              )}
              {cafes.length > CAFE_GRID_ITEMS_PER_PAGE && (
                <button
                  onClick={handleShowLess}
                  className="border border-border text-text px-8 py-4 rounded-full font-semibold text-lg hover:bg-surface transition-colors min-h-[44px]"
                >
                  {tMap('show_less')}
                </button>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
