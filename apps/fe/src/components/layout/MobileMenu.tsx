'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import Logo from '@/components/ui/Logo';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileMenu({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDiscoverExpanded, setIsDiscoverExpanded] = useState(false);
  const [isCoffeeLogsExpanded, setIsCoffeeLogsExpanded] = useState(false);
  const [isShopExpanded, setIsShopExpanded] = useState(false);
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false);
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const { user, isLoading, signOut } = useAuth();

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

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setIsDiscoverExpanded(false);
    setIsCoffeeLogsExpanded(false);
    setIsShopExpanded(false);
    setIsUserMenuExpanded(false);
  };
  const toggleDiscover = () => setIsDiscoverExpanded(!isDiscoverExpanded);
  const toggleCoffeeLogs = () => setIsCoffeeLogsExpanded(!isCoffeeLogsExpanded);
  const toggleShop = () => setIsShopExpanded(!isShopExpanded);
  const toggleUserMenu = () => setIsUserMenuExpanded(!isUserMenuExpanded);

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
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Menu */}
      <div 
        className={`fixed top-0 right-0 h-screen w-[280px] bg-[var(--color-background)] border-l border-[var(--color-border)] z-[70] transform transition-transform duration-300 ease-in-out lg:hidden overflow-x-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-screen bg-[var(--color-background)] overflow-x-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-background)] w-full overflow-x-hidden">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Logo size="md" className="text-[var(--color-primary)] flex-shrink-0" />
              <span className="text-lg font-bold text-[var(--color-primary)] truncate">
                IBeanThere
              </span>
            </div>
            <button 
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-[var(--color-background)] text-[var(--color-text)] min-h-0 w-full">
            <Link 
              href={`/${locale}`}
              onClick={closeMenu}
              className="block px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors font-medium min-h-[44px] flex items-center w-full min-w-0"
            >
              <span className="truncate">{t('home')}</span>
            </Link>

            <div className="h-px bg-[var(--color-border)] mx-6" />

            {/* Discover Section - Expandable */}
            <div>
              <button
                onClick={toggleDiscover}
                className="w-full flex items-center justify-between px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors font-medium min-h-[44px] min-w-0 group"
              >
                <span className="truncate">{t('discover')}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDiscoverExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDiscoverExpanded && (
                <div className="bg-[var(--color-surface)]/50 w-full overflow-x-hidden">
                  <Link 
                    href={`/${locale}/discover/explore-map`}
                    onClick={closeMenu}
                    className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                  >
                    <span className="truncate">{t('explore_map')}</span>
                  </Link>
                  <Link 
                    href={`/${locale}/discover/pending-spots`}
                    onClick={closeMenu}
                    className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                  >
                    <span className="truncate">{t('pending_spots')}</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="h-px bg-[var(--color-border)] mx-6" />

            {/* My Coffee Logs Section - Expandable */}
            <div>
              <button
                onClick={toggleCoffeeLogs}
                className="w-full flex items-center justify-between px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors font-medium min-h-[44px] min-w-0 group"
              >
                <span className="truncate">{t('my_coffee_journey')}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isCoffeeLogsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCoffeeLogsExpanded && (
                <div className="bg-[var(--color-surface)]/50 w-full overflow-x-hidden">
                  <Link 
                    href={`/${locale}/my-logs`}
                    onClick={closeMenu}
                    className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                  >
                    <span className="truncate">{t('coffee_logs_item_1')}</span>
                  </Link>
                  <Link 
                    href={`/${locale}/my-coffee-logs/stats`}
                    onClick={closeMenu}
                    className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                  >
                    <span className="truncate">{t('coffee_logs_item_2')}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* <div className="h-px bg-[var(--color-border)] mx-6" /> */}

            {/* Shop Section - Expandable */}
            {/* <div className="border-b border-[var(--color-border)]">
              <button
                onClick={toggleShop}
                className="w-full flex items-center justify-between px-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors font-medium min-h-[44px] min-w-0 group"
              >
                <span className="truncate">{t('shop')}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isShopExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isShopExpanded && (
                <div className="bg-[var(--color-surface)]/50 w-full overflow-x-hidden">
                  <Link 
                    href={`/${locale}/shop#essentials`}
                    onClick={closeMenu}
                    className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                  >
                    <span className="truncate">{t('shop_essentials')}</span>
                  </Link>
                  <Link 
                    href={`/${locale}/shop#explorer`}
                    onClick={closeMenu}
                    className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                  >
                    <span className="truncate">{t('shop_explorer')}</span>
                  </Link>
                  <Link 
                    href={`/${locale}/shop#wearable`}
                    onClick={closeMenu}
                    className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                  >
                    <span className="truncate">{t('shop_wearable')}</span>
                  </Link>
                  <Link 
                    href={`/${locale}/shop#gift`}
                    onClick={closeMenu}
                    className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                  >
                    <span className="truncate">{t('shop_gift')}</span>
                  </Link>
                </div>
              )}
            </div> */}
            
            {/* Conditional rendering based on authentication status */}
            {isLoading ? (
              <div className="px-6 py-2">
                <div className="w-8 h-8 bg-[var(--color-surface)] rounded-full animate-pulse"></div>
              </div>
            ) : user ? (
              <>
                {/* User information - Expandable */}
                <div className={isUserMenuExpanded ? '' : 'border-b border-[var(--color-border)]'}>
                  <button
                    onClick={toggleUserMenu}
                    className="w-full flex items-center justify-between px-6 py-2 hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-w-0 group"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 group-hover:[&>div]:bg-[var(--color-primaryText)] group-hover:[&>div]:text-[var(--color-primary)]">
                        <Avatar 
                          src={user.user_metadata?.avatar_url} 
                          alt={user.user_metadata?.username || user.email || 'User'}
                          size="sm"
                          className="flex-shrink-0"
                        />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden text-left">
                        <p className="text-[var(--color-text)] font-medium truncate leading-tight text-sm mt-0 group-hover:text-[var(--color-primaryText)] transition-colors">
                          {user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-[var(--color-textSecondary)] text-xs truncate leading-tight mt-0.5 group-hover:text-[var(--color-primaryText)] transition-colors opacity-80 group-hover:opacity-100">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isUserMenuExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserMenuExpanded && (
                    <div className="bg-[var(--color-surface)]/50 w-full overflow-x-hidden">
                      <Link 
                        href={`/${locale}/profile`}
                        onClick={closeMenu}
                        className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                      >
                        <span className="truncate">{t('profile')}</span>
                      </Link>
                      <Link 
                        href={`/${locale}/settings`}
                        onClick={closeMenu}
                        className="block pl-12 pr-6 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors min-h-[44px] flex items-center w-full min-w-0"
                      >
                        <span className="truncate">{t('settings')}</span>
                      </Link>
                      <div className="h-px bg-[var(--color-border)] mx-6" />
                      <div className="px-6 py-2">
                        <button
                          onClick={async () => {
                            await signOut();
                            closeMenu();
                            window.location.href = `/${locale}`;
                          }}
                          className="block w-full px-6 py-1.5 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors font-medium min-h-[40px] text-center border border-[var(--color-border)] rounded-lg"
                        >
                          {tAuth('logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="px-6 pb-4 w-full overflow-x-hidden">
                <div className="flex gap-2 w-full min-w-0">
                  <Link 
                    href={`/${locale}/signin`}
                    onClick={closeMenu}
                    className="flex-1 px-4 py-3 text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors font-medium min-h-[44px] flex items-center justify-center border border-[var(--color-border)] rounded-full min-w-0"
                  >
                    <span className="truncate">{t('sign_in')}</span>
                  </Link>
                  <Link 
                    href={`/${locale}/register`}
                    onClick={closeMenu}
                    className="flex-1 bg-[var(--color-primary)] text-[var(--color-primaryText)] px-4 py-3 rounded-full hover:bg-[var(--color-secondary)] transition-colors font-medium min-h-[44px] text-center flex items-center justify-center min-w-0"
                  >
                    <span className="truncate">{t('sign_up')}</span>
                  </Link>
                </div>
              </div>
            )}
          </nav>
          
          {/* Switchers - Fixed at bottom */}
          <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-background)] flex-shrink-0 w-full overflow-x-hidden">
            <div className="flex items-center justify-center gap-3 w-full min-w-0">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

