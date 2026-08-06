import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAllDrinks, getDrinkBySlug, getCategory, getDrinksByCategory } from '@/data/coffee';
import type { Locale } from '@/data/coffee/types';
import CoffeeDrinkDetail from '@/components/learn/CoffeeDrinkDetail';
import { buildAlternateLanguages, buildCanonical, type Locale as SeoLocale } from '@/lib/seo';

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
  const path = `/learn/coffee/${slug}`;

  return {
    title: content.name,
    description: content.tagline,
    alternates: {
      canonical: buildCanonical(locale as SeoLocale, path),
      languages: buildAlternateLanguages(path),
    },
    openGraph: {
      title: content.name,
      description: content.tagline,
      type: 'article',
    },
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

  // drinkSlugs order is authoritative, so siblings double as reading order.
  const allCategoryDrinks = getDrinksByCategory(drink.categoryId);
  const relatedDrinks = allCategoryDrinks.filter(d => d.slug !== drink.slug);
  const position = allCategoryDrinks.findIndex(d => d.slug === drink.slug);
  const prev = position > 0 ? allCategoryDrinks[position - 1] : undefined;
  const next = position >= 0 ? allCategoryDrinks[position + 1] : undefined;

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
    prevDrink: t('prevDrink'),
    nextDrink: t('nextDrink'),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <CoffeeDrinkDetail
        drink={drink}
        category={category}
        relatedDrinks={relatedDrinks}
        prev={prev}
        next={next}
        locale={locale}
        messages={messages}
      />
    </>
  );
}
