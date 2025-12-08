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
      
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        
        // Check for temporary username pattern
        const username = metadata.username;
        const isTempUsername = !username || (username.startsWith('user_') && username.length > 5);
        
        // Check for consent acceptance (new requirement)
        // If terms_accepted is missing or false, they need to complete profile
        const hasAcceptedTerms = !!metadata.terms_accepted;
        
        setNeedsProfileSetup(isTempUsername || !hasAcceptedTerms);
      } else {
        setNeedsProfileSetup(false);
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
            
            const username = metadata.username;
            const isTempUsername = !username || (username.startsWith('user_') && username.length > 5);
            
            const hasAcceptedTerms = !!metadata.terms_accepted;
            
            setNeedsProfileSetup(isTempUsername || !hasAcceptedTerms);
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
