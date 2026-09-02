import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getTrendingCafes } from '@/lib/api/cafes';
import ExploreMapClient from './ExploreMapClient';
import { buildAlternateLanguages, buildCanonical, type Locale } from '@/lib/seo';
import { CAFE_GRID_ITEMS_PER_PAGE } from '@/lib/constants/cafe';

const PATH = '/discover/explore-map';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'discover.explore_map' });

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: buildCanonical(locale as Locale, PATH),
      languages: buildAlternateLanguages(PATH),
    },
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      type: 'website',
    },
  };
}

export default async function ExploreMapPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'discover.explore_map' });

  const initialCafes = await getTrendingCafes(CAFE_GRID_ITEMS_PER_PAGE, 0);

  return (
    <main className="min-h-screen bg-surface-page">
      {/* Page Title Section — rendered on server, no JS needed */}
      <section className="pt-10 pb-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="landing-display text-[clamp(2.5rem,6vw,4.5rem)] text-ink-primary">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-ink-secondary">{t('subtitle')}</p>
        </div>
        {/* The rule under the masthead, the way the landing sets a section off. */}
        <div className="max-w-8xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-edge-rule" />
        </div>
      </section>

      {/* Interactive sections — map, filters, cafe grid */}
      <ExploreMapClient locale={locale} initialCafes={initialCafes} />
    </main>
  );
}
