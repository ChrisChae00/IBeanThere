import { getTranslations } from 'next-intl/server';
import GrowthJourneyClient from './GrowthJourneyClient';

type GrowthJourneyProps = {
  locale: string;
};

export default async function GrowthJourney({ locale }: GrowthJourneyProps) {
  const t = await getTranslations({ locale, namespace: 'landing.growth_journey' });

  const messages = {
    title: t('title'),
    subtitle: t('subtitle'),
    steps: {
      seed: { title: t('seed.title'), description: t('seed.description') },
      sprout: { title: t('sprout.title'), description: t('sprout.description') },
      tree: { title: t('tree.title'), description: t('tree.description') },
      harvest: { title: t('harvest.title'), description: t('harvest.description') },
    },
  };

  return (
    <section className="py-20 bg-[var(--color-secondary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-textHero)] mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-[var(--color-textHero)] opacity-90">
            {t('subtitle')}
          </p>
        </div>

        <GrowthJourneyClient messages={messages} />
      </div>
    </section>
  );
}
