'use client';

/**
 * Client Providers Component
 * 
 * Wraps all client-side context providers.
 * Used in server-side layout to provide client contexts.
 */

import { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth';
import { AnalyticsWatcher } from './AnalyticsWatcher';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      {/* Inside the provider: it reports who is reading, so it needs the session. */}
      <AnalyticsWatcher />
      {children}
    </AuthProvider>
  );
}
