import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PublicProfileClient from '@/components/profile/PublicProfileClient';
import { buildAlternateLanguages, buildCanonical, type Locale } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}): Promise<Metadata> {
  const { locale, username } = await params;
  const path = `/profile/${username}`;

  return {
    title: `${username} | ibeanthere`,
    alternates: {
      canonical: buildCanonical(locale as Locale, path),
      languages: buildAlternateLanguages(path),
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  
  // We can pre-fetch data here if needed for SEO, but for now client-side fetching is fine
  // to reuse the PublicProfileClient logic.
  
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <PublicProfileClient username={username} />
    </main>
  );
}
