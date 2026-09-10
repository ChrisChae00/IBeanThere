import { getTranslations } from 'next-intl/server';
import { SignupForm, AuthLayout, AuthHeading } from '@/components/auth';

export default async function SignupPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <AuthLayout title={t('start_journey')} subtitle={t('start_journey_subtitle')}>
      <AuthHeading title={t('create_account')} subtitle={t('create_account_subtitle')} />

      <SignupForm locale={locale} />
    </AuthLayout>
  );
}
