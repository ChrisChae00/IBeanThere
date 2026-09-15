import { getTranslations } from 'next-intl/server';
import { LoginForm, AuthLayout, AuthHeading } from '@/components/auth';

export default async function SigninPage({
  params, searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ collection?: string }>;
}) {
  const { locale } = await params;
  const { collection } = await searchParams;
  const collectionToken = typeof collection === 'string' && /^[A-Za-z0-9_-]{32}$/.test(collection) ? collection : undefined;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <AuthLayout title={t('welcome_back')} subtitle={t('welcome_back_subtitle')}>
      <AuthHeading title={t('sign_in')} subtitle={t('sign_in_subtitle')} />

      <LoginForm locale={locale} collectionToken={collectionToken} />
    </AuthLayout>
  );
}
