import { getTranslations } from 'next-intl/server';
import { LoginForm, AuthLayout } from '@/components/auth';
import { LocationIcon, CameraIcon, UsersIcon } from '@/components/ui';

export default async function SigninPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  const features = [
    {
      icon: <LocationIcon size={18} className="text-[var(--color-background)]" />,
      text: t('discover_cafes')
    },
    {
      icon: <CameraIcon size={18} className="text-[var(--color-background)]" />,
      text: t('record_moments')
    },
    {
      icon: <UsersIcon size={18} className="text-[var(--color-background)]" />,
      text: t('share_stories')
    }
  ];

  return (
    <AuthLayout
      title={t('welcome_back')}
      subtitle={t('welcome_back_subtitle')}
      features={features}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3">
          {t('sign_in')}
        </h2>
        <p className="text-lg text-[var(--color-textSecondary)]">
          {t('sign_in_subtitle')}
        </p>
      </div>

      <LoginForm locale={locale} />
    </AuthLayout>
  );
}
