import { getTranslations } from 'next-intl/server';
import { LoginForm, AuthLayout, AuthHeading } from '@/components/auth';

export default async function SigninPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <AuthLayout title={t('welcome_back')} subtitle={t('welcome_back_subtitle')}>
      <AuthHeading title={t('sign_in')} subtitle={t('sign_in_subtitle')} />

      <LoginForm locale={locale} />
    </AuthLayout>
  );
}
