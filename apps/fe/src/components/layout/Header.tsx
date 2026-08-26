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

  /*
    The active link cannot be marked with the brand colour - Morning Coffee's
    brown lands at 1.2:1 on the scrim - so the two are told apart by opacity of
    the same light ink instead.
  */
  const navStateClass = (active: boolean) =>
    active
      ? 'text-ink-on-media'
      : 'text-ink-on-media hover:text-ink-on-media';

  /*
    `nav-pill` carries the hover treatment: a filled, glowing pill behind the
    label rather than a brighter label. The horizontal padding is what gives it
    something to fill, so it is part of the shape rather than spacing taste.

    Every control in the bar is `h-10`, replacing the 44px touch minimum these
    carried: the desktop row is pointer-only, and 44 inside a 64px bar leaves so
    little air that the pills read as a second bar rather than as buttons. The
    hamburger below `xl` keeps its 44.
  */
  const navLinkClass = (href: string) =>
    `nav-pill font-medium h-10 px-3 flex items-center whitespace-nowrap text-sm ${navStateClass(isActive(href))}`;

  const journeyActive =
    isActive(`/${locale}/my-logs`) || isActive(`/${locale}/my-beans`);

  /*
    One treatment everywhere, not two. The bar used to swap to the theme's own
    surface once the landing hero had scrolled past; carrying the scrim the whole
    way keeps the glass reading as one material, and it means there is no state
    to get wrong and no rule under the bar to divide it from the page - the
    scrim's own falloff is the edge.
  */
  return (
    <header className="nav-over-media fixed top-0 left-0 right-0 z-50 motion-fade-in">
      <div
        aria-hidden
        className="nav-scrim pointer-events-none absolute inset-x-0 top-0 h-24 -z-10"
      />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*
          The nav follows the logo rather than sitting at the centre of the bar.
          Centring needs the two outer blocks to be equal, and they are not: the
          English labels are wide enough that the controls had nowhere left to go
          and started wrapping their own text onto two lines. Nothing here may
          shrink, so the row overflows before it deforms.
        */}
        <div className="flex items-center h-16 gap-2">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-1 shrink-0">
            <Logo size="md" className="text-ink-on-media" />
            {/* Display weight is a system decision; the utility does nothing here. */}
            <span className="text-xl text-text whitespace-nowrap font-logo">
              ibeanthere
            </span>
          </Link>

          {/*
            Desktop navigation. No dividers between the items any more - a fixed
            rule between two pills makes the hovered one look boxed in rather
            than lifted.
          */}
          <nav className="hidden xl:flex items-center gap-1 ml-6 shrink-0">
            <Link
              href={`/${locale}/discover/explore-map`}
              className={navLinkClass(`/${locale}/discover/explore-map`)}
            >
              {t('explore_map')}
            </Link>

            <Link
              href={`/${locale}/discover/dropbean`}
              className={navLinkClass(`/${locale}/discover/dropbean`)}
            >
              {t('dropbean')}
            </Link>

            <Link
              href={`/${locale}/discover/register-cafe`}
              className={navLinkClass(`/${locale}/discover/register-cafe`)}
            >
              {t('register_cafe')}
            </Link>

            <Link
              href={`/${locale}/learn/coffee`}
              className={navLinkClass(`/${locale}/learn`)}
            >
              {t('learn')}
            </Link>

            {/* My Journey Dropdown */}
            <div ref={journeyRef} className="relative">
              <button
                onClick={() => setJourneyOpen(prev => !prev)}
                aria-expanded={journeyOpen}
                aria-haspopup="true"
                className={`nav-pill font-medium h-10 px-3 flex items-center gap-1 whitespace-nowrap text-sm ${navStateClass(journeyActive)}`}
                data-popup-open={journeyOpen || undefined}
              >
                {t('my_coffee_journey')}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${journeyOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {journeyOpen && (
                <div className="nav-opaque absolute left-0 top-full mt-2 w-44 bg-background border border-border rounded-(--radius-card) shadow-(--ibean-shadow-warm-md) overflow-hidden z-50 motion-slide-up">
                  <div className="py-1">
                    <Link
                      href={`/${locale}/my-logs`}
                      onClick={() => setJourneyOpen(false)}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        isActive(`/${locale}/my-logs`)
                          ? 'text-primary bg-surface'
                          : 'text-text hover:bg-surface hover:text-primary'
                      }`}
                    >
                      {t('coffee_logs_item_1')}
                    </Link>
                    <Link
                      href={`/${locale}/my-beans`}
                      onClick={() => setJourneyOpen(false)}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        isActive(`/${locale}/my-beans`)
                          ? 'text-primary bg-surface'
                          : 'text-text hover:bg-surface hover:text-primary'
                      }`}
                    >
                      {t('my_beans')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* `ml-auto` is what pushes this to the far edge now that the row is flex. */}
          <div className="flex items-center justify-end gap-2 ml-auto shrink-0">
            <MobileMenu locale={locale} />

            <div className="hidden xl:flex items-center gap-1">
              <ThemeSwitcher />
              <LanguageSwitcher />

              {/*
                The radius here reads from the button token rather than a
                `rounded-full` utility, so these two follow whatever the token
                settles on instead of pinning themselves to a pill.
              */}
              {isLoading ? (
                <div className="w-8 h-8 bg-surface rounded-full animate-pulse ml-1" />
              ) : user ? (
                <div className="ml-1">
                  <ProfileDropdown locale={locale} />
                </div>
              ) : (
                <>
                  <Link
                    href={`/${locale}/signin`}
                    className="ml-1 border border-border text-text px-4 rounded-(--btn-radius) hover:bg-surface hover:border-ink-on-media font-medium transition-all h-10 flex items-center whitespace-nowrap text-sm"
                  >
                    {t('sign_in')}
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    className="btn-shade bg-primary text-primaryText px-5 rounded-(--btn-radius) font-medium h-10 flex items-center whitespace-nowrap shadow-(--ibean-shadow-warm-sm) text-sm"
                  >
                    {t('get_started')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
