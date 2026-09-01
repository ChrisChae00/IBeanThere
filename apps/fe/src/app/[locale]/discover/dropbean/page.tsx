'use client';

import { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { searchCafes } from '@/lib/api/cafes';
import { CafeMapData } from '@/types/map';
import { calculateDistance } from '@/lib/utils/checkIn';
import { DropBeanButton, GrowthIcon } from '@/components/cafe';
import { Button, LoadingSpinner } from '@/components/ui';
import { LocationIcon } from '@/shared/ui';

const NEARBY_RADIUS_METERS = 50;

export default function NearbyPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = use(props.params);
  const { locale } = params;
  const t = useTranslations('dropbean');
  const tNav = useTranslations('navigation');
  const { user } = useAuth();
  const { coords, getCurrentLocation, isLoading: locationLoading, error: locationError } = useLocation();

  const [cafes, setCafes] = useState<(CafeMapData & { distance: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);

  const fetchNearbyCafes = async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Search cafes within 500m first, then filter to 50m client-side
      const result = await searchCafes(lat, lng, 500);
      
      // Calculate distance to each cafe and filter to 50m
      const cafesWithDistance = (result.cafes || [])
        .map((cafe: CafeMapData) => ({
          ...cafe,
          distance: calculateDistance(
            lat, lng,
            parseFloat(String(cafe.latitude)),
            parseFloat(String(cafe.longitude))
          )
        }))
        .filter((cafe: CafeMapData & { distance: number }) => cafe.distance <= NEARBY_RADIUS_METERS)
        .sort((a: CafeMapData & { distance: number }, b: CafeMapData & { distance: number }) => a.distance - b.distance);
      
      setCafes(cafesWithDistance);
    } catch (err) {
      console.error('Failed to fetch nearby cafes:', err);
      setError('Failed to fetch nearby cafes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableLocation = async () => {
    setLocationRequested(true);
    try {
      const position = await getCurrentLocation();
      await fetchNearbyCafes(position.latitude, position.longitude);
    } catch (err) {
      console.error('Location error:', err);
    }
  };

  // Auto-fetch location if permission is already granted
  useEffect(() => {
    const checkPermissionAndFetch = async () => {
      if (typeof navigator !== 'undefined' && navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          if (permission.state === 'granted' && !locationRequested) {
            // Permission already granted, auto-fetch location
            handleEnableLocation();
          }
        } catch (err) {
          // Permissions API not supported, wait for coords from hook
          console.log('Permissions API not supported');
        }
      }
    };
    
    checkPermissionAndFetch();
  }, []);

  useEffect(() => {
    if (coords && !locationRequested) {
      setLocationRequested(true);
      fetchNearbyCafes(coords.latitude, coords.longitude);
    }
  }, [coords]);

  return (
    <main className="min-h-screen bg-surface-page">
      {/* Page Title Section with Gradient - matching explore-map */}
      <section className="pt-10 pb-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="landing-display text-[clamp(2.5rem,6vw,4.5rem)] text-ink-primary">
                {t('title')}
              </h1>
              <p className="mt-3 text-lg text-ink-secondary">
                {t('subtitle')}
              </p>
            </div>
            <Link
              href={`/${locale}/discover/explore-map`}
              className="relief-control flex min-h-11 items-center gap-2 whitespace-nowrap rounded-(--btn-radius) border border-edge-rule px-6 font-semibold text-ink-primary"
            >
              {t('view_cafe_map')}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-6 pb-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-(--radius-card) border border-edge-rule bg-surface-raised px-5 py-4">
              <p className="text-sm text-ink-primary">{t('load_error')}</p>
              <button
                onClick={() => coords && fetchNearbyCafes(coords.latitude, coords.longitude)}
                className="relief-control min-h-11 rounded-(--btn-radius) border border-edge-rule px-4 text-sm font-medium text-ink-primary"
              >
                {t('retry')}
              </button>
            </div>
          )}

          {/* Location Permission Required */}
          {!coords && !locationLoading && !locationRequested && (
            <div className="rounded-(--radius-card) border border-edge-rule bg-surface-raised p-8 text-center">
              <MapPin size={36} className="mx-auto mb-4 text-ink-secondary" strokeWidth={1.5} />
              <h2 className="mb-2 text-xl text-ink-primary">
                {t('location_required')}
              </h2>
              <p className="text-ink-secondary mb-6">
                {t('enable_location_hint')}
              </p>
              <Button
                onClick={handleEnableLocation}
                leftIcon={<LocationIcon size={20} />}
                loading={locationLoading}
              >
                {t('enable_location')}
              </Button>
            </div>
          )}

          {/* Loading State */}
          {(isLoading || locationLoading) && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-ink-secondary">{t('loading')}</p>
            </div>
          )}

          {/* No Cafes Found */}
          {!isLoading && !locationLoading && locationRequested && cafes.length === 0 && (
            <div className="rounded-(--radius-card) border border-edge-rule bg-surface-raised p-8 text-center">
              <Search size={36} className="mx-auto mb-4 text-ink-secondary" strokeWidth={1.5} />
              <h2 className="mb-2 text-xl text-ink-primary">
                {t('no_cafes')}
              </h2>
              <p className="text-ink-secondary mb-6">
                {t('no_cafes_hint')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/${locale}/discover/explore-map`}
                  className="relief-control inline-flex min-h-11 items-center rounded-(--btn-radius) bg-brand px-6 font-semibold text-ink-on-brand"
                >
                  {t('view_cafe_map')}
                </Link>
                <Link
                  href={`/${locale}/discover/register-cafe`}
                  className="relief-control inline-flex min-h-11 items-center rounded-(--btn-radius) border border-edge-rule px-6 font-medium text-ink-primary"
                >
                  {t('register_new_cafe')}
                </Link>
              </div>
            </div>
          )}

          {/* Cafe Grid */}
          {!isLoading && cafes.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-ink-primary">
                  {t('cafes_within_50m')}
                </h2>
                <span className="text-ink-secondary">
                  {t('cafe_count', { count: cafes.length })}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cafes.map((cafe) => (
                  <div
                    key={cafe.id}
                    className="rounded-(--radius-card) border border-edge-rule bg-surface-raised p-5 transition-shadow hover:shadow-inset-primary"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <Link
                          href={`/${locale}/cafes/${cafe.slug || cafe.id}`}
                          className="block"
                        >
                          <h3 className="line-clamp-1 font-sans text-lg font-semibold text-ink-primary transition-colors hover:text-brand">
                            {cafe.name}
                          </h3>
                        </Link>
                        {cafe.address && (
                          <p className="text-sm text-ink-secondary line-clamp-2 mt-2">
                            {cafe.address}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="landing-micro rounded-(--radius-pill) border border-brand bg-brand/12 px-3 py-1.5 text-ink-primary">
                            {t('m_away', { distance: Math.round(cafe.distance) })}
                          </span>
                          {cafe.status === 'verified' && (
                            <span className="landing-micro flex items-center gap-1.5 rounded-(--radius-pill) bg-state-success/12 px-3 py-1.5 text-ink-primary">
                              <span aria-hidden className="h-1.5 w-1.5 rounded-(--radius-pill) bg-state-success" />
                              {t('verified')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Drop Bean Button */}
                      <div className="mt-4 border-t border-edge-rule pt-4">
                        {user ? (
                          <DropBeanButton
                            cafeId={cafe.id}
                            cafeLat={parseFloat(String(cafe.latitude))}
                            cafeLng={parseFloat(String(cafe.longitude))}
                            size="sm"
                            showGrowthInfo={false}
                          />
                        ) : (
                          <Link
                            href={`/${locale}/signin`}
                            className="relief-control flex min-h-11 w-full items-center justify-center rounded-(--btn-radius) bg-brand px-4 text-sm font-semibold text-ink-on-brand"
                          >
                            {t('sign_in_to_drop')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Refresh Button */}
          {locationRequested && coords && !isLoading && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => fetchNearbyCafes(coords.latitude, coords.longitude)}
                variant="secondary"
              >
                {t('refresh')}
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
