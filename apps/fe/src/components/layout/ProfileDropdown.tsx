'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FileText, LogOut, Settings, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Avatar, CoffeeBean } from '@/shared/ui';

interface ProfileDropdownProps {
  locale: string;
}

/*
  Panel and rows come from `.menu-panel` / `.menu-item` / `.menu-mark` in
  globals.css, which every dropdown in the app shares. Only what is specific to
  this menu lives here: which mark each row carries, and how that mark answers a
  hover. The movement is chosen from what the row does rather than from one shared
  effect -- the gear turns, the exit arrow steps toward the door, the rest come
  forward slightly -- and `group` is what lets the mark hear a hover that lands
  anywhere on its row.
*/
const ITEM = 'group menu-item';

export default function ProfileDropdown({ locale }: ProfileDropdownProps) {
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const tLog = useTranslations('cafe.log');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    // Redirect to home page
    window.location.href = `/${locale}`;
  };

  if (!user) return null;

  const displayName =
    profile?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User';

  const close = () => setIsOpen(false);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-pill flex items-center space-x-2 px-2 h-10"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <Avatar src={profile?.avatar_url || undefined} alt={displayName} size="sm" />
        {/*
          Capped and truncated: this sits in a header row whose width is already
          accounted for, and a long display name is the one thing in it that can
          grow without limit.
        */}
        <span className="hidden md:block text-text font-medium max-w-[9rem] truncate">
          {displayName}
        </span>
        <svg
          className={`w-4 h-4 text-ink-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        /*
          `nav-opaque` stays even though every colour below is a semantic token that
          the over-media swap never touches: `Avatar` and anything else dropped in
          later may still read the legacy aliases, and this is the one class that
          hands them back the theme's own vocabulary.
        */
        <div className="menu-panel nav-opaque absolute right-0 mt-2 w-64 z-50 motion-slide-up">
          {/*
            Who you are signed in as. The trigger truncates the name to fit the
            header; this is where it is allowed the room to be read, next to the
            address that distinguishes two accounts with the same display name.
          */}
          <div className="flex items-center gap-3 rounded-(--radius-control) px-3 py-2.5">
            <Avatar src={profile?.avatar_url || undefined} alt={displayName} size="sm" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-ink-primary">{displayName}</span>
              <span className="truncate text-xs text-ink-secondary">{user.email}</span>
            </div>
          </div>

          <div className="my-1 border-t border-edge-subtle" />

          {isAdmin && (
            <>
              <Link href={`/${locale}/admin/dashboard`} className={`${ITEM} font-semibold`} onClick={close}>
                <ShieldCheck className="menu-mark group-hover:scale-110" />
                {t('admin_dashboard')}
              </Link>
              <div className="my-1 border-t border-edge-subtle" />
            </>
          )}

          <Link href={`/${locale}/profile`} className={ITEM} onClick={close}>
            <User className="menu-mark group-hover:scale-110" />
            {t('profile')}
          </Link>

          <Link href={`/${locale}/my-logs`} className={ITEM} onClick={close}>
            <FileText className="menu-mark group-hover:scale-110" />
            {tLog('my_logs')}
          </Link>

          {/*
            The app's own bean, not a lucide glyph. What used to sit here was a
            wireframe globe -- the closest thing in the icon set to nothing in
            particular -- for the page that holds the beans you have dropped.

            It also sits a notch larger than the lucide marks. Those are line
            drawings that fill their box; the bean is a solid shape with air around
            it inside the same square, so at a matched box it reads smaller than its
            neighbours. 1.1rem is the size it was already reaching on hover, and the
            hover now takes the same step again from there.
          */}
          <Link href={`/${locale}/my-beans`} className={ITEM} onClick={close}>
            <CoffeeBean size="inherit" className="menu-mark h-[1.1rem] w-[1.1rem] group-hover:scale-110" />
            {t('my_beans')}
          </Link>

          <Link href={`/${locale}/settings`} className={ITEM} onClick={close}>
            <Settings className="menu-mark group-hover:rotate-45" />
            {t('settings')}
          </Link>

          <div className="my-1 border-t border-edge-subtle" />

          {/*
            Red on hover only, which is what the mobile menu's logout already does:
            at rest it is one row among several, and the colour arrives at the
            moment the row is actually about to be pressed.
          */}
          <button onClick={handleSignOut} className={`${ITEM} hover:text-state-danger`}>
            <LogOut className="menu-mark group-hover:translate-x-1 group-hover:text-state-danger" />
            {tAuth('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
