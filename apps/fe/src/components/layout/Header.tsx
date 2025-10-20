import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import MobileMenu from './MobileMenu';
import ThemeSwitcher from './ThemeSwitcher';

export default async function Header({
  locale
}: {
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: 'navigation' });
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <span className="text-2xl">☕️</span>
            <span className="text-xl font-bold text-[var(--color-primary)]">
              IBeanThere
            </span>
          </Link>

          {/* Desktop Navigation - Left Side */}
          <nav className="hidden lg:flex items-center space-x-8 ml-12">
            <Link 
              href={`/${locale}/hot-beans`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
            >
              {t('hot_beans')}
            </Link>
            <Link 
              href={`/${locale}/new-spot`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
            >
              {t('new_spot')}
            </Link>
            <Link 
              href={`/${locale}/my-coffee-logs`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
            >
              {t('my_coffee_logs')}
            </Link>
            <Link 
              href={`/${locale}/shop`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
            >
              {t('shop')}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <MobileMenu locale={locale} />

          {/* Desktop Navigation - Right Side */}
          <div className="hidden lg:flex items-center space-x-4 ml-auto">
            <ThemeSwitcher />
            <Link 
              href={`/${locale}/signin`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
            >
              {t('sign_in')}
            </Link>
            <button className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-full hover:bg-[var(--color-secondary)] transition-colors font-medium min-h-[44px]">
              {t('get_started')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

