'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useOAuthSignIn } from '@/hooks/useOAuthSignIn';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, GoogleIcon, FacebookIcon, ErrorAlert } from '@/components/ui';

interface SignupFormProps {
  locale: string;
}

export default function SignupForm({ locale }: SignupFormProps) {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();
  const { isLoading: oauthLoading, error: oauthError, signInWithOAuth } = useOAuthSignIn();
  const { translateError } = useErrorTranslator();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'email') {
      setError('');
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): { isValid: boolean; error?: string } => {
    // 1. Allow only letters, numbers, underscores (_), and hyphens (-)
    const allowedCharsRegex = /^[a-zA-Z0-9_-]+$/;
    if (!allowedCharsRegex.test(username)) {
      return { isValid: false, error: 'username_invalid_chars' };
    }

    // 2. Length between 3 and 20 characters
    if (username.length < 3 || username.length > 20) {
      return { isValid: false, error: 'username_length' };
    }

    // 3. Start with a letter
    const startsWithLetterRegex = /^[a-zA-Z]/;
    if (!startsWithLetterRegex.test(username)) {
      return { isValid: false, error: 'username_start_letter' };
    }

    // 4. Prohibit reserved words
    const reservedWords = ['admin', 'root', 'api', 'www', 'test', 'user', 'guest', 'null', 'undefined'];
    if (reservedWords.includes(username.toLowerCase())) {
      return { isValid: false, error: 'username_reserved' };
    }

    // 5. Prohibit only numbers
    const onlyNumbersRegex = /^\d+$/;
    if (onlyNumbersRegex.test(username)) {
      return { isValid: false, error: 'username_only_numbers' };
    }

    // 6. Prohibit overly simple patterns (e.g., aaa, abc, 123, etc.)
    const simplePatternRegex = /^(.)\1+$|^abc$|^qwe$|^asd$|^zxc$/i;
    if (simplePatternRegex.test(username)) {
      return { isValid: false, error: 'username_too_simple' };
    }

    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      setError(tErrors(usernameValidation.error!));
      setIsLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError(tErrors('invalid_email'));
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(tErrors('passwords_not_match'));
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError(tErrors('terms_required'));
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
        },
      });

      if (authError) {
        setError(translateError(authError.message));
        setIsLoading(false);
        return;
      }

      // After successful Supabase Auth signup, register user profile in backend
      // Note: Trigger automatically creates basic profile in public.users
      // This API call is just for updating username/display_name
      if (authData.user && authData.session?.access_token) {
        const accessToken = authData.session.access_token;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Use fetch with keepalive for reliable delivery even during page unload
        // This ensures the request completes even if user navigates away
        try {
          const payload = JSON.stringify({
            username: formData.username,
            display_name: formData.username,
          });
          
          // Use fetch with keepalive to ensure request completes during redirect
          fetch(`${apiUrl}/api/v1/users/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: payload,
            keepalive: true, // Critical: allows request to complete even during page unload
          }).then(response => {
            if (response.ok) {
              if (process.env.NODE_ENV === 'development') {
                console.info('Profile API call succeeded - username and display_name updated');
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                response.json().then(errorData => {
                  console.warn('Profile API call failed (non-critical):', errorData.detail || 'Unknown error');
                }).catch(() => {
                  console.warn('Profile API call failed (non-critical):', response.status, response.statusText);
                });
              }
            }
          }).catch(error => {
            // Network errors are expected if page unloads - silently ignore
            if (process.env.NODE_ENV === 'development') {
              console.warn('Profile API call error (non-critical - may be due to page navigation):', error.message || error);
            }
          });
        } catch (error) {
          // Silently ignore - trigger handles basic profile
          if (process.env.NODE_ENV === 'development') {
            console.warn('Profile API call setup error (non-critical):', error);
          }
        }
      }

      // Redirect immediately after auth signup succeeds
      // keepalive: true ensures the API call completes even during redirect
      window.location.href = `/${locale}`;
    } catch (err) {
      setError(tErrors('unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signInWithOAuth('google', locale);
  };

  const handleFacebookSignUp = () => {
    signInWithOAuth('facebook', locale);
  };

  const displayError = error || oauthError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <ErrorAlert message={displayError} />

      {/* Username Field */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {t('username')}
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="w-full px-4 py-4 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] min-h-[44px]"
          placeholder={t('username_placeholder')}
          required
        />
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          {t('username_hint')}
        </p>
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {t('email_address')}
        </label>
        <div className="relative">
          <MailIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
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
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-12 pr-12 py-4 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] min-h-[44px]"
            placeholder={t('create_password_placeholder')}
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

      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {t('confirm_password')}
        </label>
        <div className="relative">
          <LockIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full pl-12 pr-12 py-4 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] min-h-[44px]"
            placeholder={t('confirm_password_placeholder')}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] mt-1"
          required
        />
        <label className="text-sm text-[var(--color-text-secondary)]">
          {t('terms_agreement')}{' '}
          <span className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] underline font-medium cursor-pointer">
            {t('terms_of_service')}
          </span>{' '}
          {t('and')}{' '}
          <span className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] underline font-medium cursor-pointer">
            {t('privacy_policy')}
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[var(--color-primary)] text-[var(--color-background)] py-4 rounded-xl font-semibold text-lg hover:bg-[var(--color-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '⏳' : t('create_account')}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[var(--color-background)] text-[var(--color-text-secondary)]">
            {t('or_sign_up_with')}
          </span>
        </div>
      </div>

      {/* Social Sign Up */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={oauthLoading}
          className="flex items-center justify-center py-3 px-4 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon size={20} className="mr-2" />
          <span className="text-[var(--color-text-secondary)] font-medium">{t('google')}</span>
        </button>
        <button
          type="button"
          onClick={handleFacebookSignUp}
          disabled={oauthLoading}
          className="flex items-center justify-center py-3 px-4 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FacebookIcon size={20} className="mr-2" />
          <span className="text-[var(--color-text-secondary)] font-medium">{t('facebook')}</span>
        </button>
      </div>

      {/* Sign In Link */}
      <div className="text-center mt-8">
        <p className="text-[var(--color-text-secondary)]">
          {t('already_have_account')}{' '}
          <Link
            href={`/${locale}/signin`}
            className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-semibold underline"
          >
            {t('sign_in_link')}
          </Link>
        </p>
      </div>
    </form>
  );
}
