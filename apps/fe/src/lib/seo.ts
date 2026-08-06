export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];

export function getSiteUrl(): URL {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }

  return new URL('http://localhost:3000');
}

/** Builds hreflang alternates for a path shared across all locales, e.g. "/cafes/my-cafe". */
export function buildAlternateLanguages(path: string): Record<string, string> {
  const siteUrl = getSiteUrl();
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = new URL(`/${locale}${path}`, siteUrl).toString();
  }
  languages['x-default'] = new URL(`/${locales[0]}${path}`, siteUrl).toString();

  return languages;
}

export function buildCanonical(locale: Locale, path: string): string {
  return new URL(`/${locale}${path}`, getSiteUrl()).toString();
}

export function buildOrganizationSchema() {
  const siteUrl = getSiteUrl().toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IBeanThere',
    url: siteUrl,
    logo: new URL('/icons/coffee-logo.svg', siteUrl).toString(),
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'IBeanThere',
    url: getSiteUrl().toString(),
  };
}
