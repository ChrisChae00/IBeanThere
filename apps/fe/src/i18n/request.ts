import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = (locale || 'en') as Locale;
  
  let messages;
  if (currentLocale === 'ko') {
    messages = (await import('./messages/ko.json')).default;
  } else {
    messages = (await import('./messages/en.json')).default;
  }
  
  return {
    locale: currentLocale,
    messages
  };
});