'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { searchCafes } from '@/lib/api/cafes';
import { CafeMapData } from '@/types/map';
import { calculateDistance } from '@/lib/utils/checkIn';
import { DropBeanButton, GrowthIcon } from '@/components/cafe';
import { Button, LoadingSpinner } from '@/components/ui';
import LocationIcon from '@/components/ui/LocationIcon';

const NEARBY_RADIUS_METERS = 50;

export default function NearbyPage({
  params
}: {
  params: { locale: string };
}) {
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
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Page Title Section with Gradient - matching explore-map */}
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
              href={`/${locale}/discover/explore-map`}
              className="bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] px-6 py-3 rounded-full font-semibold hover:bg-[var(--color-surface)]/80 transition-colors shadow-lg min-h-[44px] flex items-center gap-2 whitespace-nowrap"
            >
              {t('view_cafe_map')}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-6 pb-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Location Permission Required */}
          {!coords && !locationLoading && !locationRequested && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">📍</div>
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                {t('location_required')}
              </h2>
              <p className="text-[var(--color-textSecondary)] mb-6">
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
              <p className="text-[var(--color-textSecondary)]">{t('loading')}</p>
            </div>
          )}

          {/* No Cafes Found */}
          {!isLoading && !locationLoading && locationRequested && cafes.length === 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                {t('no_cafes')}
              </h2>
              <p className="text-[var(--color-textSecondary)] mb-6">
                {t('no_cafes_hint')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/${locale}/discover/explore-map`}
                  className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-full font-medium hover:bg-[var(--color-secondary)] transition-colors"
                >
                  {t('view_cafe_map')}
                </Link>
                <Link
                  href={`/${locale}/discover/register-cafe`}
                  className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-full font-medium hover:bg-[var(--color-surface)] transition-colors"
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
                <h2 className="text-2xl font-bold text-[var(--color-text)]">
                  50m 이내 카페
                </h2>
                <span className="text-[var(--color-textSecondary)]">
                  {cafes.length}개 카페
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cafes.map((cafe) => (
                  <div
                    key={cafe.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-primary)]/50 hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <Link
                          href={`/${locale}/cafes/${cafe.slug || cafe.id}`}
                          className="block"
                        >
                          <h3 className="text-lg font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                            {cafe.name}
                          </h3>
                        </Link>
                        {cafe.address && (
                          <p className="text-sm text-[var(--color-textSecondary)] line-clamp-2 mt-2">
                            {cafe.address}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-medium">
                            {t('m_away', { distance: Math.round(cafe.distance) })}
                          </span>
                          {cafe.status === 'verified' && (
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded-full">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Drop Bean Button */}
                      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
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
                            className="block w-full px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-lg font-medium text-sm text-center hover:bg-[var(--color-secondary)] transition-colors"
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
