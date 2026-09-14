'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/client';
import { useOAuthSignIn } from '@/hooks/useOAuthSignIn';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';
import {
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  ErrorAlert,
  Button,
  Input
} from '@/components/ui';

/* Pill fields, matching the pill buttons above and below them. */
const FIELD = 'rounded-full pl-5';

interface LoginFormProps {
  locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();
  const { isLoading: oauthLoading, error: oauthError, signInWithOAuth } = useOAuthSignIn();
  const { translateError } = useErrorTranslator();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!validateEmail(email)) {
      setError(tErrors('invalid_email'));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(translateError(error.message));
      } else {
        // Handle remember me functionality
        if (rememberMe) {
          // Set longer session duration or store in localStorage
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        // Redirect to home page
        window.location.href = `/${locale}`;
      }
    } catch (err) {
      setError(tErrors('unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithOAuth('google', locale);
  };



  const displayError = error || oauthError;

  return (
    <form onSubmit={handleSubmit} className="blur-fade-children space-y-5" noValidate>
      <ErrorAlert message={displayError} />

      {/* Social first: one press beats two fields for anyone who already has Google. */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={oauthLoading}
        variant="outline"
        fullWidth
        leftIcon={<GoogleIcon size={20} />}
      >
        {t('continue_with_google')}
      </Button>

      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-edge-rule" />
        <span className="text-sm text-ink-secondary">{t('or')}</span>
        <div className="flex-1 border-t border-edge-rule" />
      </div>

      <div className="space-y-5">
        <Input
          label={t('email_address')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('email_placeholder')}
          required
          className={FIELD}
        />

        <Input
          label={t('password')}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password_placeholder')}
          required
          className={FIELD}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t('hide_password') : t('show_password')}
              className="rounded-full p-1 text-ink-secondary hover:text-ink-primary"
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink-secondary select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 cursor-pointer accent-brand"
          />
          {t('remember_me')}
        </label>
        <Link
          href={`/${locale}/forgot-password`}
          className="flex min-h-11 items-center text-sm text-ink-secondary hover:text-ink-primary"
        >
          {t('forgot_password')}
        </Link>
      </div>

      <Button type="submit" fullWidth loading={isLoading}>
        {t('sign_in')}
      </Button>

      <p className="text-center text-sm text-ink-secondary">
        {t('dont_have_account')}{' '}
        <Link
          href={`/${locale}/register`}
          className="font-semibold text-ink-primary underline underline-offset-4 decoration-edge-rule hover:decoration-ink-primary"
        >
          {t('sign_up_link')}
        </Link>
      </p>
    </form>
  );
}
