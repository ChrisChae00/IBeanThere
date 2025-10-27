import { getTranslations } from 'next-intl/server';
import { StarRating } from '@/components/ui';
import MapSection from '@/components/map/MapSection';

export default async function TrendingCafesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trending_cafes' });
  
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Page Title Section with Gradient */}
      <section className="pt-6 pb-4 bg-gradient-to-b from-[var(--color-background)] to-[var(--color-surface)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="pt-4 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Map */}
            <MapSection 
              locale={locale}
              mapTitle={t('map_title')}
              mapSubtitle={t('map_subtitle')}
            />

            {/* Top Trending Cafes */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col shadow-lg">
              <div className="mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                  {t('top_cafes_title')}
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                  {t('top_cafes_subtitle')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 hover:shadow-inset-primary transition-shadow flex flex-col justify-between">
                    <div className="w-16 h-16 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                      <div className="text-white text-2xl">☕️</div>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-[var(--color-text)] mb-0.5">
                        {t('top_cafe_name', { number: index + 1 })}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                        {t(`operating_hours${index === 0 ? '' : `_${index}`}`)}
                      </p>
                      <div className="flex items-center mb-1">
                        <StarRating 
                          rating={4.5 + (index * 0.1)} 
                          size="sm" 
                          showNumber={false}
                          className="mr-1.5"
                        />
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {(4.5 + (index * 0.1)).toFixed(1)} ({150 + index * 20})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[var(--color-accent)]/10 text-[var(--color-textSecondary)] px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          🔥 {t('trending')}
                        </span>
                        <button className="ml-auto bg-[var(--color-primary)] text-[var(--color-primaryText)] px-3 py-1 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors">
                          {t('visit')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-secondary)] transition-colors min-h-[44px]">
              {t('all')}
            </button>
            <button className="bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-surface)]/80 transition-colors border border-[var(--color-border)] min-h-[44px]">
              {t('nearby')}
            </button>
            <button className="bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-surface)]/80 transition-colors border border-[var(--color-border)] min-h-[44px]">
              {t('highest_rated')}
            </button>
            <button className="bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-surface)]/80 transition-colors border border-[var(--color-border)] min-h-[44px]">
              {t('most_reviewed')}
            </button>
          </div>
        </div>
      </section>

      {/* Cafe Grid Section */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:shadow-inset-primary transition-shadow">
                <div className="h-44 bg-[var(--color-surface)]/50 flex items-center justify-center">
                  <div className="text-4xl text-[var(--color-text-secondary)]">☕️</div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--color-text)] mb-1.5 text-sm">
                    {t('sample_cafe_name', { number: index + 1 })}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                    {t(`operating_hours${index === 0 ? '' : `_${(index % 4)}`}`)}
                  </p>
                  <div className="flex items-center mb-3">
                    <StarRating 
                      rating={4.2 + (index * 0.1)} 
                      size="sm" 
                      showNumber={false}
                      className="mr-2"
                    />
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {(4.2 + (index * 0.1)).toFixed(1)} ({120 + index * 15})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-[var(--color-accent)]/10 text-[var(--color-textSecondary)] px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      🔥 {t('trending')}
                    </span>
                    <button className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-3 py-1 rounded-lg text-xs font-medium hover:bg-[var(--color-secondary)] transition-colors">
                      {t('visit')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Load More Section */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <button className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[var(--color-secondary)] transition-colors shadow-lg min-h-[44px]">
            {t('load_more')}
          </button>
        </div>
      </section>
    </main>
  );
}
