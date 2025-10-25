'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import MobileMenu from './MobileMenu';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '@/hooks/useAuth';

export default function Header({
  locale
}: {
  locale: string;
}) {
  const t = useTranslations('navigation');
  const { user, isLoading } = useAuth();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-1">
            <Logo size="md" className="text-[var(--color-primary)]" />
            <span className="text-xl font-bold text-[var(--color-text)]">
              IBeanThere
            </span>
          </Link>

          {/* Desktop Navigation - Left Side */}
          <nav className="hidden lg:flex items-center space-x-3 ml-12">
            <Link 
              href={`/${locale}/hot-beans`}
              className="text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors"
            >
              {t('hot_beans')}
            </Link>
            <div className="h-6 w-px bg-[var(--color-border)]" />
            <Link 
              href={`/${locale}/new-spot`}
              className="text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors"
            >
              {t('new_spot')}
            </Link>
            <div className="h-6 w-px bg-[var(--color-border)]" />
            <Link 
              href={`/${locale}/my-coffee-logs`}
              className="text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors"
            >
              {t('my_coffee_logs')}
            </Link>
            <div className="h-6 w-px bg-[var(--color-border)]" />
            <Link 
              href={`/${locale}/shop`}
              className="text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors"
            >
              {t('shop')}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <MobileMenu locale={locale} />

          {/* Desktop Navigation - Right Side */}
          <div className="hidden lg:flex items-center space-x-2 ml-auto">
            <ThemeSwitcher />
            <LanguageSwitcher />
            
            {/* Conditional rendering based on authentication status */}
            {isLoading ? (
              <div className="w-8 h-8 bg-[var(--color-surface)] rounded-full animate-pulse"></div>
            ) : user ? (
              <ProfileDropdown locale={locale} />
            ) : (
              <>
                <Link 
                  href={`/${locale}/signin`}
                  className="border-2 border-[var(--color-text)] text-[var(--color-text)] px-4 py-1.5 rounded-full hover:bg-[var(--color-secondary)] hover:border-[var(--color-secondary)] hover:text-[var(--color-textHero)] font-medium transition-colors min-h-[44px] flex items-center"
                >
                  {t('sign_in')}
                </Link>
                <div className="h-6 w-px bg-[var(--color-border)]" />
                <Link 
                  href={`/${locale}/register`}
                  className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-4 py-1.5 rounded-full hover:bg-[var(--color-secondary)] hover:text-[var(--color-textHero)] transition-colors font-medium min-h-[44px] flex items-center"
                >
                  {t('get_started')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

