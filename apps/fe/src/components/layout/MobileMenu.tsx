'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui';

export default function MobileMenu({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const { user, isLoading, signOut } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button 
        onClick={toggleMenu}
        className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <svg 
          className="w-6 h-6 text-[var(--color-text)]" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] bg-[var(--color-surface)] border-l border-[var(--color-border)] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">☕️</span>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                IBeanThere
              </span>
            </div>
            <button 
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-[var(--color-background)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg 
                className="w-6 h-6 text-[var(--color-text)]" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <Link 
              href={`/${locale}`}
              onClick={closeMenu}
              className="block px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors font-medium min-h-[44px] flex items-center"
            >
              {t('home')}
            </Link>
            <Link 
              href={`/${locale}/trending-cafes`}
              onClick={closeMenu}
              className="block px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors font-medium min-h-[44px] flex items-center"
            >
              {t('trending_cafes')}
            </Link>
            <Link 
              href={`/${locale}/new-spot`}
              onClick={closeMenu}
              className="block px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors font-medium min-h-[44px] flex items-center"
            >
              {t('new_spot')}
            </Link>
            <Link 
              href={`/${locale}/my-coffee-logs`}
              onClick={closeMenu}
              className="block px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors font-medium min-h-[44px] flex items-center"
            >
              {t('my_coffee_logs')}
            </Link>
            <Link 
              href={`/${locale}/shop`}
              onClick={closeMenu}
              className="block px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors font-medium min-h-[44px] flex items-center"
            >
              {t('shop')}
            </Link>
            
            <div className="h-px bg-[var(--color-border)] my-4 mx-6" />
            
            {/* Conditional rendering based on authentication status */}
            {isLoading ? (
              <div className="px-6 py-3">
                <div className="w-8 h-8 bg-[var(--color-surface)] rounded-full animate-pulse"></div>
              </div>
            ) : user ? (
              <>
                {/* User information */}
                <div className="px-6 py-3 border-b border-[var(--color-border)]">
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      src={user.user_metadata?.avatar_url} 
                      alt={user.user_metadata?.username || user.email || 'User'}
                      size="sm"
                    />
                    <div>
                      <p className="text-[var(--color-text)] font-medium">
                        {user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-[var(--color-text-secondary)] text-sm">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Profile menu */}
                <Link 
                  href={`/${locale}/profile`}
                  onClick={closeMenu}
                  className="block px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors font-medium min-h-[44px] flex items-center"
                >
                  {t('profile')}
                </Link>
                <Link 
                  href={`/${locale}/settings`}
                  onClick={closeMenu}
                  className="block px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors font-medium min-h-[44px] flex items-center"
                >
                  {t('settings')}
                </Link>
                
                <div className="h-px bg-[var(--color-border)] my-4 mx-6" />
                
                <button
                  onClick={async () => {
                    await signOut();
                    closeMenu();
                    window.location.href = `/${locale}`;
                  }}
                  className="block w-full px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors font-medium min-h-[44px] text-left"
                >
                  {tAuth('logout')}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href={`/${locale}/signin`}
                  onClick={closeMenu}
                  className="block px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors font-medium min-h-[44px] flex items-center"
                >
                  {t('sign_in')}
                </Link>
                
                {/* CTA Button */}
                <div className="p-4 border-t border-[var(--color-border)]">
                  <Link 
                    href={`/${locale}/register`}
                    onClick={closeMenu}
                    className="block w-full bg-[var(--color-primary)] text-white px-6 py-3 rounded-full hover:bg-[var(--color-secondary)] transition-colors font-medium min-h-[44px] text-center"
                  >
                    {t('sign_up')}
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

