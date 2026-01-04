'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { getCafeDetail } from '@/lib/api/cafes';
import { createLog } from '@/lib/api/logs';
import { LogFormData, CafeDetailResponse } from '@/types/api';
import CoffeeLogForm from '@/components/cafe/CoffeeLogForm';
import { LoadingSpinner } from '@/shared/ui';
import { ErrorAlert } from '@/shared/ui';

export default function WriteLogPage() {
  const t = useTranslations('cafe.log');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isLoading: authLoading } = useAuth();
  const cafeId = params.id as string;

  const [cafe, setCafe] = useState<CafeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const locale = params.locale as string;

    if (!user) {
      router.push(`/${locale}/signin`);
      return;
    }

    const fetchCafe = async () => {
      try {
        const cafeData = await getCafeDetail(cafeId);
        setCafe(cafeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error_loading_cafe'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCafe();
  }, [cafeId, user, authLoading, router, t, params]);

  const handleSubmit = async (data: LogFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const locale = params.locale as string;
      await createLog(cafe!.id, data);
      const cafePath = cafe!.slug || cafe!.id;
      router.push(`/${locale}/cafes/${cafePath}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_creating_log'));
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const locale = params.locale as string;
    const cafePath = cafe?.slug || cafeId;
    router.push(`/${locale}/cafes/${cafePath}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ErrorAlert message={error || t('cafe_not_found')} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-surfaceText)] mb-2">
            {locale === 'ko' ? `${cafe.name} ${t('write_log_for')}` : `${t('write_log_for')} ${cafe.name}`}
          </h1>
          <p className="text-sm text-[var(--color-surfaceTextSecondary)]">
            {t('write_log_description')}
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} />
          </div>
        )}

        <CoffeeLogForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}

