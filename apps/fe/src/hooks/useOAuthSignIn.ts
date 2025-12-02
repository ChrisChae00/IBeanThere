import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useErrorTranslator } from './useErrorTranslator';

type OAuthProvider = 'google' | 'facebook';

interface UseOAuthSignInReturn {
  isLoading: boolean;
  error: string;
  signInWithOAuth: (provider: OAuthProvider, locale: string) => Promise<void>;
  clearError: () => void;
}

export function useOAuthSignIn(): UseOAuthSignInReturn {
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClient();
  const { translateError } = useErrorTranslator();

  const signInWithOAuth = async (provider: OAuthProvider, locale: string) => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/${locale}`,
        },
      });

      if (error) {
        setError(translateError(error.message));
      }
    } catch (err) {
      setError(t('errors.unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError('');
  };

  return {
    isLoading,
    error,
    signInWithOAuth,
    clearError,
  };
}
