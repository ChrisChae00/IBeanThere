'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

type CTAClientProps = {
  locale: string;
};

export default function CTAClient({ locale }: CTAClientProps) {
  const { user, isLoading } = useAuth();
  const t = useTranslations('landing.cta');

  const isLoggedIn = !isLoading && !!user;

  return (
    <a
      href={isLoggedIn ? `/${locale}/discover/dropbean` : `/${locale}/register`}
      className="inline-block px-8 py-4 text-lg font-medium rounded-full transition-all hover:scale-105 min-h-[56px] mb-8"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primaryText)',
        textAlign: 'center',
        textDecoration: 'none',
      }}
    >
      {isLoggedIn ? t('button_primary_logged_in') : t('button_primary')}
    </a>
  );
}
