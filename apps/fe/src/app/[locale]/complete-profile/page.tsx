'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import CompleteProfileForm from '@/components/auth/CompleteProfileForm';
import { User, Coffee, Shield } from 'lucide-react';

export default function CompleteProfilePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const features = [
    {
      icon: <User size={16} className="text-[var(--color-background)]" />,
      text: t('feature_profile')
    },
    {
      icon: <Coffee size={16} className="text-[var(--color-background)]" />,
      text: t('feature_experience')
    },
    {
      icon: <Shield size={16} className="text-[var(--color-background)]" />,
      text: t('feature_security')
    }
  ];

  return (
    <AuthLayout
      title={t('complete_profile_title')}
      subtitle={t('complete_profile_subtitle')}
      features={features}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          {t('finish_setup')}
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          {t('finish_setup_desc')}
        </p>
      </div>
      
      <CompleteProfileForm locale={locale} returnUrl={returnUrl} />
    </AuthLayout>
  );
}
