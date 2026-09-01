'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getPendingCafes } from '@/lib/api/cafes';
import { CafeSearchResponse } from '@/types/api';
import { LoadingSpinner } from '@/shared/ui';
import { PlusIcon } from '@/components/ui';
import { Coffee, MapPin } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { calculateDistance } from '@/lib/utils/checkIn';

type SortMode = 'nearby' | 'newest' | 'verification';

type CafeFromResponse = CafeSearchResponse['cafes'][0];

type CafeWithDistance = CafeFromResponse & {
  distance?: number;
};

export default function PendingSpotsPage() {
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const t = useTranslations('discover.pending_spots');
  const { coords } = useLocation();
  const [pendingCafes, setPendingCafes] = useState<CafeWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const loadPendingCafes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPendingCafes();
      setPendingCafes(response.cafes || []);
    } catch (err) {
      console.error('Failed to load pending cafes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pending cafes';
      setError(errorMessage);
      setPendingCafes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingCafes();
  }, [loadPendingCafes, pathname]);
  
  useEffect(() => {
    const handleFocus = () => {
      loadPendingCafes();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadPendingCafes]);

  // Calculate distances and sort cafes
  const sortedCafes = useMemo(() => {
    let cafesWithDistance = pendingCafes.map(cafe => {
      if (coords) {
        const distance = calculateDistance(
          coords.latitude,
          coords.longitude,
          cafe.latitude,
          cafe.longitude
        );
        return { ...cafe, distance };
      }
      return { ...cafe, distance: undefined };
    });

    switch (sortMode) {
      case 'nearby':
        if (coords) {
          cafesWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
        break;
      case 'newest':
        cafesWithDistance.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'verification':
        cafesWithDistance.sort((a, b) => 
          (b.verification_count || 0) - (a.verification_count || 0)
        );
        break;
    }

    return cafesWithDistance;
  }, [pendingCafes, sortMode, coords]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDistance = (distance: number | undefined) => {
    if (distance === undefined) return null;
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <main className="min-h-screen bg-surface-page">
      {/* Page Title Section with Gradient and CTA */}
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
              href={`/${locale}/discover/register-cafe`}
              className="relief-control flex min-h-11 items-center gap-2 whitespace-nowrap rounded-(--btn-radius) bg-brand px-6 font-semibold text-ink-on-brand"
            >
              <PlusIcon size={20} />
              {t('register_new')}
            </Link>
          </div>
        </div>
      </section>

      {/* Sort Tabs */}
      <section className="py-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {([
              ['nearby', t('sort_nearby')],
              ['newest', t('sort_newest')],
              ['verification', t('sort_needs_verification')],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                disabled={mode === 'nearby' && !coords}
                className={`landing-micro min-h-11 rounded-(--radius-pill) border px-5 disabled:opacity-50 ${
                  sortMode === mode
                    ? 'relief-pressed border-brand bg-brand/12 text-ink-primary'
                    : 'relief-control border-edge-rule bg-surface-raised text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {sortMode === 'nearby' && !coords && (
            <p className="mt-2 text-sm text-ink-secondary">{t('location_hint')}</p>
          )}
        </div>
      </section>

      {/* Pending Cafes Grid Section */}
      <section className="py-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-(--radius-card) border border-edge-rule bg-surface-raised p-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="mb-4 text-lg font-medium text-ink-primary">
                  {error}
                </div>
                <button
                  onClick={loadPendingCafes}
                  className="relief-control min-h-11 rounded-(--btn-radius) bg-brand px-6 font-semibold text-ink-on-brand"
                >
                  {t('retry')}
                </button>
              </div>
            ) : sortedCafes.length === 0 ? (
              <div className="space-y-5 py-16 text-center">
                <Coffee size={40} className="mx-auto text-ink-secondary" strokeWidth={1.5} />
                <div className="text-2xl text-ink-primary">
                  {t('no_pending')}
                </div>
                <p className="mx-auto max-w-md text-ink-secondary">{t('empty_hint')}</p>
                <Link
                  href={`/${locale}/discover/register-cafe`}
                  className="relief-control inline-flex min-h-11 items-center justify-center rounded-(--btn-radius) bg-brand px-8 font-semibold text-ink-on-brand"
                >
                  {t('register_new')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCafes.map((cafe) => (
                  <Link
                    key={cafe.id}
                    href={`/${locale}/cafes/${cafe.slug || cafe.id}`}
                    className="block cursor-pointer rounded-(--radius-card) border border-edge-rule bg-surface p-6 transition-shadow hover:shadow-inset-primary"
                  >
                  {/* Cafe Icon & Distance */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-(--radius-control) bg-brand/12">
                      <Coffee size={28} className="text-brand" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="landing-micro rounded-(--radius-pill) border border-edge-rule px-3 py-1.5 text-ink-secondary">
                        {cafe.status === 'pending' ? t('status_pending') : cafe.status}
                      </span>
                      {cafe.distance !== undefined && (
                        <span className="flex items-center gap-1 text-xs font-medium text-ink-secondary">
                          <MapPin size={12} />
                          {formatDistance(cafe.distance)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cafe Info */}
                  <h3 className="mb-2 truncate font-sans text-lg font-semibold text-ink-primary" title={cafe.name}>
                    {cafe.name}
                  </h3>
                  <p className="text-sm text-ink-secondary mb-4 line-clamp-2" title={cafe.address}>
                    {cafe.address}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4 text-sm">
                    {cafe.created_at && (
                      <div className="flex items-center gap-2 text-ink-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {t('registered_on')}: {formatDate(cafe.created_at)}
                        </span>
                      </div>
                    )}
                    {/* `&&` on a number prints the 0 — this row is a count, so it has to be a ternary. */}
                    {cafe.verification_count ? (
                      <div className="flex items-center gap-2 text-ink-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {cafe.verification_count}/3 {t('verification_count')}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
          </div>
        </div>
      </section>
    </main>
  );
}
