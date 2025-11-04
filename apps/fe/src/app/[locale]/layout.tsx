import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Header } from '@/components/layout';
import { Footer } from '@/components/landing';
import '@/styles/globals.css';

export default async function LocaleLayout({ 
  children, 
  params 
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  
  console.log('Current locale:', locale);
  console.log('Messages loaded:', Object.keys(messages));
  
  return (
    <html lang={locale}>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <Header locale={locale} />
              <main className="pt-16">
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