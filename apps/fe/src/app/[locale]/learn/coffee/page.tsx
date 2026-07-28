import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAllCategories, getDrinksByCategory } from '@/data/coffee';
import type { Locale } from '@/data/coffee/types';
import CoffeeRoadmap from '@/components/learn/CoffeeRoadmap';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'learn.coffee' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function CoffeeRoadmapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'learn.coffee' });

  const loc = locale as Locale;
  const categories = getAllCategories();
  const drinksByCategory = Object.fromEntries(
    categories.map(cat => [cat.id, getDrinksByCategory(cat.id)])
  );

  const branchLabels = Object.fromEntries(
    categories.flatMap(cat => {
      const parent = categories.find(c => c.id === cat.branchFrom);
      return parent
        ? [[cat.id, t('branchFrom', { name: parent.content[loc].name })]]
        : [];
    })
  );

  const messages = {
    title: t('title'),
    subtitle: t('subtitle'),
    eyebrow: t('eyebrow'),
    stageCount: t('stageCount', { count: categories.length }),
    drinkCount: t('drinkCount', {
      count: Object.values(drinksByCategory).reduce((n, d) => n + d.length, 0),
    }),
  };

  return (
    <CoffeeRoadmap
      categories={categories}
      drinksByCategory={drinksByCategory}
      branchLabels={branchLabels}
      locale={locale}
      messages={messages}
    />
  );
}
