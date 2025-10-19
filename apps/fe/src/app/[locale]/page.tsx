import { getTranslations } from 'next-intl/server';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  
  return (
    <main style={{ padding: 24 }}>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </main>
  );
}
