import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAllCategories, getDrinksByCategory } from '@/data/coffee';
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

  const categories = getAllCategories();
  const drinksByCategory = Object.fromEntries(
    categories.map(cat => [cat.id, getDrinksByCategory(cat.id)])
  );

  const messages = {
    title: t('title'),
    subtitle: t('subtitle'),
  };

  return (
    <main>
      <CoffeeRoadmap
        categories={categories}
        drinksByCategory={drinksByCategory}
        locale={locale}
        messages={messages}
      />
    </main>
  );
}
