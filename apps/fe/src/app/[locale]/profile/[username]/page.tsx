import { getTranslations } from 'next-intl/server';
import PublicProfileClient from '@/components/profile/PublicProfileClient';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  
  // We can pre-fetch data here if needed for SEO, but for now client-side fetching is fine
  // to reuse the PublicProfileClient logic.
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PublicProfileClient username={username} />
    </div>
  );
}
