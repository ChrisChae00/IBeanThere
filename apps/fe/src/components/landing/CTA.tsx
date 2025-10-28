import { getTranslations } from 'next-intl/server';

type CTAProps = {
  locale: string;
};

export default async function CTA({ locale }: CTAProps) {
  const t = await getTranslations({ locale, namespace: 'landing.cta' });

  return (
    <section className="py-24 bg-[var(--color-surface)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl font-bold text-[var(--color-text)] mb-6 break-keep">
          {t('title')}
        </h2>
        <p className="text-xl text-[var(--color-textSecondary)] mb-10 break-keep">
          {t('subtitle')}
        </p>

        <a
          href={`/${locale}/register`}
          className="inline-block px-8 py-4 text-lg font-medium rounded-full transition-all hover:scale-105 min-h-[56px] mb-8"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primaryText)',
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          {t('button_primary')}
        </a>

        <p className="text-m text-[var(--color-textSecondary)] italic break-keep max-w-2xl mx-auto">
          {t('disclaimer')}
        </p>
      </div>
    </section>
  );
}

