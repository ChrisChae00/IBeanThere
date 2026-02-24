import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getTrendingCafes } from '@/lib/api/cafes';
import ExploreMapClient from './ExploreMapClient';
import { PlusIcon } from '@/components/ui';

export default async function ExploreMapPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'discover.explore_map' });

  const initialCafes = await getTrendingCafes(12, 0);

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Page Title Section — rendered on server, no JS needed */}
      <section className="pt-6 pb-4 bg-gradient-to-b from-[var(--color-background)] to-[var(--color-surface)]/30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
                {t('title')}
              </h1>
              <p className="text-xl text-[var(--color-text-secondary)]">
                {t('subtitle')}
              </p>
            </div>
            <Link
              href={`/${locale}/discover/register-cafe`}
              className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 rounded-full font-semibold hover:bg-[var(--color-secondary)] transition-colors shadow-lg min-h-[44px] flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="text-xl font-bold" />
              {t('be_navigator')}
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive sections — map, filters, cafe grid */}
      <ExploreMapClient locale={locale} initialCafes={initialCafes} />
    </main>
  );
}
