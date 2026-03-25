'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Logo } from '@/shared/ui';
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
  const pathname = usePathname();
  const [journeyOpen, setJourneyOpen] = useState(false);
  const journeyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!journeyOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (journeyRef.current && !journeyRef.current.contains(e.target as Node)) {
        setJourneyOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setJourneyOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [journeyOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navLinkClass = (href: string) =>
    `font-medium transition-colors min-h-[44px] px-1 flex items-center text-sm ${
      isActive(href)
        ? 'text-[var(--color-primary)]'
        : 'text-[var(--color-text)] hover:text-[var(--color-primary)]'
    }`;

  const journeyActive =
    isActive(`/${locale}/my-logs`) || isActive(`/${locale}/my-beans`);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)] border-b border-[var(--color-accent)] shadow-[var(--ibean-shadow-warm-sm)] motion-fade-in">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-1 flex-shrink-0">
            <Logo size="md" className="text-[var(--color-primary)]" />
            <span className="text-xl font-bold text-[var(--color-text)]">
              IBeanThere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 ml-10">
            <Link
              href={`/${locale}/discover/explore-map`}
              className={navLinkClass(`/${locale}/discover/explore-map`)}
            >
              {t('explore_map')}
            </Link>

            <div className="h-4 w-px bg-[var(--color-border)] mx-1" />

            <Link
              href={`/${locale}/discover/dropbean`}
              className={navLinkClass(`/${locale}/discover/dropbean`)}
            >
              {t('dropbean')}
            </Link>

            <div className="h-4 w-px bg-[var(--color-border)] mx-1" />

            <Link
              href={`/${locale}/discover/register-cafe`}
              className={navLinkClass(`/${locale}/discover/register-cafe`)}
            >
              {t('register_cafe')}
            </Link>

            <div className="h-4 w-px bg-[var(--color-border)] mx-1" />

            {/* My Journey Dropdown */}
            <div ref={journeyRef} className="relative">
              <button
                onClick={() => setJourneyOpen(prev => !prev)}
                aria-expanded={journeyOpen}
                aria-haspopup="true"
                className={`font-medium transition-colors min-h-[44px] px-1 flex items-center gap-1 text-sm ${
                  journeyActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text)] hover:text-[var(--color-primary)]'
                }`}
              >
                {t('my_coffee_journey')}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${journeyOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {journeyOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl shadow-[var(--ibean-shadow-warm-md)] overflow-hidden z-50 motion-slide-up">
                  <div className="py-1">
                    <Link
                      href={`/${locale}/my-logs`}
                      onClick={() => setJourneyOpen(false)}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        isActive(`/${locale}/my-logs`)
                          ? 'text-[var(--color-primary)] bg-[var(--color-surface)]'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]'
                      }`}
                    >
                      {t('coffee_logs_item_1')}
                    </Link>
                    <Link
                      href={`/${locale}/my-beans`}
                      onClick={() => setJourneyOpen(false)}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        isActive(`/${locale}/my-beans`)
                          ? 'text-[var(--color-primary)] bg-[var(--color-surface)]'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]'
                      }`}
                    >
                      {t('my_beans')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <MobileMenu locale={locale} />

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center space-x-2 ml-auto">
            <ThemeSwitcher />
            <LanguageSwitcher />

            {isLoading ? (
              <div className="w-8 h-8 bg-[var(--color-surface)] rounded-full animate-pulse" />
            ) : user ? (
              <ProfileDropdown locale={locale} />
            ) : (
              <>
                <Link
                  href={`/${locale}/signin`}
                  className="border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-full hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)] font-medium transition-all min-h-[44px] flex items-center text-sm"
                >
                  {t('sign_in')}
                </Link>
                <div className="h-6 w-px bg-[var(--color-border)]" />
                <Link
                  href={`/${locale}/register`}
                  className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-5 py-2 rounded-full hover:bg-[var(--color-secondary)] transition-all font-medium min-h-[44px] flex items-center shadow-[var(--ibean-shadow-warm-sm)] text-sm"
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
