import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm, AuthLayout } from '@/components/auth';
import { LockIcon, MailIcon, CoffeeIcon } from '@/components/ui';

export default async function ForgotPasswordPage({
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
      icon: <MailIcon size={18} className="text-[var(--color-background)]" />,
      text: t('quick_recovery')
    },
    {
      icon: <CoffeeIcon size={18} className="text-[var(--color-background)]" />,
      text: t('back_to_coffee')
    }
  ];

  return (
    <AuthLayout
      title={t('forgot_password_title')}
      subtitle={t('forgot_password_subtitle')}
      features={features}
    >
      <ForgotPasswordForm locale={locale} />
    </AuthLayout>
  );
}
