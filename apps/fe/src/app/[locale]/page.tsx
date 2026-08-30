import type { Metadata } from 'next';
import Script from 'next/script';
import { getTranslations } from 'next-intl/server';
import { Landing, LandingMotionRoot } from '@/components/landing';
import { getCafeStats } from '@/lib/api/stats';
import {
  buildAlternateLanguages,
  buildCanonical,
  buildOrganizationSchema,
  buildWebsiteSchema,
  type Locale,
} from '@/lib/seo';

/*
  The landing page.

  Translations are resolved here, on the server, so the composition below stays
  one client component with a plain props contract instead of five
  `useTranslations` calls scattered through its sections.
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: buildCanonical(locale as Locale, '/'),
      languages: buildAlternateLanguages('/'),
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
  };
}

const STAGE_KEYS = ['seed', 'sprout', 'growing', 'tree', 'harvest'] as const;
const PERSONA_KEYS = ['navigator', 'archivist', 'curator'] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });
  // Null when the API is unreachable; the hero figure then reads zero rather
  // than failing the page.
  const stats = await getCafeStats();

  const jsonLd = [buildOrganizationSchema(), buildWebsiteSchema()];

  return (
    <>
      <Script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingMotionRoot>
        <Landing
          locale={locale}
          stats={stats}
          messages={{
            heroLine1: t('press.hero_line1'),
            heroLine2: t('press.hero_line2'),
            heroLine3: t('press.hero_line3'),
            /*
              Rich rather than plain: the product name inside the sentence is
              set in the display face, and a locale decides for itself where in
              the sentence that name falls -- Korean attaches its particle
              straight to it, English does not.
            */
            heroLede: t.rich('press.hero_lede', {
              name: (chunks) => <span className="font-logo">{chunks}</span>,
            }),
            heroCta: t('press.hero_cta'),
            heroCtaLoggedIn: t('press.hero_cta_logged_in'),
            heroCtaSecondary: t('press.hero_cta_secondary'),
            indexTitle: t('press.index_title'),
            indexNote: t('press.index_note'),
            registerTitle: t('press.register_title'),
            registerLede: t('press.register_lede_short'),
            registerCta: t('press.register_cta'),
            registerNotes: [1, 2, 3].map((n) => ({
              title: t(`press.register_note_${n}`),
              body: t(`press.register_note_${n}_body`),
            })),
            personasTitle: t('press.personas_title'),
            personasNote: t('press.personas_note'),
            closeLine1: t('press.close_line1'),
            closeLine2: t('press.close_line2'),
            closeNote: t('press.close_note'),
            closeCta: t('press.close_cta'),
            closeCtaLoggedIn: t('press.close_cta_logged_in'),
            marquee: t('press.marquee'),
            stats: { cafes: t('stats.cafes') },
            stages: STAGE_KEYS.map((key) => ({
              title: t(`beandrop_timeline.${key}.title`),
              badge: t(`beandrop_timeline.${key}.badge`),
              description: t(`beandrop_timeline.${key}.description`),
              highlights: [
                t(`beandrop_timeline.${key}.h1`),
                t(`beandrop_timeline.${key}.h2`),
                t(`beandrop_timeline.${key}.h3`),
              ],
            })),
            personas: PERSONA_KEYS.map((key) => ({
              title: t(`user_personas.${key}.title`),
              description: t(`user_personas.${key}.description`),
            })),
          }}
        />
      </LandingMotionRoot>
    </>
  );
}
