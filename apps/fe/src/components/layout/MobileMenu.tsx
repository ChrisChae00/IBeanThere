'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dialog } from '@base-ui/react/dialog';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Avatar, Logo } from '@/shared/ui';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

/*
  The drawer is a Base UI dialog rather than a hand-rolled portal. What that
  replaces is not styling: the previous panel stayed in the DOM when closed, so
  every link in it was still reachable by Tab from the page behind, and it had no
  Escape, no focus trap and no focus restore. Base UI supplies all four, plus the
  scroll lock the old effect wrote by hand.

  Rows are `.menu-item`, the same shape every other menu in the app draws, so a
  change to the row lands here too instead of leaving this one behind. The section
  headings are `.landing-micro`, which is the app's only chrome label.

  The rows carry no icons. The bar this drawer stands in for is text pills with no
  icon vocabulary at all, so a glyph per row was invented here and nowhere else --
  and a made-up icon beside "Drop Bean" tells a reader less than the words do.
*/

const ROW = 'menu-item py-3';

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-2">
      <p className="landing-micro px-3 pb-1 text-ink-secondary">{label}</p>
      {children}
    </div>
  );
}

export default function MobileMenu({ locale }: { locale: string }) {
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const tLog = useTranslations('cafe.log');
  const { user, profile, isLoading, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const pathname = usePathname();
  // In state, not a ref: the switchers' portals need the drawer element on the render
  // that mounts them, and a ref is still null then.
  const [drawer, setDrawer] = useState<HTMLElement | null>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const rowClass = (href: string) => `${ROW}${isActive(href) ? ' is-active' : ''}`;

  const displayName =
    profile?.display_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  const discoverItems = [
    { href: `/${locale}/discover/explore-map`, label: t('explore_map') },
    { href: `/${locale}/discover/dropbean`, label: t('dropbean') },
    { href: `/${locale}/discover/register-cafe`, label: t('register_cafe') },
    { href: `/${locale}/learn/coffee`, label: t('learn') },
  ];

  /*
    One account section, in the order the profile menu already lists these. The logs
    and the beans were their own "My Journey" heading here and nowhere else -- the bar
    this drawer stands in for keeps them inside the profile menu, next to the profile
    and the settings, and a section that exists in one of the two is a structure the
    reader has to learn twice. They are also the two rows that only mean anything once
    you are signed in, which is exactly what this section already is.
  */
  const accountItems = [
    ...(isAdmin ? [{ href: `/${locale}/admin/dashboard`, label: t('admin_dashboard') }] : []),
    { href: `/${locale}/profile`, label: t('profile') },
    { href: `/${locale}/my-logs`, label: tLog('my_logs') },
    { href: `/${locale}/my-beans`, label: t('my_beans') },
    { href: `/${locale}/settings`, label: t('settings') },
  ];

  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={
          <button
            className="nav-pill xl:hidden flex h-11 w-11 items-center justify-center text-text"
            aria-label={t('menu')}
          />
        }
      >
        <Menu className="h-5 w-5" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="nav-drawer-scrim fixed inset-0 z-(--z-nav-scrim) xl:hidden transition-opacity duration-300 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />

        {/*
          `nav-opaque` because the drawer opens out of a header that may be sitting
          on a photograph: without it the panel inherits the over-media vocabulary
          and paints light ink on its own light surface.

          The ground is `--surface-raised`, the same one `.menu-panel` stands on, and
          not the page. `.menu-item`'s hover fill is mixed from the raised surface, so
          a row hovered over the page surface came out *lighter* than the panel under
          it -- on Morning Coffee the page is a tan and the raised surface a near-white
          cream, and the hover read as a wash rather than as a row being pointed at.
        */}
        <Dialog.Popup ref={setDrawer} className="nav-opaque fixed inset-y-0 right-0 z-(--z-nav-drawer) flex w-80 max-w-full flex-col border-l border-edge-default bg-surface-raised outline-none xl:hidden transition-transform duration-300 data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-edge-rule px-5">
            <Dialog.Title className="flex items-center gap-2 text-lg font-logo text-ink-primary">
              <Logo size="md" className="text-brand" />
              ibeanthere
            </Dialog.Title>
            <Dialog.Close
              render={
                <button
                  className="nav-pill flex h-11 w-11 items-center justify-center text-ink-secondary hover:text-ink-primary"
                  aria-label={t('close_menu')}
                />
              }
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <nav className="scrollbar-quiet flex-1 overflow-y-auto px-2 py-2">
            <Section label={t('discover')}>
              {discoverItems.map(({ href, label }) => (
                <Dialog.Close key={href} nativeButton={false} render={<Link href={href} className={rowClass(href)} />}>
                  {label}
                </Dialog.Close>
              ))}
            </Section>

            <div className="mx-3 border-t border-edge-subtle" />

            <Section label={t('account')}>
              {isLoading ? (
                <div className="px-3 py-3">
                  <div className="h-8 w-8 animate-pulse rounded-(--radius-pill) bg-surface-hover" />
                </div>
              ) : user ? (
                <>
                  {/*
                    Who you are signed in as, read rather than pressed. The email is
                    what tells two accounts with the same display name apart, which is
                    the whole reason this row is not just the avatar in the header.
                  */}
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <Avatar src={profile?.avatar_url || undefined} alt={displayName} size="sm" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-ink-primary">
                        {displayName}
                      </span>
                      <span className="truncate text-xs text-ink-secondary">{user.email}</span>
                    </div>
                  </div>

                  {accountItems.map(({ href, label }) => (
                    <Dialog.Close key={href} nativeButton={false} render={<Link href={href} className={rowClass(href)} />}>
                      {label}
                    </Dialog.Close>
                  ))}

                  {/*
                    Signing out is the one row in the drawer that undoes something, and
                    it is named in the danger colour at rest rather than on hover: a
                    colour that only appears once the pointer is already on the row
                    arrives after the decision to press it.
                  */}
                  <Dialog.Close
                    render={
                      <button
                        className={`${ROW} text-state-danger`}
                        onClick={async () => {
                          await signOut();
                          window.location.href = `/${locale}`;
                        }}
                      />
                    }
                  >
                    {tAuth('logout')}
                  </Dialog.Close>
                </>
              ) : (
                /*
                  One filled control in the drawer, and it is the one that starts an
                  account. Signing in is the same action for someone who already has
                  one, so it draws a rule instead of taking a second fill.
                */
                <div className="flex flex-col gap-2 px-3 py-2">
                  <Dialog.Close
                    nativeButton={false}
                    render={
                      <Link
                        href={`/${locale}/signin`}
                        className="btn-line flex h-11 items-center justify-center rounded-(--btn-radius) text-sm font-semibold text-ink-primary"
                      />
                    }
                  >
                    {t('sign_in')}
                  </Dialog.Close>
                  <Dialog.Close
                    nativeButton={false}
                    render={
                      <Link
                        href={`/${locale}/register`}
                        className="btn-fill btn-shade flex h-11 items-center justify-center rounded-(--btn-radius) text-sm font-semibold"
                      />
                    }
                  >
                    {t('get_started')}
                  </Dialog.Close>
                </div>
              )}
            </Section>
          </nav>

          {/*
            The header's own two switchers, not a second pair written for this panel.
            They are portalled into the drawer rather than to the body: the drawer is a
            modal dialog, and a popup portalled outside it is outside the focus trap,
            where the dialog pulls focus back and closes the menu in the frame it
            opened.
          */}
          <div className="flex shrink-0 items-center justify-center gap-3 border-t border-edge-rule px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ThemeSwitcher container={drawer} />
            <LanguageSwitcher container={drawer} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
