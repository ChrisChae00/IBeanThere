import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function TermsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.terms' });
  const tLegal = await getTranslations({ locale, namespace: 'legal' });

  const sections = [
    'intro',
    'account',
    'content',
    'conduct',
    'location',
    'termination',
    'liability',
    'governing_law',
    'contact'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link 
        href={`/${locale}`}
        className="inline-flex items-center text-sm mb-6 text-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors"
      >
        {/* We can use ArrowLeftIcon if imported, or just text if icon not available in this file yet */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        
        {/* Helper for non-English users */}
        <div className="bg-[var(--color-background)] p-4 rounded border border-[var(--color-border)] mb-8 text-sm text-[var(--color-text-secondary)]">
          <p>{tLegal('disclaimer_translation')}</p>
          <p className="mt-2 text-xs opacity-70">
            {tLegal('last_updated', { date: '2026-01-19' })}
          </p>
        </div>

        <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-sm border border-[var(--color-border)] space-y-8">
          {sections.map((section) => (
            <div key={section}>
              <h2 className="text-xl font-semibold mb-3">{t(`${section}.title`)}</h2>
              <p className="whitespace-pre-wrap">{t(`${section}.content`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
