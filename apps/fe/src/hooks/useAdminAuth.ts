'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getCurrentUser, UserResponse } from '@/lib/api/users';

interface UseAdminAuthReturn {
  user: UserResponse | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userProfile = await getCurrentUser();
        setUser(userProfile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        const errorMessage = err instanceof Error ? err.message : 'FETCH_USER_PROFILE_FAILED';
        setError(errorMessage);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [authUser, authLoading]);

  const isAdmin = user?.role === 'admin';

  return {
    user,
    isAdmin,
    isLoading: authLoading || isLoading,
    error,
  };
}

