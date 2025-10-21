import { getTranslations } from 'next-intl/server';

type TestimonialsProps = {
  locale: string;
};

export default async function Testimonials({ locale }: TestimonialsProps) {
  const t = await getTranslations({ locale, namespace: 'landing.testimonials' });

  const testimonials = [
    {
      name: 'Sarah Kim',
      role: 'Coffee Enthusiast',
      content: 'IBeanThere has completely transformed how I explore and remember cafes. The journaling feature helps me keep track of every coffee experience!',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'Michael Park',
      role: 'Barista',
      content: 'As a barista, I love discovering new cafes and documenting different brewing methods. This app makes it so easy to share my findings with others.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'Emma Lee',
      role: 'Travel Blogger',
      content: 'Perfect for my coffee adventures around the world. The photo features and notes help me create amazing content for my blog.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-[var(--color-textSecondary)]">
            {t('subtitle')}
          </p>
        </div>

        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-6 min-w-max">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)] w-96 flex-shrink-0"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primaryText)] mr-4">
                    {testimonial.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-text)]">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-[var(--color-textSecondary)]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-[var(--color-text)] leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

