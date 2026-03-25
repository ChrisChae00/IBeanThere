import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Logo } from '@/shared/ui';

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const commonT = await getTranslations({ locale, namespace: 'common' });
  
  return (
    <footer className="bg-[var(--color-primary)] text-[var(--color-primaryText)] py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-1 mb-4">
            <Logo size="md" className="text-[var(--color-primaryText)]" />
            <span className="text-2xl font-bold text-[var(--color-primaryText)]">
              {commonT('app_name')}
            </span>
          </div>



          {/* Links */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-y-2 sm:gap-x-8 text-[var(--color-primaryText)]/70 mb-4">
            <Link href={`/${locale}/privacy`} className="hover:text-[var(--color-primaryText)] transition-colors">
              {t('privacy_policy')}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-[var(--color-primaryText)] transition-colors">
              {t('terms_of_service')}
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-[var(--color-primaryText)] transition-colors">
              {t('contact_us')}
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-[var(--color-primaryText)]/60 text-sm">
            © 2026 {commonT('app_name')}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

