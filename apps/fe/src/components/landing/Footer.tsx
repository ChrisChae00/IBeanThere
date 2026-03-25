import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Logo } from '@/shared/ui';
import FooterClient from './FooterClient';
import FooterContactButton from './FooterContactButton';

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const commonT = await getTranslations({ locale, namespace: 'common' });

  return (
    <footer className="bg-[var(--color-primary)] text-[var(--color-primaryText)] py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">

          {/* Left: App name + copyright */}
          <div className="text-left">
            <div className="flex items-center space-x-1 mb-2">
              <Logo size="md" className="text-[var(--color-primaryText)]" />
              <span className="text-2xl font-bold text-[var(--color-primaryText)]">
                {commonT('app_name')}
              </span>
            </div>
            <p className="text-[var(--color-primaryText)]/60 text-sm">
              © 2026 {commonT('app_name')}. All rights reserved.
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex flex-row flex-wrap items-center justify-start sm:justify-center gap-x-6 gap-y-2 text-[var(--color-primaryText)]/70">
            <Link href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primaryText)] transition-colors whitespace-nowrap">
              {t('privacy_policy')}
            </Link>
            <Link href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primaryText)] transition-colors whitespace-nowrap">
              {t('terms_of_service')}
            </Link>
            <FooterContactButton label={t('contact_us')} />
          </div>

          {/* Right: Share + homescreen shortcut */}
          <div className="flex justify-start sm:justify-end">
            <FooterClient />
          </div>

        </div>
      </div>
    </footer>
  );
}
