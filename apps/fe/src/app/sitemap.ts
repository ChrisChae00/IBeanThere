import type { MetadataRoute } from 'next';
import { getSiteUrl, locales } from '@/lib/seo';
import { getAllDrinks } from '@/data/coffee';
import { getTrendingCafes } from '@/lib/api/cafes';

const STATIC_PATHS = [
  '',
  '/discover/explore-map',
  '/learn/coffee',
  '/shop',
  '/community',
];

function urlFor(locale: string, path: string): string {
  return new URL(`/${locale}${path}`, getSiteUrl()).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of locales) {
      entries.push({ url: urlFor(locale, path), changeFrequency: 'weekly', priority: path === '' ? 1 : 0.7 });
    }
  }

  for (const drink of getAllDrinks()) {
    for (const locale of locales) {
      entries.push({ url: urlFor(locale, `/learn/coffee/${drink.slug}`), changeFrequency: 'monthly', priority: 0.6 });
    }
  }

  // ponytail: no "list all cafes" API exists yet, so the sitemap only covers
  // the top trending cafes. Swap for a dedicated paginated cafes endpoint
  // once one exists so every verified cafe gets indexed.
  const trendingCafes = await getTrendingCafes(100, 0);
  for (const cafe of trendingCafes) {
    const slug = cafe.slug || cafe.id;
    for (const locale of locales) {
      entries.push({ url: urlFor(locale, `/cafes/${slug}`), changeFrequency: 'weekly', priority: 0.5 });
    }
  }

  return entries;
}
