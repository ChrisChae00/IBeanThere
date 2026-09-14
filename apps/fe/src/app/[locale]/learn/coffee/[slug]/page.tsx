import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAllDrinks, getDrinkBySlug, getCategory } from '@/data/coffee';
import type { CoffeeDrink, Locale } from '@/data/coffee/types';
import { getSource } from '@/data/coffee/sources';
import CoffeeDrinkDetail from '@/components/learn/CoffeeDrinkDetail';
import {
  buildAlternateLanguages,
  buildCanonical,
  buildOrganizationSchema,
  type Locale as SeoLocale,
} from '@/lib/seo';

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

  const copy = drink.content[locale as Locale];
  const path = `/learn/coffee/${slug}`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: buildCanonical(locale as SeoLocale, path),
      languages: buildAlternateLanguages(path),
    },
    // The layout's card names the site; without this, every shared link would too.
    twitter: {
      card: 'summary',
      title: copy.title,
      description: copy.description,
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: 'article',
      locale,
      modifiedTime: drink.reviewed,
    },
  };
}

/*
  Only what the page shows. `citation` is the sources printed beside the paragraphs,
  `dateModified` the day they were checked (not the day of the build), and the author is
  the site itself because no person is named on the page.
*/
function buildStructuredData(drink: CoffeeDrink, locale: string, guideName: string) {
  const copy = drink.content[locale as Locale];
  const url = buildCanonical(locale as SeoLocale, `/learn/coffee/${drink.slug}`);
  const { '@context': _context, ...organization } = buildOrganizationSchema();
  const cited = new Set([
    ...(copy.summarySources ?? []),
    ...copy.sections.flatMap(section => section.body.flatMap(p => p.sources ?? [])),
  ]);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: copy.name,
        description: copy.description,
        inLanguage: locale,
        url,
        mainEntityOfPage: url,
        dateModified: drink.reviewed,
        author: organization,
        publisher: organization,
        citation: [...cited].map(id => getSource(id).url),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: guideName,
            item: buildCanonical(locale as SeoLocale, '/learn/coffee'),
          },
          { '@type': 'ListItem', position: 2, name: copy.name, item: url },
        ],
      },
    ],
  };
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

  const related = drink.related
    .map(getDrinkBySlug)
    .filter((d): d is CoffeeDrink => d !== undefined);

  const t = await getTranslations({ locale, namespace: 'learn.coffee' });
  const structuredData = buildStructuredData(drink, locale, t('breadcrumbRoot'));

  return (
    <>
      <script
        type="application/ld+json"
        // Our own static data, but escaped anyway: `</script>` in any string would close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <CoffeeDrinkDetail drink={drink} category={category} related={related} locale={locale} />
    </>
  );
}
