import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CommunityClient from './CommunityClient';
import { buildAlternateLanguages, buildCanonical, type Locale } from '@/lib/seo';

const PATH = '/community';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'navigation' });

  return {
    title: t('community'),
    alternates: {
      canonical: buildCanonical(locale as Locale, PATH),
      languages: buildAlternateLanguages(PATH),
    },
  };
}

export default function CommunityPage() {
  return <CommunityClient />;
}
