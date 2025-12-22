import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  display_name: string;
  username: string;
  avatar_url?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const supabase = createClient();

  const fetchProfile = useCallback(async (accessToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile({
          display_name: data.display_name || data.username,
          username: data.username,
          avatar_url: data.avatar_url,
        });
      }
    } catch (error) {
      // Silently fail - profile will be null
    }
  }, []);

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        
        // Fetch profile from DB
        await fetchProfile(session.access_token);
        
        // Check for temporary username pattern
        const username = metadata.username;
        const isTempUsername = !username || (username.startsWith('user_') && username.length > 5);
        
        // Check for consent acceptance (new requirement)
        // If terms_accepted is missing or false, they need to complete profile
        const hasAcceptedTerms = !!metadata.terms_accepted;
        
        setNeedsProfileSetup(isTempUsername || !hasAcceptedTerms);
      } else {
        setNeedsProfileSetup(false);
        setProfile(null);
      }
      
      setIsLoading(false);
    };

    getSession();

    // Detect authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
            const metadata = session.user.user_metadata || {};
            
            // Fetch profile from DB
            await fetchProfile(session.access_token);
            
            const username = metadata.username;
            const isTempUsername = !username || (username.startsWith('user_') && username.length > 5);
            
            const hasAcceptedTerms = !!metadata.terms_accepted;
            
            setNeedsProfileSetup(isTempUsername || !hasAcceptedTerms);
        } else {
            setNeedsProfileSetup(false);
            setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  // Utility function to refresh profile after updates
  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      await fetchProfile(session.access_token);
    }
  }, [supabase.auth, fetchProfile]);

  return { user, profile, isLoading, signOut, needsProfileSetup, refreshProfile };
}
