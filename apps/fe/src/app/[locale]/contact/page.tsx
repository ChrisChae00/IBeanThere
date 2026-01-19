import { getTranslations } from 'next-intl/server';
import { Card, ArrowLeftIcon } from '@/shared/ui';
import Link from 'next/link';

export default async function ContactPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.contact' });

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[60vh]">
      <Link 
        href={`/${locale}`}
        className="inline-flex items-center text-sm mb-6 text-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-6 text-[var(--color-text)]">{t('title')}</h1>
      
      <Card className="p-8">
        <p className="whitespace-pre-wrap text-[var(--color-text)] text-lg mb-4">
          {t('content')}
        </p>
        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <h3 className="font-semibold mb-2 text-[var(--color-text)]">Email</h3>
            <a href="mailto:ibeanthere.app@gmail.com" className="text-[var(--color-primary)] hover:underline text-lg">
              ibeanthere.app@gmail.com
            </a>
        </div>
      </Card>
    </div>
  );
}
