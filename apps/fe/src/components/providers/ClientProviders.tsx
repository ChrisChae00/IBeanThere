'use client';

/**
 * Client Providers Component
 * 
 * Wraps all client-side context providers.
 * Used in server-side layout to provide client contexts.
 */

import { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
