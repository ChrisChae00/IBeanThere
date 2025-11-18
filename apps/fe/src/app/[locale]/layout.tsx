import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Header } from '@/components/layout';
import { Footer } from '@/components/landing';
import '@/styles/globals.css';
import type { Metadata } from 'next';

// Dynamic metadata generation with i18n support
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const getMetadataBase = (): URL => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return new URL(process.env.NEXT_PUBLIC_APP_URL);
    }
    
    if (process.env.VERCEL_URL) {
      return new URL(`https://${process.env.VERCEL_URL}`);
    }
    
    return new URL('http://localhost:3000');
  };

  const metadataBase = getMetadataBase();

  return {
    metadataBase,
    title: t('title'),
    description: t('description'),
    icons: {
      icon: '/icons/coffee-logo.svg',
    }
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
    <html lang={locale} className="h-full">
      <body className="h-full flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <Header locale={locale} />
              <main className="pt-16 flex-1">
                {children}
              </main>
              <Footer locale={locale} />
            </NextIntlClientProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}