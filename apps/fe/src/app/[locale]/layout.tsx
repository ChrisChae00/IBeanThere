import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Header } from '@/components/layout';
import { Footer } from '@/components/landing';
import { AuthWatcher } from '@/components/auth';
import { ClientProviders } from '@/components/providers';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { getSiteUrl, buildAlternateLanguages, type Locale } from '@/lib/seo';
import { defaultThemeName, themeNames } from '@/lib/themes/palettes';

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t&&${JSON.stringify(
  themeNames
)}.indexOf(t)>-1){document.documentElement.dataset.theme=t}}catch(e){}})()`;

// Dynamic metadata generation with i18n support
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    metadataBase: getSiteUrl(),
    title: t('title'),
    description: t('description'),
    icons: {
      icon: '/icons/coffee-logo.svg',
    },
    alternates: {
      languages: buildAlternateLanguages('/'),
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'IBeanThere',
      locale: locale as Locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function LocaleLayout({ 
  children, 
  params 
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  
  return (
    <html lang={locale} className="h-full" data-theme={defaultThemeName} suppressHydrationWarning>
      <head>
        <script
          // Applies the saved theme before the first paint. Without it the page paints
          // in the default theme and then swaps, which reads as a flash on every load.
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ClientProviders>
                <AuthWatcher />
                <Header locale={locale} />
                <main className="pt-16 flex-1">
                  {children}
                </main>
                <Footer locale={locale} />
              </ClientProviders>
            </NextIntlClientProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}