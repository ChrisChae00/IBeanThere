import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import CoffeeGuide from '@/components/learn/CoffeeGuide';
import { buildAlternateLanguages, buildCanonical, type Locale } from '@/lib/seo';

export const revalidate = 86400;

const PATH = '/learn/coffee';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'learn.coffee' });

  return {
    title: t('metaTitle'),
    description: t('description'),
    alternates: {
      canonical: buildCanonical(locale as Locale, PATH),
      languages: buildAlternateLanguages(PATH),
    },
    // The layout's card names the site; without this, every shared link would too.
    twitter: {
      card: 'summary',
      title: t('metaTitle'),
      description: t('description'),
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('description'),
      type: 'website',
      locale,
    },
  };
}

export default async function CoffeeGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CoffeeGuide locale={locale} />;
}
