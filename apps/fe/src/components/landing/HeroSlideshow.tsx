'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// TODO: slideshow disabled — only slide 0 shown. Re-enable when ready.
// const SLIDE_COUNT = 3;
// const SLIDE_INTERVAL = 6000;

type HeroSlideshowProps = {
  locale: string;
};

export default function HeroSlideshow({ locale }: HeroSlideshowProps) {
  const t = useTranslations('landing.hero');
  const { user, isLoading } = useAuth();
  const isLoggedIn = !isLoading && !!user;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background — slide 0 */}
      <div className="absolute inset-0">
        <Image
          src="/pics/heroCafepic.jpg"
          alt="warm cozy coffee shop interior"
          fill
          className="object-cover"
          priority
          quality={90}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/90 via-[var(--color-primary)]/40 to-transparent" />
      </div>

      {/* Content — slide 0 */}
      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-start pt-[30%] sm:pt-[25%] md:pt-[20%] lg:pt-[20%]">
        <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl space-y-4 sm:space-y-6 motion-slide-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-textHero)] leading-tight drop-shadow-lg break-keep">
            {t.rich('title', { mobileBr: () => <br className="block" /> })}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--color-textHero)] leading-relaxed drop-shadow break-keep max-w-2xl lg:max-w-4xl">
            {t.rich('subtitle', {
              mobileBr: () => <br className="block sm:hidden" />,
              mediumBr: () => <br className="block xl:hidden" />,
            })}
          </p>
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
        </div>
      </div>
    </div>
  );
}
