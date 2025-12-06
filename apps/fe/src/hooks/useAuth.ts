'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      // Check for temporary username pattern
      if (session?.user?.user_metadata?.username) {
        const username = session.user.user_metadata.username;
        // Simple check: if username starts with 'user_' and matches ID part, it's likely temp
        // Or if username is missing from metadata entirely
        const isTemp = username.startsWith('user_') && username.length > 5; // A bit loose, but practical
        setNeedsProfileSetup(isTemp);
      } else if (session?.user) {
         // If no username at all, definitely need onboarding
         setNeedsProfileSetup(true);
      }
      
      setIsLoading(false);
    };

    getSession();

    // Detect authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user?.user_metadata?.username) {
            const username = session.user.user_metadata.username;
            const isTemp = username.startsWith('user_') && username.length > 5;
            setNeedsProfileSetup(isTemp);
        } else if (session?.user) {
            setNeedsProfileSetup(true);
        } else {
            setNeedsProfileSetup(false);
        }

        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, isLoading, signOut, needsProfileSetup };
}
