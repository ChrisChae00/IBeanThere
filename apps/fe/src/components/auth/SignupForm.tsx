'use client';

import { useState, useEffect } from 'react';
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

  // Async validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);

  const supabase = createClient();
  const { isLoading: oauthLoading, error: oauthError, signInWithOAuth } = useOAuthSignIn();
  const { translateError } = useErrorTranslator();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'email') {
      setError('');
    }
    if (name === 'username') {
      setUsernameError('');
      setIsUsernameAvailable(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): { isValid: boolean; error?: string } => {
    // 1. Allow only lowercase letters, numbers, underscores (_), and hyphens (-) - Instagram style
    const allowedCharsRegex = /^[a-z0-9_-]+$/;
    if (!allowedCharsRegex.test(username)) {
      return { isValid: false, error: 'username_lowercase_only' };
    }

    // 2. Length between 3 and 20 characters
    if (username.length < 3 || username.length > 20) {
      return { isValid: false, error: 'username_length' };
    }

    // 3. Start with a letter
    const startsWithLetterRegex = /^[a-z]/;
    if (!startsWithLetterRegex.test(username)) {
      return { isValid: false, error: 'username_start_letter' };
    }

    // 4. Prohibit reserved words
    const reservedWords = [
      'admin', 'admin_account', 'root', 'api', 'www', 'test', 'user', 'guest', 'null', 'undefined',
      'support', 'help', 'ibeanthere', 'system', 'manager', 'official', 'operator'
    ];
    if (reservedWords.includes(username)) {
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

  // Debounced username check
  useEffect(() => {
    const checkUsername = async () => {
      const username = formData.username;
      if (!username || username.length < 3) return;
      
      const validation = validateUsername(username);
      if (!validation.isValid) return;

      setIsCheckingUsername(true);
      setIsUsernameAvailable(false);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/users/check-username/${username}`);
        if (response.ok) {
           const data = await response.json();
           if (!data.available) {
             setUsernameError('username_taken');
             setIsUsernameAvailable(false);
           } else {
             setIsUsernameAvailable(true);
           }
        }
      } catch (err) {
        console.error('Failed to check username availability', err);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [formData.username]);


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

    if (usernameError) {
        setError(tErrors(usernameError));
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
            // Optimistically set terms_accepted true for local check
            terms_accepted: true,
            privacy_accepted: true
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
            terms_accepted: true,
            privacy_accepted: true,
            consent_version: '1.0.0'
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
                   // If error is forbidden/bad request (like admin reserved), we might want to know.
                   // But since we are redirecting, we can't show it easily unless we wait.
                   // Since we validated async before submit, this should be rare.
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



  const displayError = error || oauthError;

  // Helpers for validation display
  const usernameValidation = validateUsername(formData.username);
  let usernameHelperText = t('username_hint');
  let usernameInputError = undefined;

  if (usernameValidation.error && formData.username.length > 0) {
      usernameInputError = tErrors(usernameValidation.error);
  } else if (usernameError) {
      usernameInputError = tErrors(usernameError);
  }

  if (isCheckingUsername) {
      usernameHelperText = t('checking_availability') || 'Checking availability...';
  } else if (isUsernameAvailable && !usernameInputError) {
      usernameHelperText = t('username_available') || 'Username is available';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <ErrorAlert message={displayError} />

      <Input
        label={t('username')}
        name="username"
        value={formData.username}
        onChange={handleInputChange}
        placeholder={t('username_placeholder')}
        helperText={usernameHelperText}
        helperTextClassName={isUsernameAvailable && !usernameInputError ? 'text-[var(--color-success)]' : ''}
        error={usernameInputError}
        required
      />

      <Input
        label={t('email_address')}
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder={t('email_placeholder')}
        icon={<MailIcon size={20} className="text-[var(--color-cardTextSecondary)]" />}
        required
      />

      <Input
        label={t('password')}
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder={t('create_password_placeholder')}
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

      <Input
        label={t('confirm_password')}
        type={showConfirmPassword ? 'text' : 'password'}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        placeholder={t('confirm_password_placeholder')}
        icon={<LockIcon size={20} className="text-[var(--color-cardTextSecondary)]" />}
        required
        endAdornment={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-[var(--color-cardTextSecondary)] hover:text-[var(--color-cardText)] transition"
          >
            {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        }
      />

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
          <Link href={`/${locale}/terms`} className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] underline font-medium transition-colors">
            {t('terms_of_service')}
          </Link>{' '}
          {t('and')}{' '}
          <Link href={`/${locale}/privacy`} className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] underline font-medium transition-colors">
            {t('privacy_policy')}
          </Link>
        </label>
      </div>

      {/* Submit Button */}
      <Button type="submit" fullWidth size="lg" loading={isLoading} disabled={isCheckingUsername || !!usernameInputError}>
        {t('create_account')}
      </Button>

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
      <div className="w-full">
        <Button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={oauthLoading}
          variant="outline"
          fullWidth
          leftIcon={<GoogleIcon size={20} />}
          className="hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {t('google')}
        </Button>
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
