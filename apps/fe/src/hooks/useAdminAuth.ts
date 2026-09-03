'use client';

import { useAuth } from './useAuth';

interface UseAdminAuthReturn {
  isAdmin: boolean;
  isLoading: boolean;
}

/*
  Reads the role off the profile the auth context has already fetched. This used to
  make its own `/users/me` call, so every page that rendered the profile menu issued
  that request twice — and on a cold dev backend the second one queued behind the
  first, delaying everything else the page was waiting on.
*/
export function useAdminAuth(): UseAdminAuthReturn {
  const { profile, isLoading } = useAuth();

  return {
    isAdmin: profile?.role === 'admin',
    isLoading,
  };
}
