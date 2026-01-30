import { getTranslations } from 'next-intl/server';
import CTAClient from './CTAClient';

type CTAProps = {
  locale: string;
};

export default async function CTA({ locale }: CTAProps) {
  const t = await getTranslations({ locale, namespace: 'landing.cta' });

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-[var(--color-surface)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4 sm:mb-6 break-keep">
          {t('title')}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-[var(--color-textSecondary)] mb-8 sm:mb-10 break-keep max-w-2xl mx-auto">
          {t('subtitle')}
        </p>

        <CTAClient locale={locale} />

        <p className="text-sm sm:text-base text-[var(--color-textSecondary)] italic break-keep max-w-2xl mx-auto">
          {t('disclaimer')}
        </p>
      </div>
    </section>
  );
}

