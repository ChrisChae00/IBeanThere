import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('legal.terms');
  const tLegal = useTranslations('legal');

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
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        
        {/* Helper for non-English users */}
        <div className="bg-[var(--color-background)] p-4 rounded border border-[var(--color-border)] mb-8 text-sm text-[var(--color-text-secondary)]">
          <p>{tLegal('disclaimer_translation')}</p>
          <p className="mt-2 text-xs opacity-70">
            {tLegal('last_updated', { date: new Date().toLocaleDateString() })}
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
