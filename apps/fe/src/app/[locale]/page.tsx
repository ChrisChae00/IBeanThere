import type { Metadata } from 'next';
import Script from 'next/script';
import { getTranslations } from 'next-intl/server';
import { Hero, CTA, BeanDropTimeline, UserPersonas, CafeRegister } from '@/components/landing';
import { buildAlternateLanguages, buildCanonical, buildOrganizationSchema, buildWebsiteSchema, type Locale } from '@/lib/seo';

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

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const jsonLd = [buildOrganizationSchema(), buildWebsiteSchema()];

  return (
    <>
      <Script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero locale={locale} />
<BeanDropTimeline locale={locale} />
      <CafeRegister locale={locale} />
      <UserPersonas locale={locale} />
      <CTA locale={locale} />
    </>
  );
}
