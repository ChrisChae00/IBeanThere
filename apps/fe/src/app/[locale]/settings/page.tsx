import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import SettingsClient from '@/components/settings/SettingsClient';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'settings' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/signin`);
  }

  const identities = user.identities ?? [];
  const hasPassword = identities.some(identity => identity.provider === 'email');
  // Whatever this account signs in with besides (or instead of) a password -- Google, so
  // far. Named so the settings page can say which one rather than "a linked provider".
  const linkedProvider = identities.find(identity => identity.provider !== 'email')?.provider ?? null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-10 border-b border-edge-rule pb-8">
        <h1 className="landing-display text-[clamp(2rem,5vw,3rem)] text-ink-primary">
          {t('title')}
        </h1>
      </div>
      <SettingsClient email={user.email ?? ''} hasPassword={hasPassword} linkedProvider={linkedProvider} />
    </div>
  );
}

