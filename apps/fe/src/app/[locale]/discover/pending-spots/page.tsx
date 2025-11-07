'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getPendingCafes } from '@/lib/api/cafes';
import { CafeSearchResponse} from '@/types/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PlusIcon } from '@/components/ui';

export default function PendingSpotsPage({
  params
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = useTranslations('discover.pending_spots');
  const [pendingCafes, setPendingCafes] = useState<CafeSearchResponse['cafes']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPendingCafes() {
      try {
        setIsLoading(true);
        const response = await getPendingCafes();
        setPendingCafes(response.cafes);
      } catch (err) {
        console.error('Failed to load pending cafes:', err);
        setError('Failed to load pending cafes');
      } finally {
        setIsLoading(false);
      }
    }
    loadPendingCafes();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Page Title Section with Gradient and CTA */}
      <section className="pt-6 pb-4 bg-gradient-to-b from-[var(--color-background)] to-[var(--color-surface)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
                {t('title')}
              </h1>
              <p className="text-xl text-[var(--color-text-secondary)]">
                {t('subtitle')}
              </p>
            </div>
            <button
              className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 rounded-full font-semibold hover:bg-[var(--color-secondary)] transition-colors shadow-lg min-h-[44px] flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon size={20} className="text-[var(--color-primaryText)]" />
              {t('register_new')}
            </button>
          </div>
        </div>
      </section>

      {/* Pending Cafes Grid Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-lg font-medium text-[var(--color-error)] mb-4">
                {error}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : pendingCafes.length === 0 ? (
            <div className="text-center py-16 space-y-6">
              <div className="text-6xl">☕️</div>
              <div className="text-2xl font-bold text-[var(--color-text)]">
                {t('no_pending')}
              </div>
              <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
                Be the first to discover and register a new cafe in your neighborhood!
              </p>
              <button
                className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[var(--color-secondary)] transition-colors shadow-lg min-h-[44px]"
              >
                <span className="text-xl mr-2">🧭</span>
                {t('register_new')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCafes.map((cafe) => (
                <div
                  key={cafe.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Cafe Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">☕️</span>
                    </div>
                    <span className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-1 rounded-full text-xs font-semibold">
                      {cafe.status === 'pending' ? 'Pending' : cafe.status}
                    </span>
                  </div>

                  {/* Cafe Info */}
                  <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 truncate" title={cafe.name}>
                    {cafe.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2" title={cafe.address}>
                    {cafe.address}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4 text-sm">
                    {cafe.navigator_id && (
                      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">
                          {t('registered_by')}: Navigator
                        </span>
                      </div>
                    )}
                    {cafe.created_at && (
                      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {t('registered_on')}: {formatDate(cafe.created_at)}
                        </span>
                      </div>
                    )}
                    {cafe.verification_count && (
                      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {cafe.verification_count} {t('verification_count')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    className="w-full bg-[var(--color-primary)] text-[var(--color-primaryText)] px-4 py-3 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-colors min-h-[44px] flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {t('view_on_map')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

