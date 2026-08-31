'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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

  /*
    One treatment everywhere, not two. The bar used to swap to the theme's own
    surface once the landing hero had scrolled past; carrying the scrim the whole
    way keeps the glass reading as one material, and it means there is no state
    to get wrong and no rule under the bar to divide it from the page - the
    scrim's own falloff is the edge.
  */
  return (
    <header className="nav-over-media fixed top-0 left-0 right-0 z-(--z-nav) motion-fade-in">
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

            {/*
              No separate journey dropdown here any more. It duplicated the same two
              links the profile menu already carries once you are signed in, and it
              was the only bar item shown to a signed-out visitor that led straight
              into an auth wall.
            */}
            <Link
              href={`/${locale}/learn/coffee`}
              className={navLinkClass(`/${locale}/learn`)}
            >
              {t('learn')}
            </Link>
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
