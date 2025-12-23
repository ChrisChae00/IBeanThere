'use client';

/**
 * useAuth Hook - Presentation Layer
 * 
 * Clean architecture version of auth hook.
 * Uses AuthRepository for data operations.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile, needsProfileSetup, User } from '../../domain';
import { getAuthRepository } from '../../data';

interface UseAuthReturn {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  needsProfileSetup: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  
  const repository = useMemo(() => getAuthRepository(), []);

  const fetchProfile = useCallback(async (accessToken: string) => {
    const result = await repository.getCurrentUserProfile(accessToken);
    if (result.success) {
      setProfile(result.data);
    }
  }, [repository]);

  const checkNeedsSetup = useCallback((userData: User) => {
    setNeedsSetup(needsProfileSetup(userData));
  }, []);

  useEffect(() => {
    // Check current session
    const initSession = async () => {
      const session = await repository.getSession();
      
      if (session) {
        // Create a minimal SupabaseUser-like object for backward compatibility
        setUser({
          id: session.user.id,
          email: session.user.email,
          created_at: session.user.createdAt.toISOString(),
          user_metadata: {
            username: session.user.username,
            display_name: session.user.displayName,
            avatar_url: session.user.avatarUrl,
            terms_accepted: session.user.termsAccepted,
          },
          app_metadata: {},
          aud: 'authenticated',
        } as SupabaseUser);
        
        await fetchProfile(session.accessToken);
        checkNeedsSetup(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setNeedsSetup(false);
      }
      
      setIsLoading(false);
    };

    initSession();

    // Subscribe to auth state changes
    const unsubscribe = repository.onAuthStateChange(async (session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          created_at: session.user.createdAt.toISOString(),
          user_metadata: {
            username: session.user.username,
            display_name: session.user.displayName,
            avatar_url: session.user.avatarUrl,
            terms_accepted: session.user.termsAccepted,
          },
          app_metadata: {},
          aud: 'authenticated',
        } as SupabaseUser);
        
        await fetchProfile(session.accessToken);
        checkNeedsSetup(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setNeedsSetup(false);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, [repository, fetchProfile, checkNeedsSetup]);

  const signOut = useCallback(async () => {
    await repository.signOut();
    setProfile(null);
  }, [repository]);

  const refreshProfile = useCallback(async () => {
    const session = await repository.getSession();
    if (session?.accessToken) {
      await fetchProfile(session.accessToken);
    }
  }, [repository, fetchProfile]);

  return {
    user,
    profile,
    isLoading,
    needsProfileSetup: needsSetup,
    signOut,
    refreshProfile,
  };
}
