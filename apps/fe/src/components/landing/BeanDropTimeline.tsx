import { getTranslations } from 'next-intl/server';
import BeanDropTimelineClient from './BeanDropTimelineClient';

type BeanDropTimelineProps = {
  locale: string;
};

export default async function BeanDropTimeline({ locale }: BeanDropTimelineProps) {
  const t = await getTranslations({ locale, namespace: 'landing.beandrop_timeline' });

  const messages = {
    title: t('title'),
    subtitle: t('subtitle'),
    seed: {
      title: t('seed.title'),
      badge: t('seed.badge'),
      description: t('seed.description'),
      highlights: [t('seed.h1'), t('seed.h2'), t('seed.h3')],
    },
    sprout: {
      title: t('sprout.title'),
      badge: t('sprout.badge'),
      description: t('sprout.description'),
      highlights: [t('sprout.h1'), t('sprout.h2'), t('sprout.h3')],
    },
    growing: {
      title: t('growing.title'),
      badge: t('growing.badge'),
      description: t('growing.description'),
      highlights: [t('growing.h1'), t('growing.h2'), t('growing.h3')],
    },
    tree: {
      title: t('tree.title'),
      badge: t('tree.badge'),
      description: t('tree.description'),
      highlights: [t('tree.h1'), t('tree.h2'), t('tree.h3')],
    },
    harvest: {
      title: t('harvest.title'),
      badge: t('harvest.badge'),
      description: t('harvest.description'),
      highlights: [t('harvest.h1'), t('harvest.h2'), t('harvest.h3')],
    },
  };

  return (
    <section id="beandrop" className="bg-[var(--color-background)]">
      <BeanDropTimelineClient messages={messages} />
    </section>
  );
}
