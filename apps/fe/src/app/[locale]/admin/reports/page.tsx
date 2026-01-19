import { getTranslations } from 'next-intl/server';
import { ReportsList } from '@/features/admin';

interface ReportsPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: ReportsPageProps) {
  const t = await getTranslations({ locale, namespace: 'admin.reports' });
  return {
    title: t('page_title'),
  };
}

export default async function ReportsPage({ params: { locale } }: ReportsPageProps) {
  const t = await getTranslations({ locale, namespace: 'admin.reports' });

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          {t('page_title')}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          {t('page_description')}
        </p>
      </div>

      <ReportsList />
    </div>
  );
}
