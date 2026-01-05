'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/client';
import { useOAuthSignIn } from '@/hooks/useOAuthSignIn';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,

  ErrorAlert,
  Button,
  Input
} from '@/components/ui';

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
    <form onSubmit={handleSubmit} className="space-y-6 motion-fade-in" noValidate>
      <ErrorAlert message={displayError} />

      <div className="space-y-5">
        <Input
          label={t('email_address')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('email_placeholder')}
          icon={<MailIcon size={20} className="text-[var(--color-cardTextSecondary)]" />}
          required
          className="bg-[var(--color-background)]/50 backdrop-blur-sm"
        />

        <Input
          label={t('password')}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password_placeholder')}
          icon={<LockIcon size={20} className="text-[var(--color-cardTextSecondary)]" />}
          required
          className="bg-[var(--color-background)]/50 backdrop-blur-sm"
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[var(--color-cardTextSecondary)] hover:text-[var(--color-cardText)] transition p-1 hover:bg-[var(--color-surface)]/50 rounded-full"
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          }
        />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center min-h-[24px] cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] transition-all cursor-pointer accent-[var(--color-primary)] bg-[var(--color-surface)]"
            />
          </div>
          <span className="ml-2 text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors select-none font-medium">
            {t('remember_me')}
          </span>
        </label>
        <Link
          href={`/${locale}/forgot-password`}
          className="px-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
        >
          {t('forgot_password')}
        </Link>
      </div>

      <Button 
        type="submit" 
        fullWidth 
        size="lg" 
        loading={isLoading} 
        className="mt-2 text-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-[var(--color-primary)] text-[var(--color-primaryText)] hover:bg-[var(--color-accent)] hover:text-[var(--color-text)]"
      >
        {t('sign_in')}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 border-t border-[var(--color-border)]"></div>
        <span className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider text-xs px-2">
          {t('or_continue_with')}
        </span>
        <div className="flex-1 border-t border-[var(--color-border)]"></div>
      </div>

      {/* Social Sign In */}
      <div className="w-full">
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={oauthLoading}
          variant="outline"
          fullWidth
          leftIcon={<GoogleIcon size={20} />}
          className="bg-white/80 hover:bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-black active:scale-[0.99] transition-all duration-200 shadow-sm hover:shadow-md font-medium h-[56px] hover:font-bold"
        >
          {t('google')}
        </Button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center mt-8">
        <p className="text-[var(--color-text-secondary)] text-sm">
          {t('dont_have_account')}{' '}
          <Link
            href={`/${locale}/register`}
            className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-bold hover:underline decoration-2 underline-offset-4 transition-all"
          >
            {t('sign_up_link')}
          </Link>
        </p>
      </div>
    </form>
  );
}
