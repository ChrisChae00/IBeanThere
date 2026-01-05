import { getTranslations } from 'next-intl/server';
import { ResetPasswordForm, AuthLayout } from '@/components/auth';
import { LockIcon, CheckCircleIcon, CoffeeIcon } from '@/components/ui';

export default async function ResetPasswordPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  const features = [
    {
      icon: <LockIcon size={18} className="text-[var(--color-background)]" />,
      text: t('secure_password_reset')
    },
    {
      icon: <CheckCircleIcon size={18} className="text-[var(--color-background)]" />,
      text: t('feature_security')
    },
    {
      icon: <CoffeeIcon size={18} className="text-[var(--color-background)]" />,
      text: t('back_to_coffee')
    }
  ];

  return (
    <AuthLayout
      title={t('reset_password_title')}
      subtitle={t('reset_password_subtitle')}
      features={features}
    >
      <ResetPasswordForm locale={locale} />
    </AuthLayout>
  );
}
