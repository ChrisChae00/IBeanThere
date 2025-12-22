'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
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

export default function LoginForm({ locale }: LoginFormProps) {
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
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <ErrorAlert message={displayError} />

      <Input
        label={t('email_address')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('email_placeholder')}
        icon={<MailIcon size={20} className="text-[var(--color-cardTextSecondary)]" />}
        required
      />

      <Input
        label={t('password')}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('password_placeholder')}
        icon={<LockIcon size={20} className="text-[var(--color-cardTextSecondary)]" />}
        required
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[var(--color-cardTextSecondary)] hover:text-[var(--color-cardText)] transition"
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        }
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center min-h-[44px]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)]"
          />
          <span className="ml-2 text-sm text-[var(--color-text-secondary)]">{t('remember_me')}</span>
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-0 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          {t('forgot_password')}
        </Button>
      </div>

      <Button type="submit" fullWidth size="lg" loading={isLoading}>
        {t('sign_in')}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 border-t border-[var(--color-border)]"></div>
        <span className="text-sm text-[var(--color-text-secondary)]">
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
          className="hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {t('google')}
        </Button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center mt-8">
        <p className="text-[var(--color-text-secondary)]">
          {t('dont_have_account')}{' '}
          <Link
            href={`/${locale}/register`}
            className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-semibold underline"
          >
            {t('sign_up_link')}
          </Link>
        </p>
      </div>
    </form>
  );
}
