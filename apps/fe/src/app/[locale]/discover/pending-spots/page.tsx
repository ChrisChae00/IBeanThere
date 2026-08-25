'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getPendingCafes } from '@/lib/api/cafes';
import { CafeSearchResponse } from '@/types/api';
import { LoadingSpinner } from '@/shared/ui';
import { PlusIcon } from '@/components/ui';
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
    <main className="min-h-screen bg-background">
      {/* Page Title Section with Gradient and CTA */}
      <section className="pt-6 pb-4 bg-linear-to-b from-background to-surface/30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
                {t('title')}
              </h1>
              <p className="text-xl text-ink-secondary">
                {t('subtitle')}
              </p>
            </div>
            <Link
              href={`/${locale}/discover/register-cafe`}
              className="bg-primary text-primaryText px-6 py-3 rounded-full font-semibold hover:bg-secondary transition-colors shadow-lg min-h-[44px] flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon size={20} className="text-primaryText" />
              {t('register_new')}
            </Link>
          </div>
        </div>
      </section>

      {/* Sort Tabs */}
      <section className="py-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSortMode('nearby')}
              disabled={!coords}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortMode === 'nearby'
                  ? 'bg-primary text-primaryText'
                  : 'bg-surface text-text border border-border hover:bg-surface-hover'
              } ${!coords ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {locale === 'ko' ? '가까운 순' : 'Nearby'}
            </button>
            <button
              onClick={() => setSortMode('newest')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortMode === 'newest'
                  ? 'bg-primary text-primaryText'
                  : 'bg-surface text-text border border-border hover:bg-surface-hover'
              }`}
            >
              {locale === 'ko' ? '최신순' : 'Newest'}
            </button>
            <button
              onClick={() => setSortMode('verification')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortMode === 'verification'
                  ? 'bg-primary text-primaryText'
                  : 'bg-surface text-text border border-border hover:bg-surface-hover'
              }`}
            >
              {locale === 'ko' ? '검증 필요' : 'Needs Verification'}
            </button>
          </div>
          {sortMode === 'nearby' && !coords && (
            <p className="text-sm text-ink-secondary mt-2">
              {locale === 'ko' ? '위치 권한을 허용하면 가까운 카페를 볼 수 있습니다' : 'Enable location to see cafes near you'}
            </p>
          )}
        </div>
      </section>

      {/* Pending Cafes Grid Section */}
      <section className="py-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="bg-surface rounded-xl p-8 border border-border"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-lg font-medium text-error mb-4">
                  {error}
                </div>
                <button
                  onClick={loadPendingCafes}
                  className="bg-primary text-primaryText px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : sortedCafes.length === 0 ? (
              <div className="text-center py-16 space-y-6">
                <div className="text-6xl">☕️</div>
                <div className="text-2xl font-bold text-text">
                  {t('no_pending')}
                </div>
                <p className="text-ink-secondary max-w-md mx-auto">
                  {locale === 'ko' 
                    ? '지역에서 새로운 카페를 발견하고 등록해보세요!' 
                    : 'Be the first to discover and register a new cafe in your neighborhood!'}
                </p>
                <Link
                  href={`/${locale}/discover/register-cafe`}
                  className="bg-primary text-primaryText px-8 py-4 rounded-full font-semibold text-lg hover:bg-secondary transition-colors shadow-lg min-h-[44px] inline-flex items-center justify-center"
                >
                  <span className="text-xl mr-2">🧭</span>
                  {t('register_new')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCafes.map((cafe) => (
                  <Link
                    key={cafe.id}
                    href={`/${locale}/cafes/${cafe.slug || cafe.id}`}
                    className="bg-background border border-border rounded-xl p-6 hover:shadow-inset-primary transition-shadow cursor-pointer block"
                  >
                  {/* Cafe Icon & Distance */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">☕️</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                        {cafe.status === 'pending' ? (locale === 'ko' ? '대기중' : 'Pending') : cafe.status}
                      </span>
                      {cafe.distance !== undefined && (
                        <span className="text-xs text-ink-secondary font-medium">
                          📍 {formatDistance(cafe.distance)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cafe Info */}
                  <h3 className="text-lg font-bold text-text mb-2 truncate" title={cafe.name}>
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
                    {cafe.verification_count && (
                      <div className="flex items-center gap-2 text-ink-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {cafe.verification_count}/3 {t('verification_count')}
                        </span>
                      </div>
                    )}
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
