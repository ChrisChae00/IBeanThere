import { getTranslations } from 'next-intl/server';

type FeaturesProps = {
  locale: string;
};

export default async function Features({ locale }: FeaturesProps) {
  const t = await getTranslations({ locale, namespace: 'landing.features' });

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: t('discover.title'),
      description: t('discover.description'),
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      title: t('record.title'),
      description: t('record.description'),
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t('share.title'),
      description: t('share.description'),
    },
  ];

  return (
    <section className="py-20 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-[var(--color-textSecondary)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--color-cardBackground)] rounded-2xl p-8 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="text-[var(--color-cardText)] mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-[var(--color-cardText)] mb-3">
                {feature.title}
              </h3>
              <p className="text-[var(--color-cardText)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

