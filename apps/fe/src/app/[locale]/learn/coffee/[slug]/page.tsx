import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAllDrinks, getDrinkBySlug, getCategory, getDrinksByCategory } from '@/data/coffee';
import type { Locale } from '@/data/coffee/types';
import CoffeeDrinkDetail from '@/components/learn/CoffeeDrinkDetail';

export const revalidate = 86400;

export function generateStaticParams() {
  return getAllDrinks().map(drink => ({ slug: drink.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const drink = getDrinkBySlug(slug);
  if (!drink) return {};

  const loc = locale as Locale;
  const content = drink.content[loc];

  return {
    title: content.name,
    description: content.tagline,
  };
}

// JSON-LD component for structured data — content is our own static data, not user input
function JsonLd({ data }: { data: Record<string, unknown> }) {
  // eslint-disable-next-line react/no-danger
  return (
    <script
      type="application/ld+json"
      // Content is serialized from our own static TypeScript data files, not user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function CoffeeDrinkPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const drink = getDrinkBySlug(slug);
  if (!drink) notFound();

  const category = getCategory(drink.categoryId);
  if (!category) notFound();

  const t = await getTranslations({ locale, namespace: 'learn.coffee' });

  const allCategoryDrinks = getDrinksByCategory(drink.categoryId);
  const relatedDrinks = allCategoryDrinks.filter(d => d.slug !== drink.slug);

  const loc = locale as Locale;
  const drinkContent = drink.content[loc];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: drinkContent.name,
    description: drinkContent.tagline,
    inLanguage: locale,
  };

  const messages = {
    backToRoadmap: t('backToRoadmap'),
    origin: t('origin'),
    funFact: t('funFact'),
    relatedDrinks: t('relatedDrinks'),
    category: t('category'),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <CoffeeDrinkDetail
        drink={drink}
        category={category}
        relatedDrinks={relatedDrinks}
        locale={locale}
        messages={messages}
      />
    </>
  );
}
