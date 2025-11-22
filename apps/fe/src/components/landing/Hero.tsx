import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

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
      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-start pt-[70%] sm:pt-[50%] lg:pt-[20%]">
        <div className="max-w-3xl space-y-6 motion-slide-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-textHero)] leading-tight drop-shadow-lg break-keep">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-2xl text-[var(--color-textHero)] leading-relaxed drop-shadow break-keep">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`/${locale}/discover/explore-map`}
              className="px-6 py-3 rounded-full border-2 border-[var(--color-textHero)] text-[var(--color-textHero)] bg-white/5 hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-all min-h-[48px] flex items-center justify-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            >
              {t('cta_secondary')}
            </a>
            <a
              href={`/${locale}/register`} 
              className="px-8 py-4 rounded-full bg-[var(--color-background)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] border-2 border-transparent transition-all transform hover:translate-y-[-2px] shadow-[0_15px_40px_rgba(0,0,0,0.25)] min-h-[56px] flex items-center justify-center text-center font-semibold"
            >
              {t('cta_primary')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

