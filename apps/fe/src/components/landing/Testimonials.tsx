import { getTranslations } from 'next-intl/server';

type TestimonialsProps = {
  locale: string;
};

export default async function Testimonials({ locale }: TestimonialsProps) {
  const t = await getTranslations({ locale, namespace: 'landing.testimonials' });

  const highlights = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      title: t('highlight_navigator_title'),
      description: t('highlight_navigator_desc'),
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <ellipse cx="12" cy="14" rx="4" ry="5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 9V6" strokeWidth={2} strokeLinecap="round" />
          <path d="M10 7.5L12 6L14 7.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: t('highlight_beans_title'),
      description: t('highlight_beans_desc'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V13M12 13C12 10 14 8 14 5C14 3 12 2 12 2C12 2 10 3 10 5C10 8 12 10 12 13Z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13C12 10 10 8 8 6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13C12 10 14 8 16 6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 19H16" />
        </svg>
      ),
      title: t('highlight_forest_title'),
      description: t('highlight_forest_desc'),
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[var(--color-background)]">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3 sm:mb-4">
            {t('title')}
          </h2>
          <p className="text-base sm:text-lg text-[var(--color-textSecondary)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="bg-[var(--color-surface)] rounded-2xl p-6 sm:p-8 border border-[var(--color-border)] text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primaryText)] mx-auto mb-4 sm:mb-6">
                {highlight.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-2 sm:mb-3">
                {highlight.title}
              </h3>
              <p className="text-sm sm:text-base text-[var(--color-textSecondary)] leading-relaxed">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
