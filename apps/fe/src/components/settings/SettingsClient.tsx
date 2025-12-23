'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { createClient } from '@/shared/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import PasswordChangeForm from './PasswordChangeForm';

// Icons
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const LogOutIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function SettingsClient() {
  const t = useTranslations('settings');
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const currentLocale = pathname.split('/')[1] || 'en';

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push(`/${currentLocale}`);
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');
    window.location.href = newPathname;
  };

  const languageNames: Record<string, string> = {
    en: 'English',
    ko: '한국어'
  };

  return (
    <div className="space-y-6">
      {/* Account Section */}
      <Card variant="default" padding="lg">
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <UserIcon />
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              {t('account')}
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {/* Profile Settings Link */}
          <Link 
            href={`/${currentLocale}/profile`}
            className="flex items-center justify-between p-3 min-h-[48px] rounded-lg hover:bg-[var(--color-surface)] transition-colors"
          >
            <span className="text-[var(--color-text)]">{t('profile_settings')}</span>
            <ChevronRightIcon />
          </Link>

          {/* Password Change */}
          <div className="border-t border-[var(--color-border)]/60 pt-3">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex items-center justify-between w-full p-3 min-h-[48px] rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <LockIcon />
                <span className="text-[var(--color-text)]">{t('change_password')}</span>
              </div>
              {showPasswordForm ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </button>
            
            {showPasswordForm && (
              <div className="mt-3 p-4 bg-[var(--color-surface)] rounded-lg">
                <PasswordChangeForm 
                  onSuccess={() => setShowPasswordForm(false)}
                  onCancel={() => setShowPasswordForm(false)}
                />
              </div>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-[var(--color-border)]/60 pt-3">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-2 w-full p-3 min-h-[48px] rounded-lg hover:bg-[var(--color-surface)] transition-colors text-[var(--color-error)]"
            >
              <LogOutIcon />
              <span>{isSigningOut ? '...' : t('sign_out')}</span>
            </button>
          </div>

          {/* Withdrawal (Coming Soon) */}
          <div className="border-t border-[var(--color-border)]/60 pt-3">
            <div className="flex items-center justify-between p-3 rounded-lg opacity-50 cursor-not-allowed">
              <span className="text-[var(--color-text-secondary)]">{t('withdrawal')}</span>
              <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-2 py-1 rounded">
                {t('withdrawal_coming_soon')}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* App Preferences Section */}
      <Card variant="default" padding="lg">
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <PaletteIcon />
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              {t('app_preferences')}
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between p-3 rounded-lg">
            <span className="text-[var(--color-text)]">{t('theme')}</span>
            <div className="relative inline-block bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-primary)] transition-colors group">
              <select 
                value={currentTheme.name}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-transparent text-[var(--color-text)] group-hover:text-[var(--color-primaryText)] text-sm font-medium cursor-pointer focus:outline-none border-none appearance-none pl-3 pr-8 py-2 leading-normal transition-colors"
                aria-label="Select theme"
              >
                {availableThemes.map((theme) => (
                  <option key={theme.name} value={theme.name}>
                    {theme.displayName}
                  </option>
                ))}
              </select>
              <svg 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text)] group-hover:text-[var(--color-primaryText)] pointer-events-none transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-3 rounded-lg border-t border-[var(--color-border)]/60 pt-4">
            <div className="flex items-center gap-2">
              <GlobeIcon />
              <span className="text-[var(--color-text)]">{t('language')}</span>
            </div>
            <div className="relative inline-block bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-primary)] transition-colors group">
              <select
                value={currentLocale}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-[var(--color-text)] group-hover:text-[var(--color-primaryText)] text-sm font-medium cursor-pointer focus:outline-none border-none pl-3 pr-8 py-2 leading-normal appearance-none transition-colors"
                aria-label="Select language"
              >
                <option value="en">{languageNames.en}</option>
                <option value="ko">{languageNames.ko}</option>
              </select>
              <svg 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text)] group-hover:text-[var(--color-primaryText)] pointer-events-none transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      {/* About Section */}
      <Card variant="default" padding="lg">
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <InfoIcon />
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              {t('about')}
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {/* Version */}
          <div className="flex items-center justify-between p-3 rounded-lg">
            <span className="text-[var(--color-text)]">{t('version')}</span>
            <span className="text-[var(--color-text-secondary)]">v1.0.0</span>
          </div>

          {/* Terms of Service */}
          <div className="border-t border-[var(--color-border)]/60 pt-3">
            <Link 
              href={`/${currentLocale}/terms`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            >
              <span className="text-[var(--color-text)]">{t('terms_of_service')}</span>
              <ChevronRightIcon />
            </Link>
          </div>

          {/* Privacy Policy */}
          <div className="border-t border-[var(--color-border)]/60 pt-3">
            <Link 
              href={`/${currentLocale}/privacy`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            >
              <span className="text-[var(--color-text)]">{t('privacy_policy')}</span>
              <ChevronRightIcon />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
