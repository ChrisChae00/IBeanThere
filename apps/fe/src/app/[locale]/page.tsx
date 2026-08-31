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
            heroLine1: t('hero_line1'),
            heroLine2: t('hero_line2'),
            heroLine3: t('hero_line3'),
            /*
              Rich rather than plain: the product name inside the sentence is
              set in the display face, and a locale decides for itself where in
              the sentence that name falls -- Korean attaches its particle
              straight to it, English does not.
            */
            heroLede: t.rich('hero_lede', {
              name: (chunks) => <span className="font-logo">{chunks}</span>,
            }),
            heroCta: t('hero_cta'),
            heroCtaLoggedIn: t('hero_cta_logged_in'),
            heroCtaSecondary: t('hero_cta_secondary'),
            indexTitle: t('index_title'),
            indexNote: t('index_note'),
            registerTitle: t('register_title'),
            registerLede: t('register_lede'),
            registerCta: t('register_cta'),
            registerNotes: [1, 2, 3].map((n) => ({
              title: t(`register_note_${n}`),
              body: t(`register_note_${n}_body`),
            })),
            personasTitle: t('personas_title'),
            personasNote: t('personas_note'),
            closeLine1: t('close_line1'),
            closeLine2: t('close_line2'),
            closeNote: t('close_note'),
            closeNoteSource: t('close_note_source'),
            closeCta: t('close_cta'),
            closeCtaLoggedIn: t('close_cta_logged_in'),
            marquee: t('marquee'),
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
