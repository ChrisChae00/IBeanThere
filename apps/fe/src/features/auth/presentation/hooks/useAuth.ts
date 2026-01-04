'use client';

/**
 * useAuth Hook - Presentation Layer
 * 
 * Clean architecture version of auth hook.
 * Now uses AuthContext for centralized state management.
 */

import { useAuthContext } from '../contexts/AuthContext';

// Re-export the hook with the same interface for backward compatibility
export function useAuth() {
  return useAuthContext();
}

