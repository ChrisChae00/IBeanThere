'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Logo } from '@/shared/ui';
import MobileMenu from './MobileMenu';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileDropdown from './ProfileDropdown';
import DiscoverDropdown from './DiscoverDropdown';
import { useAuth } from '@/hooks/useAuth';

interface MenuCategory {
  id: string;
  labelKey: string;
  items: Array<{
    labelKey: string;
    descriptionKey?: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

const TAILWIND_BREAKPOINTS = {
  sm: 640,
  lg: 1024,
} as const;

const TAILWIND_PADDING = {
  px4: 16,
  px6: 24,
  px8: 32,
} as const;

const MEGA_MENU_OFFSETS = {
  dividerToMenu: 10,
} as const;

export default function Header({
  locale
}: {
  locale: string;
}) {
  const t = useTranslations('navigation');
  const { user, isLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLAnchorElement>(null);
  const myCoffeeJourneyRef = useRef<HTMLAnchorElement>(null);
  const shopRef = useRef<HTMLAnchorElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const divider1Ref = useRef<HTMLDivElement>(null);
  const divider2Ref = useRef<HTMLDivElement>(null);
  const divider3Ref = useRef<HTMLDivElement>(null);
  
  const menuCategories: MenuCategory[] = [
    {
      id: 'discover',
      labelKey: 'discover',
      items: [
        {
          labelKey: 'explore_map',
          descriptionKey: 'explore_map_description',
          href: `/${locale}/discover/explore-map`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )
        },
        {
          labelKey: 'dropbean',
          descriptionKey: 'dropbean_description',
          href: `/${locale}/discover/dropbean`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        },
        {
          labelKey: 'pending_spots',
          descriptionKey: 'pending_spots_description',
          href: `/${locale}/discover/pending-spots`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'community',
      labelKey: 'community',
      items: [
        {
          labelKey: 'community_badges',
          href: `/${locale}/community/badges`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          )
        },
        {
          labelKey: 'community_activity',
          href: `/${locale}/community`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'my_coffee_journey',
      labelKey: 'my_coffee_journey',
      items: [
        {
          labelKey: 'coffee_logs_item_1',
          href: `/${locale}/my-logs`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          labelKey: 'my_beans',
          href: `/${locale}/my-beans`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
      ]
    },
    /*
    {
      id: 'shop',
      labelKey: 'shop',
      items: [
        {
          labelKey: 'shop_essentials',
          href: `/${locale}/shop#essentials`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          labelKey: 'shop_explorer',
          href: `/${locale}/shop#explorer`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )
        },
        {
          labelKey: 'shop_wearable',
          href: `/${locale}/shop#wearable`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        {
          labelKey: 'shop_gift',
          href: `/${locale}/shop#gift`,
          icon: (
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          )
        }
      ]
    }
    */
  ];
  
  const getCategoryById = (id: string) => menuCategories.find(cat => cat.id === id);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeCategory || !megaMenuRef.current) return;
      
      const rect = megaMenuRef.current.getBoundingClientRect();
      const discoverRect = discoverRef.current?.getBoundingClientRect();
      const communityRect = communityRef.current?.getBoundingClientRect();
      const myCoffeeJourneyRect = myCoffeeJourneyRef.current?.getBoundingClientRect();
      const shopRect = shopRef.current?.getBoundingClientRect();
      
      const isInAnyNavItem = 
        (discoverRect && e.clientX >= discoverRect.left && e.clientX <= discoverRect.right && e.clientY >= discoverRect.top && e.clientY <= discoverRect.bottom) ||
        (communityRect && e.clientX >= communityRect.left && e.clientX <= communityRect.right && e.clientY >= communityRect.top && e.clientY <= communityRect.bottom) ||
        (myCoffeeJourneyRect && e.clientX >= myCoffeeJourneyRect.left && e.clientX <= myCoffeeJourneyRect.right && e.clientY >= myCoffeeJourneyRect.top && e.clientY <= myCoffeeJourneyRect.bottom) ||
        (shopRect && e.clientX >= shopRect.left && e.clientX <= shopRect.right && e.clientY >= shopRect.top && e.clientY <= shopRect.bottom);
      
      if (!isInAnyNavItem && !megaMenuRef.current?.contains(e.target as Node)) {
        if (e.clientY > rect.bottom + 10) {
          setActiveCategory(null);
        }
      }
    };

    if (activeCategory) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [activeCategory]);
  
  const getNavItemLeft = (ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return 0;
    const rect = ref.current.getBoundingClientRect();
    const container = ref.current.closest('.max-w-8xl')?.getBoundingClientRect();
    if (!container) return 0;
    return rect.left - container.left;
  };
  
  const getNavItemRight = (ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return 0;
    const rect = ref.current.getBoundingClientRect();
    const container = ref.current.closest('.max-w-8xl')?.getBoundingClientRect();
    if (!container) return 0;
    return rect.right - container.left;
  };
  
  const getDividerRight = (ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return 0;
    const rect = ref.current.getBoundingClientRect();
    const container = ref.current.closest('.max-w-8xl')?.getBoundingClientRect();
    if (!container) return 0;
    return rect.right - container.left;
  };
  
  const getMegaMenuPadding = () => {
    if (typeof window === 'undefined') return TAILWIND_PADDING.px4;
    const width = window.innerWidth;
    if (width >= TAILWIND_BREAKPOINTS.lg) return TAILWIND_PADDING.px8;
    if (width >= TAILWIND_BREAKPOINTS.sm) return TAILWIND_PADDING.px6;
    return TAILWIND_PADDING.px4;
  };
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)] border-b border-[var(--color-accent)] shadow-[var(--ibean-shadow-warm-sm)] motion-fade-in">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center space-x-1">
              <Logo size="md" className="text-[var(--color-primary)]" />
              <span className="text-xl font-bold text-[var(--color-text)]">
                IBeanThere
              </span>
            </Link>

            {/* Desktop Navigation - Left Side */}
            <nav ref={navRef} className="hidden lg:flex items-center space-x-3 ml-12">
              {/* Desktop: Mega Menu */}
              <div 
                ref={discoverRef}
                className="relative"
                onMouseEnter={() => setActiveCategory('discover')}
                onMouseLeave={() => {}}
              >
                <Link
                  href={`/${locale}/discover/explore-map`}
                  className="text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors min-h-[44px] px-1 flex items-center"
                >
                  {t('discover')}
                </Link>
              </div>
              
              <div ref={divider1Ref} className="h-6 w-px bg-[var(--color-border)]" />
              <Link 
                ref={communityRef}
                href={`/${locale}/community`}
                className="text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors min-h-[44px] px-1 flex items-center"
                onMouseEnter={() => setActiveCategory('community')}
                onMouseLeave={() => {}}
              >
                {t('community')}
              </Link>
              <div ref={divider2Ref} className="h-6 w-px bg-[var(--color-border)]" />
              <Link 
                ref={myCoffeeJourneyRef}
                href={`/${locale}/my-logs`}
                className="text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors min-h-[44px] px-1 flex items-center"
                onMouseEnter={() => setActiveCategory('my_coffee_journey')}
                onMouseLeave={() => {}}
              >
                {t('my_coffee_journey')}
              </Link>
              {/* <div ref={divider3Ref} className="h-6 w-px bg-[var(--color-border)]" />
              <Link 
                ref={shopRef}
                href={`/${locale}/shop`}
                className="text-[var(--color-text)] hover:text-[var(--color-textSecondary)] font-medium transition-colors min-h-[44px] px-1 flex items-center"
                onMouseEnter={() => setActiveCategory('shop')}
                onMouseLeave={() => {}}
              >
                {t('shop')}
              </Link> */}
            </nav>

            {/* Mobile Menu Button */}
            <MobileMenu locale={locale} />

            {/* Desktop Navigation - Right Side */}
            <div className="hidden lg:flex items-center space-x-2 ml-auto">
              <ThemeSwitcher />
              <LanguageSwitcher />
              
              {/* Conditional rendering based on authentication status */}
              {isLoading ? (
                <div className="w-8 h-8 bg-[var(--color-surface)] rounded-full animate-pulse"></div>
              ) : user ? (
                <ProfileDropdown locale={locale} />
              ) : (
                <>
                  <Link 
                    href={`/${locale}/signin`}
                    className="border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-full hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)] font-medium transition-all min-h-[44px] flex items-center"
                  >
                    {t('sign_in')}
                  </Link>
                  <div className="h-6 w-px bg-[var(--color-border)]" />
                  <Link 
                    href={`/${locale}/register`}
                    className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-5 py-2 rounded-full hover:bg-[var(--color-secondary)] transition-all font-medium min-h-[44px] flex items-center shadow-[var(--ibean-shadow-warm-sm)]"
                  >
                    {t('get_started')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mega Menu */}
      {activeCategory && (
        <div 
          ref={megaMenuRef}
          className="fixed top-16 left-0 right-0 z-40 bg-[var(--color-primary)] border-t border-[var(--color-border)]/70"
          onMouseEnter={() => setActiveCategory(activeCategory)}
          onMouseLeave={() => setActiveCategory(null)}
        >
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-3">
              {(() => {
                const category = getCategoryById(activeCategory);
                if (!category) return null;
                
                let adjustedOffset = 0;
                const megaMenuPadding = getMegaMenuPadding();
                
                if (category.id === 'discover') {
                  adjustedOffset = getNavItemLeft(navRef as React.RefObject<HTMLElement>) - megaMenuPadding;
                } else if (category.id === 'community') {
                  adjustedOffset = getDividerRight(divider1Ref as React.RefObject<HTMLElement>) + MEGA_MENU_OFFSETS.dividerToMenu - megaMenuPadding;
                } else if (category.id === 'my_coffee_journey') {
                  adjustedOffset = getDividerRight(divider2Ref as React.RefObject<HTMLElement>) + MEGA_MENU_OFFSETS.dividerToMenu - megaMenuPadding;
                } else if (category.id === 'shop') {
                  adjustedOffset = getDividerRight(divider3Ref as React.RefObject<HTMLElement>) + MEGA_MENU_OFFSETS.dividerToMenu - megaMenuPadding;
                }
                
                return (
                  <div 
                    className="flex-shrink-0"
                    style={{ paddingLeft: adjustedOffset }}
                  >
                    <div className="space-y-3">
                      {category.items.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="block px-3 py-2 text-[var(--color-primaryText)] hover:bg-[var(--color-primaryText)]/10 rounded-lg transition-colors"
                          onClick={() => setActiveCategory(null)}
                        >
                          <span className="font-semibold text-base block">{t(item.labelKey)}</span>
                          {item.descriptionKey && (
                            <p className="text-xs text-[var(--color-primaryText)]/50 mt-0.5">
                              {t(item.descriptionKey)}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

