'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthWatcher() {
  const { needsProfileSetup, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Logic: If user needs profile setup (incomplete profile), redirect to /complete-profile
    if (needsProfileSetup) {
      if (!pathname.includes('/complete-profile') && !pathname.includes('/signout')) {
        // Prevent infinite loops and allow signout
        const locale = pathname.split('/')[1] || 'en';
        router.push(`/${locale}/complete-profile?returnUrl=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isLoading, needsProfileSetup, router, pathname]);

  return null; // This component renders nothing
}
