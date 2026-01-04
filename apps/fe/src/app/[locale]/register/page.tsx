import { getTranslations } from 'next-intl/server';
import { SignupForm, AuthLayout } from '@/components/auth';
import { CheckIcon } from '@/components/ui';

export default async function SignupPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  const features = [
    {
      icon: <CheckIcon size={16} className="text-[var(--color-background)]" />,
      text: t('discover_cafes')
    },
    {
      icon: <CheckIcon size={16} className="text-[var(--color-background)]" />,
      text: t('record_experiences')
    },
    {
      icon: <CheckIcon size={16} className="text-[var(--color-background)]" />,
      text: t('connect_lovers')
    }
  ];

  return (
    <AuthLayout
      title={t('start_journey')}
      subtitle={t('start_journey_subtitle')}
      features={features}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3">
          {t('create_account')}
        </h2>
        <p className="text-lg text-[var(--color-accent)]">
          {t('create_account_subtitle')}
        </p>
      </div>

      <SignupForm locale={locale} />
    </AuthLayout>
  );
}