'use client';

import { useTranslations } from 'next-intl';

export default function ShopHero() {
  const t = useTranslations('shop');
  const subtitleLine1 = t('hero_subtitle_line1');
  const subtitleLine2 = t('hero_subtitle_line2');

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[var(--color-surface)]">
      {/* Background Pattern - Abstract Map/Coffee Beans */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 0 C 20 10 40 10 60 0 L 100 0 L 100 100 L 0 100 Z" fill="currentColor" />
        </svg>
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <span className="inline-block py-1 px-3 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-semibold mb-6 tracking-wider uppercase">
          {t('hero_badge')}
        </span>
        <h1 className="text-5xl md:text-7xl font-bold text-[var(--color-text)] mb-6 leading-tight">
          {t('hero_title')}
        </h1>
        <p className="text-xl md:text-2xl text-[var(--color-textSecondary)] mb-10 max-w-2xl mx-auto">
          <span className="block">{subtitleLine1}</span>
          {subtitleLine2 && <span className="block">{subtitleLine2}</span>}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#essentials" 
            className="px-8 py-4 bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-full font-semibold hover:bg-[var(--color-secondary)] transition-all shadow-[var(--ibean-shadow-warm)] hover:shadow-[var(--ibean-shadow-warm-lg)] w-full sm:w-auto"
          >
            {t('explore_collection')}
          </a>
        </div>
      </div>
    </div>
  );
}
