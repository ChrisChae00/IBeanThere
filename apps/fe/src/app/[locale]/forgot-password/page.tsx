import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm, AuthLayout } from '@/components/auth';

export default async function ForgotPasswordPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <AuthLayout title={t('welcome_back')} subtitle={t('welcome_back_subtitle')}>
      <ForgotPasswordForm locale={locale} />
    </AuthLayout>
  );
}
