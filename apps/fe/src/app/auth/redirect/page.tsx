'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Read locale from sessionStorage (set before OAuth started)
    const locale = sessionStorage.getItem('oauth_redirect_locale') || 'en';
    
    // Clean up
    sessionStorage.removeItem('oauth_redirect_locale');
    
    // Redirect to the locale-specific home page
    router.replace(`/${locale}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--color-text)]">Redirecting...</p>
      </div>
    </div>
  );
}
