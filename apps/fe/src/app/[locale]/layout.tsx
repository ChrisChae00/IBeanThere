import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Header } from '@/components/layout';
import { Footer } from '@/components/landing';
import { AuthWatcher } from '@/components/auth';
import { ClientProviders } from '@/components/providers';
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { getSiteUrl, buildAlternateLanguages, type Locale } from '@/lib/seo';
import { defaultThemeName, themeNames } from '@/lib/themes/palettes';

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t&&${JSON.stringify(
  themeNames
)}.indexOf(t)>-1){document.documentElement.dataset.theme=t}}catch(e){}})()`;

// Draws under the iOS status bar and home indicator; the insets are handled in CSS.
export const viewport: Viewport = { viewportFit: 'cover' };

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
      icon: [
        { url: '/icons/favicon.svg', type: 'image/svg+xml' },
        { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      ],
      // iOS ignores SVG icons; without a PNG, Add to Home Screen shows a letter tile.
      apple: '/icons/apple-touch-icon.png',
    },
    appleWebApp: {
      title: 'ibeanthere',
    },
    alternates: {
      languages: buildAlternateLanguages('/'),
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'ibeanthere',
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
                <div aria-hidden className="status-tint" />
                <Header locale={locale} />
                <main className="pt-(--nav-h) px-safe flex-1 bg-background">
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