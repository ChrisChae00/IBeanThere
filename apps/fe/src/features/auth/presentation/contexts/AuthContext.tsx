'use client';

/**
 * AuthContext - Presentation Layer
 * 
 * Provides centralized auth state management across the app.
 * Only one subscription to auth state changes, preventing duplicate API calls.
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile, needsProfileSetup, User } from '../../domain';
import { getAuthRepository } from '../../data';

interface AuthContextValue {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  needsProfileSetup: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Default value for when context is not available (SSR or before provider mounts)
const defaultContextValue: AuthContextValue = {
  user: null,
  profile: null,
  isLoading: true,
  needsProfileSetup: false,
  signOut: async () => {},
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultContextValue);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
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
    let isMounted = true;
    
    // Check current session
    const initSession = async () => {
      const session = await repository.getSession();
      
      if (!isMounted) return;
      
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
      if (!isMounted) return;
      
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

    return () => {
      isMounted = false;
      unsubscribe();
    };
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

  const value = useMemo(() => ({
    user,
    profile,
    isLoading,
    needsProfileSetup: needsSetup,
    signOut,
    refreshProfile,
  }), [user, profile, isLoading, needsSetup, signOut, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}

