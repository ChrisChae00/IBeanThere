'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

type HeroClientProps = {
  locale: string;
};

export default function HeroClient({ locale }: HeroClientProps) {
  const { user, isLoading } = useAuth();
  const t = useTranslations('landing.hero');

  const isLoggedIn = !isLoading && !!user;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <a
        href={`/${locale}/discover/explore-map`}
        className="px-6 py-3 rounded-full border-2 border-[var(--color-textHero)] text-[var(--color-textHero)] bg-white/5 hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-all min-h-[48px] flex items-center justify-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      >
        {t('cta_secondary')}
      </a>
      <a
        href={isLoggedIn ? `/${locale}/discover/dropbean` : `/${locale}/register`}
        className="px-8 py-4 rounded-full bg-[var(--color-background)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] border-2 border-transparent transition-all transform hover:translate-y-[-2px] shadow-[0_15px_40px_rgba(0,0,0,0.25)] min-h-[56px] flex items-center justify-center text-center font-semibold"
      >
        {isLoggedIn ? t('cta_primary_logged_in') : t('cta_primary')}
      </a>
    </div>
  );
}
