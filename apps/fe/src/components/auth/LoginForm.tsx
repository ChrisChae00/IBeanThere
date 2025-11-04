'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useOAuthSignIn } from '@/hooks/useOAuthSignIn';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, GoogleIcon, FacebookIcon, ErrorAlert } from '@/components/ui';

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

  const handleFacebookSignIn = () => {
    signInWithOAuth('facebook', locale);
  };

  const displayError = error || oauthError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <ErrorAlert message={displayError} />

      {/* Email Field */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {t('email_address')}
        </label>
        <div className="relative">
          <MailIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] min-h-[44px]"
            placeholder={t('email_placeholder')}
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {t('password')}
        </label>
        <div className="relative">
          <LockIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-4 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] min-h-[44px]"
            placeholder={t('password_placeholder')}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
      </div>

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
        <button
          type="button"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-medium min-h-[44px] flex items-center"
        >
          {t('forgot_password')}
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[var(--color-primary)] text-[var(--color-background)] py-4 rounded-xl font-semibold text-lg hover:bg-[var(--color-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '⏳' : t('sign_in')}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[var(--color-background)] text-[var(--color-text-secondary)]">
            {t('or_continue_with')}
          </span>
        </div>
      </div>

      {/* Social Sign In */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={oauthLoading}
          className="flex items-center justify-center py-3 px-4 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon size={20} className="mr-2" />
          <span className="text-[var(--color-text-secondary)] font-medium">{t('google')}</span>
        </button>
        <button
          type="button"
          onClick={handleFacebookSignIn}
          disabled={oauthLoading}
          className="flex items-center justify-center py-3 px-4 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FacebookIcon size={20} className="mr-2" />
          <span className="text-[var(--color-text-secondary)] font-medium">{t('facebook')}</span>
        </button>
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
