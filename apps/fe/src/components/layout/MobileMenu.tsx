'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Map, MapPin, Plus, BookOpen, Sprout, User, Settings, LogOut, X, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/shared/ui';
import { Logo } from '@/shared/ui';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileMenu({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const { user, profile, isLoading, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setIsUserMenuExpanded(false);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navItemClass = (href: string) =>
    `flex items-center gap-3 px-5 py-3 transition-colors min-h-[48px] w-full relative ${
      isActive(href)
        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/8'
        : 'text-[var(--color-text)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]'
    }`;

  const discoverItems = [
    { href: `/${locale}/discover/explore-map`, icon: Map, label: t('explore_map') },
    { href: `/${locale}/discover/dropbean`, icon: MapPin, label: t('dropbean') },
    { href: `/${locale}/discover/register-cafe`, icon: Plus, label: t('register_cafe') },
  ];

  const journeyItems = [
    { href: `/${locale}/my-logs`, icon: BookOpen, label: t('coffee_logs_item_1') },
    { href: `/${locale}/my-beans`, icon: Sprout, label: t('my_beans') },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-[var(--color-text)]" />
        ) : (
          <Menu className="w-5 h-5 text-[var(--color-text)]" />
        )}
      </button>

      {mounted && createPortal(
        <>
          {/* Overlay */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
              onClick={closeMenu}
            />
          )}

          {/* Slide-out Menu */}
          <div
            className={`fixed inset-y-0 right-0 w-[300px] bg-[var(--color-background)] border-l border-[var(--color-border)] z-[9999] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--color-border)] flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Logo size="md" className="text-[var(--color-primary)]" />
                <span className="text-lg font-bold text-[var(--color-text)]">IBeanThere</span>
              </div>
              <button
                onClick={closeMenu}
                className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-[var(--color-text)]" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto">
              {/* Discover section */}
              <div className="pt-2 pb-1">
                <p className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text)]/40">
                  Discover
                </p>
                {discoverItems.map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} onClick={closeMenu} className={navItemClass(href)}>
                    {isActive(href) && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-[var(--color-primary)] rounded-r-full" />
                    )}
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                ))}
              </div>

              <div className="mx-5 h-px bg-[var(--color-border)]" />

              {/* My Journey section */}
              <div className="pt-2 pb-1">
                <p className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text)]/40">
                  My Journey
                </p>
                {journeyItems.map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} onClick={closeMenu} className={navItemClass(href)}>
                    {isActive(href) && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-[var(--color-primary)] rounded-r-full" />
                    )}
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                ))}
              </div>

              <div className="mx-5 h-px bg-[var(--color-border)]" />

              {/* Account section */}
              <div className="pt-2 pb-2">
                <p className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text)]/40">
                  Account
                </p>
                {isLoading ? (
                  <div className="px-5 py-3">
                    <div className="w-8 h-8 bg-[var(--color-surface)] rounded-full animate-pulse" />
                  </div>
                ) : user ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuExpanded(prev => !prev)}
                      className="flex items-center justify-between px-5 py-3 w-full hover:bg-[var(--color-surface)] transition-colors min-h-[48px] group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={profile?.avatar_url || undefined}
                          alt={profile?.display_name || user.user_metadata?.username || 'User'}
                          size="sm"
                        />
                        <span className="text-sm font-medium text-[var(--color-text)] truncate max-w-[140px]">
                          {profile?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--color-text)]/50 transition-transform duration-200 ${isUserMenuExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isUserMenuExpanded && (
                      <div>
                        <Link
                          href={`/${locale}/profile`}
                          onClick={closeMenu}
                          className={navItemClass(`/${locale}/profile`)}
                        >
                          {isActive(`/${locale}/profile`) && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-[var(--color-primary)] rounded-r-full" />
                          )}
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{t('profile')}</span>
                        </Link>
                        <Link
                          href={`/${locale}/settings`}
                          onClick={closeMenu}
                          className={navItemClass(`/${locale}/settings`)}
                        >
                          {isActive(`/${locale}/settings`) && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-[var(--color-primary)] rounded-r-full" />
                          )}
                          <Settings className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{t('settings')}</span>
                        </Link>
                        <button
                          onClick={async () => {
                            await signOut();
                            closeMenu();
                            window.location.href = `/${locale}`;
                          }}
                          className="flex items-center gap-3 px-5 py-3 w-full text-[var(--color-text)] hover:bg-[var(--color-surface)] hover:text-red-500 transition-colors min-h-[48px] text-sm font-medium"
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          {tAuth('logout')}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-5 py-3 flex gap-2">
                    <Link
                      href={`/${locale}/signin`}
                      onClick={closeMenu}
                      className="flex-1 px-4 py-2.5 text-sm text-[var(--color-text)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)] font-medium transition-all text-center"
                    >
                      {t('sign_in')}
                    </Link>
                    <Link
                      href={`/${locale}/register`}
                      onClick={closeMenu}
                      className="flex-1 bg-[var(--color-primary)] text-[var(--color-primaryText)] px-4 py-2.5 rounded-full hover:bg-[var(--color-secondary)] transition-colors font-medium text-sm text-center"
                    >
                      {t('sign_up')}
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Switchers - Fixed at bottom */}
            <div className="px-5 py-4 border-t border-[var(--color-border)] flex-shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-center gap-3">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
