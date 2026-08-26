'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { locales } from '@/i18n/request';
import NavSelect from './NavSelect';

/*
  Full names in the panel, the code on the trigger. The globe that used to sit
  beside it is gone: a two-letter code is already the clearest label a language
  control can have, and the icon only widened the box.
*/
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ko: '한국어',
};

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  const currentLocale = pathname.split('/')[1] || 'en';

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    // A full load rather than a router push: the locale decides the messages
    // bundle, which is resolved on the server.
    window.location.href = segments.join('/');
  };

  return (
    <NavSelect
      label={currentLocale.toUpperCase()}
      ariaLabel={t('language')}
      value={currentLocale}
      onChange={handleLanguageChange}
      options={locales.map((locale) => ({
        value: locale,
        label: LANGUAGE_NAMES[locale] || locale.toUpperCase(),
      }))}
    />
  );
}
