import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import ProfileClient from '@/components/profile/ProfileClient';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile' });

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/signin`);
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      {/* The masthead and its rule, the same opening every other page uses. */}
      <section className="pb-8">
        <h1 className="landing-display text-[clamp(2rem,5vw,3rem)] text-ink-primary">
          {t('title')}
        </h1>
        <div className="mt-6 border-t border-edge-rule" />
      </section>
      <ProfileClient />
    </main>
  );
}
