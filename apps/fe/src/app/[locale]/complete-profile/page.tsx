'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth';
import { CompleteProfileForm } from '@/components/auth';

export default function CompleteProfilePage(
  props: {
    params: Promise<{ locale: string }>
  }
) {
  const params = use(props.params);
  const { locale } = params;
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  return (
    <AuthLayout
      title={t('complete_profile_title')}
      subtitle={t('complete_profile_subtitle')}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-(--color-text-primary) mb-2">
          {t('finish_setup')}
        </h2>
        <p className="text-ink-secondary">
          {t('finish_setup_desc')}
        </p>
      </div>
      
      <CompleteProfileForm locale={locale} returnUrl={returnUrl} />
    </AuthLayout>
  );
}
