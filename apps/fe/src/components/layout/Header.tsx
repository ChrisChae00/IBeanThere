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

  /*
    The header floats over the landing hero and firms up into its normal solid
    self once the hero has scrolled past. The initial value is derived from the
    route rather than left false, so the landing page renders in its overlay
    state on the server and does not flash a solid bar before hydration.
  */
  const isLanding = pathname === `/${locale}` || pathname === `/${locale}/`;
  const [overMedia, setOverMedia] = useState(isLanding);

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) {
      setOverMedia(false);
      return;
    }

    /*
      Watching the hero itself rather than a sentinel: inset the viewport by the
      bar's own height and the hero stops intersecting at exactly the moment its
      last pixel passes under the bar.
    */
    const io = new IntersectionObserver(
      ([entry]) => setOverMedia(entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px' }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);

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
    Over media an active link cannot be marked with the brand colour - Morning
    Coffee's brown lands at 1.2:1 on the scrim - so the two states are told apart
    by opacity of the same light ink instead. The solid state keeps the colours it
    already had rather than inheriting the opacity trick, which would drop
    inactive links below AA on the light themes.
  */
  const navStateClass = (active: boolean) =>
    overMedia
      ? active
        ? 'text-ink-on-media'
        : 'text-ink-on-media/75 hover:text-ink-on-media'
      : active
        ? 'text-primary'
        : 'text-text hover:text-primary';

  const navLinkClass = (href: string) =>
    `font-medium transition-colors min-h-[44px] px-1 flex items-center text-sm ${navStateClass(isActive(href))}`;

  const journeyActive =
    isActive(`/${locale}/my-logs`) || isActive(`/${locale}/my-beans`);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 motion-fade-in border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        overMedia
          ? 'nav-over-media border-transparent shadow-none'
          : 'bg-background border-accent shadow-(--ibean-shadow-warm-sm)'
      }`}
    >
      {/*
        Kept mounted and faded so the two states cross over instead of the scrim
        popping in and out on every pass of the hero's bottom edge.
      */}
      <div
        aria-hidden
        className={`nav-scrim pointer-events-none absolute inset-x-0 top-0 h-28 -z-10 transition-opacity duration-300 ${
          overMedia ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-1 shrink-0">
            <Logo size="md" className={overMedia ? 'text-ink-on-media' : 'text-primary'} />
            <span className="text-xl font-bold text-text">
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

            <div className="h-4 w-px bg-border mx-1" />

            <Link
              href={`/${locale}/discover/dropbean`}
              className={navLinkClass(`/${locale}/discover/dropbean`)}
            >
              {t('dropbean')}
            </Link>

            <div className="h-4 w-px bg-border mx-1" />

            <Link
              href={`/${locale}/discover/register-cafe`}
              className={navLinkClass(`/${locale}/discover/register-cafe`)}
            >
              {t('register_cafe')}
            </Link>

            <div className="h-4 w-px bg-border mx-1" />

            <Link
              href={`/${locale}/learn/coffee`}
              className={navLinkClass(`/${locale}/learn`)}
            >
              {t('learn')}
            </Link>

            <div className="h-4 w-px bg-border mx-1" />

            {/* My Journey Dropdown */}
            <div ref={journeyRef} className="relative">
              <button
                onClick={() => setJourneyOpen(prev => !prev)}
                aria-expanded={journeyOpen}
                aria-haspopup="true"
                className={`font-medium transition-colors min-h-[44px] px-1 flex items-center gap-1 text-sm ${navStateClass(journeyActive)}`}
              >
                {t('my_coffee_journey')}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${journeyOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {journeyOpen && (
                <div className="nav-opaque absolute left-0 top-full mt-1 w-44 bg-background border border-border rounded-xl shadow-(--ibean-shadow-warm-md) overflow-hidden z-50 motion-slide-up">
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

          {/* Mobile Menu Button */}
          <MobileMenu locale={locale} />

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center space-x-2 ml-auto">
            <ThemeSwitcher />
            <LanguageSwitcher />

            {isLoading ? (
              <div className="w-8 h-8 bg-surface rounded-full animate-pulse" />
            ) : user ? (
              <ProfileDropdown locale={locale} />
            ) : (
              <>
                <Link
                  href={`/${locale}/signin`}
                  className={`border border-border text-text px-4 py-2 rounded-full hover:bg-surface font-medium transition-all min-h-[44px] flex items-center text-sm ${
                    overMedia ? 'hover:border-ink-on-media' : 'hover:border-primary'
                  }`}
                >
                  {t('sign_in')}
                </Link>
                <div className="h-6 w-px bg-border" />
                <Link
                  href={`/${locale}/register`}
                  className="bg-primary text-primaryText px-5 py-2 rounded-full hover:bg-secondary transition-all font-medium min-h-[44px] flex items-center shadow-(--ibean-shadow-warm-sm) text-sm"
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
