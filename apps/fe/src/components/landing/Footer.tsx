import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Logo } from '@/shared/ui';
import { FooterHomescreenLink, FooterShareButton } from './FooterClient';
import FooterContactButton from './FooterContactButton';

/*
  Two bands split by a hairline: identity and destinations on top, the small print
  underneath. The previous three-column grid gave the links a column of their own and
  then centred them inside it, so on a wide screen they floated between two anchored
  edges with nothing holding them; and it put the legal line and the app-shortcut link
  at the same weight as the navigation.

  Every colour here is a semantic token. The footer sits under the map and the profile
  as well as the landing, so it stays the quiet brand band it was - the layout changed,
  the volume did not.
*/
export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const commonT = await getTranslations({ locale, namespace: 'common' });

  const linkClass =
    'text-ink-on-brand/70 hover:text-ink-on-brand transition-colors whitespace-nowrap';

  return (
    <footer className="bg-brand text-ink-on-brand">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Logo size="md" className="text-ink-on-brand" />
            <span className="font-logo text-2xl font-bold">{commonT('app_name')}</span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <Link
              href={`/${locale}/privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {t('privacy_policy')}
            </Link>
            <Link
              href={`/${locale}/terms`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {t('terms_of_service')}
            </Link>
            <FooterContactButton label={t('contact_us')} />
            <FooterShareButton />
          </nav>
        </div>

        <div className="mt-8 border-t border-ink-on-brand/15 pt-5">
          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            {/*
              One line rather than two stacked paragraphs: the copyright and the data
              credit are the same kind of statement and were reading as a stack of
              increasingly faint asides.
            */}
            <p className="text-ink-on-brand/55">
              © 2026 {commonT('app_name')}. All rights reserved.
              <span aria-hidden className="mx-2">
                ·
              </span>
              {t('osm_attribution')}
            </p>
            <FooterHomescreenLink />
          </div>
        </div>
      </div>
    </footer>
  );
}
