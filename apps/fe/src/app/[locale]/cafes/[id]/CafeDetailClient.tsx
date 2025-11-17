'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CafeDetailResponse } from '@/types/api';
import CafeInfoSection from '@/components/cafe/CafeInfoSection';
import CoffeeLogFeed from '@/components/cafe/CoffeeLogFeed';
import StarRating from '@/components/ui/StarRating';
import { useAuth } from '@/hooks/useAuth';

interface CafeDetailClientProps {
  cafe: CafeDetailResponse;
}

export default function CafeDetailClient({ cafe }: CafeDetailClientProps) {
  const t = useTranslations('cafe.detail');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();

  const handleWriteLog = () => {
    if (!user) {
      router.push(`/${locale}/signin`);
      return;
    }
    const cafePath = cafe.slug || cafe.id;
    router.push(`/${locale}/cafes/${cafePath}/log`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-cardText)] mb-2">{cafe.name}</h1>
        {cafe.average_rating && (
          <div className="flex items-center gap-2">
            <StarRating rating={cafe.average_rating} size="lg" />
            <span className="text-sm text-[var(--color-cardTextSecondary)]">
              ({cafe.log_count} {t('logs')})
            </span>
          </div>
        )}
      </div>

      {/* Cafe Info Section Card */}
      <div className="mb-6 p-6 bg-[var(--color-cardBackground)] rounded-lg shadow-[var(--color-cardShadow)]">
        <CafeInfoSection cafe={cafe} />
      </div>

      {/* Stats Card */}
      {cafe.average_rating && (
        <div className="mb-6 p-6 bg-[var(--color-cardBackground)] rounded-lg shadow-[var(--color-cardShadow)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--color-cardTextSecondary)]">{t('average_rating')}</p>
              <p className="text-2xl font-bold text-[var(--color-cardText)]">
                {cafe.average_rating.toFixed(1)}/5
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-cardTextSecondary)]">{t('total_logs')}</p>
              <p className="text-2xl font-bold text-[var(--color-cardText)]">{cafe.log_count}</p>
            </div>
          </div>
        </div>
      )}

      {/* Coffee Logs Feed Card */}
      <div className="mb-8 p-6 bg-[var(--color-cardBackground)] rounded-lg shadow-[var(--color-cardShadow)]">
        <h2 className="text-xl font-bold text-[var(--color-cardText)] mb-4">{t('coffee_logs')}</h2>
        <CoffeeLogFeed cafeId={cafe.id} initialLogs={cafe.recent_logs || []} />
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleWriteLog}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-50"
        aria-label={t('write_log')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

