'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import MapSection from '@/components/map/MapSection';
import { getGoogleCafePhoto, getTrendingCafes, type TrendingSortBy } from '@/lib/api/cafes';
import { GoogleCafePhoto, TrendingCafeResponse } from '@/types/api';
import { useLocation } from '@/hooks/useLocation';
import { TrendingCafesSection, CafeCard } from '@/components/cafe';
import { CAFE_GRID_ITEMS_PER_PAGE, GOOGLE_PLACE_PHOTO_PER_PAGE_LIMIT, TRENDING_CAFES_COUNT } from '@/lib/constants/cafe';
import { RegisterCafeCTA } from '@/components/cafe/TrendingCafesSection';

type FilterType = 'all' | 'closest' | 'most_popular';
type GooglePhotoState = GoogleCafePhoto | null | 'loading';

const resolvedGooglePhoto = (photo?: GooglePhotoState) =>
  photo === 'loading' ? undefined : photo;

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
  const [googlePhotos, setGooglePhotos] = useState<Record<string, GooglePhotoState>>({});
  const requestedGooglePhotos = useRef(new Set<string>());

  const location = useMemo(
    () => (coords ? { lat: coords.latitude, lng: coords.longitude } : undefined),
    [coords]
  );

  useEffect(() => {
    const remaining = GOOGLE_PLACE_PHOTO_PER_PAGE_LIMIT - requestedGooglePhotos.current.size;
    if (remaining <= 0) return;

    const candidates = [...trendingCafes, ...cafes].filter(
      (cafe, index, all) =>
        !cafe.main_image && !cafe.image &&
        !requestedGooglePhotos.current.has(cafe.id) &&
        all.findIndex((item) => item.id === cafe.id) === index
    ).slice(0, remaining);
    if (!candidates.length) return;

    candidates.forEach((cafe) => requestedGooglePhotos.current.add(cafe.id));
    setGooglePhotos((current) => ({
      ...current,
      ...Object.fromEntries(candidates.map((cafe) => [cafe.id, 'loading'])),
    }));
    candidates.forEach((cafe) => {
      getGoogleCafePhoto(cafe.id).then((photo) => {
        setGooglePhotos((current) => ({ ...current, [cafe.id]: photo }));
      });
    });
  }, [trendingCafes, cafes]);

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

  /*
    Filters carry their state in relief rather than in fill: the page's one filled
    control is the register action, and a colour-swap hover has no room left in the
    Matcha palette.
  */
  const filterClass = (filter: FilterType) =>
    `landing-micro min-h-11 rounded-(--radius-pill) border px-5 disabled:opacity-50 ${
      activeFilter === filter
        ? 'relief-pressed border-brand bg-brand/12 text-ink-primary'
        : 'relief-control border-edge-rule bg-surface-raised text-ink-secondary hover:text-ink-primary'
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
              isLoading={isLoading && trendingCafes.length === 0}
              googlePhotos={googlePhotos}
            />
          </div>
        </div>
      </section>

      {/* Cafe Grid Section */}
      <section className="py-6">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button onClick={() => setActiveFilter('all')} className={filterClass('all')}>
              {t('filter_all')}
            </button>
            <button
              onClick={() => setActiveFilter('closest')}
              disabled={!coords}
              title={!coords ? t('no_location') : ''}
              className={filterClass('closest')}
            >
              {t('filter_closest')}
            </button>
            <button
              onClick={() => setActiveFilter('most_popular')}
              className={filterClass('most_popular')}
            >
              {t('filter_most_popular')}
            </button>
            <span className="landing-micro ml-auto text-ink-secondary">
              {t('showing_cafes', { count: cafes.length })}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: CAFE_GRID_ITEMS_PER_PAGE }).map((_, index) => (
                <div key={index} className="animate-pulse overflow-hidden rounded-(--radius-card) border border-edge-rule bg-surface">
                  <div className="h-[200px] bg-surface-hover"></div>
                  <div className="space-y-2 p-4">
                    <div className="h-4 rounded-sm bg-surface-hover"></div>
                    <div className="h-3 w-2/3 rounded-sm bg-surface-hover"></div>
                    <div className="mt-3 h-8 w-1/2 rounded-(--radius-pill) bg-surface-hover"></div>
                  </div>
                </div>
              ))
            ) : cafes.length === 0 ? (
              <RegisterCafeCTA variant="empty" />
            ) : (
              cafes.map((cafe) => (
                <CafeCard
                  key={cafe.id}
                  cafe={cafe}
                  locale={locale}
                  googlePhoto={resolvedGooglePhoto(googlePhotos[cafe.id])}
                  googlePhotoLoading={googlePhotos[cafe.id] === 'loading'}
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
                  className="relief-control min-h-11 rounded-(--btn-radius) bg-brand px-6 font-semibold text-ink-on-brand disabled:opacity-60"
                >
                  {tMap('load_more')}
                </button>
              )}
              {cafes.length > CAFE_GRID_ITEMS_PER_PAGE && (
                <button
                  onClick={handleShowLess}
                  className="relief-control min-h-11 rounded-(--btn-radius) border border-edge-rule px-6 font-medium text-ink-primary"
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
