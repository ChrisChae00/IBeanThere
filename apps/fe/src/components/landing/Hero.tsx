import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export default async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'landing.hero' });
  
  return (
    <section className="relative h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/feaff7e31e-efe3dfb652fe6299f91c.png"
          alt="warm cozy coffee shop interior"
          fill
          className="object-cover"
          priority
        />
        {/* Black overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Theme color gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/90 via-[var(--color-primary)]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-lg lg:max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-textHero)] leading-tight mb-6 drop-shadow-lg break-keep">
            {t('title')}
          </h1>
          <p className="text-xl sm:text-2xl text-[var(--color-textHero)] mb-8 leading-relaxed drop-shadow break-keep">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
          <button className="border-2 border-[var(--color-textHero)] bg-black/30 text-[var(--color-textHero)] px-6 py-3 rounded-full text-base font-semibold hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-all min-h-[48px]">
              {t('cta_secondary')}
          </button>
          <button className="border-2 border-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-all transform hover:scale-105 shadow-lg min-h-[56px]">
              {t('cta_primary')}
          </button>
          </div>
        </div>
      </div>
    </section>
  );
}

