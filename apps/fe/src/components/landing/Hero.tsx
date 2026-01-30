import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import HeroClient from './HeroClient';

export default async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'landing.hero' });
  
  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Background Image */}
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
        {/* Black overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Theme color gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/90 via-[var(--color-primary)]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-start pt-[30%] sm:pt-[25%] md:pt-[20%] lg:pt-[20%]">
        <div className="max-w-3xl space-y-4 sm:space-y-6 motion-slide-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-textHero)] leading-tight drop-shadow-lg break-keep">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--color-textHero)] leading-relaxed drop-shadow break-keep max-w-2xl">
            {t('subtitle')}
          </p>
          <HeroClient locale={locale} />
        </div>
      </div>
    </section>
  );
}

