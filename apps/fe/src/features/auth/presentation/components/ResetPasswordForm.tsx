'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';
import { validatePassword, passwordsMatch, calculatePasswordStrength } from '@/features/auth/domain';
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  ErrorAlert,
  Button,
  Input,
  LoadingSpinner
} from '@/components/ui';

interface ResetPasswordFormProps {
  locale: string;
}

export function ResetPasswordForm({ locale }: ResetPasswordFormProps) {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [hasValidSession, setHasValidSession] = useState(false);

  const supabase = createClient();

  // Check for session or handle recovery token from URL
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check if user already has a session (came from recovery link)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setHasValidSession(true);
          setIsCheckingSession(false);
          return;
        }

        // Check for error in URL params (e.g., expired token)
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          if (errorDescription?.includes('expired')) {
            setError(tErrors('reset_link_expired'));
          } else {
            setError(errorDescription || tErrors('unknown'));
          }
          setIsCheckingSession(false);
          return;
        }

        // Check URL hash for recovery token (Supabase sends tokens in hash fragment)
        if (typeof window !== 'undefined') {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');

          if (accessToken && type === 'recovery') {
            // Set the session from the recovery tokens
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              setError(tErrors('reset_link_expired'));
            } else {
              setHasValidSession(true);
              // Clean up URL hash
              window.history.replaceState(null, '', window.location.pathname);
            }
          } else {
            // No session and no recovery token
            setError(tErrors('reset_link_expired'));
          }
        }
      } catch (err) {
        setError(tErrors('unknown'));
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [supabase, searchParams, tErrors]);

  // Calculate password strength
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 25) return 'var(--color-error)';
    if (passwordStrength < 50) return 'var(--color-warning)';
    if (passwordStrength < 75) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    const validation = validatePassword(password);
    if (!validation.isValid) {
      const errorKey = validation.errors[0];
      setError(tErrors(errorKey));
      setIsLoading(false);
      return;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      setError(tErrors('passwords_not_match'));
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || tErrors('unknown'));
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      // Sign out and redirect to login after 3 seconds
      // (User should log in with new password)
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push(`/${locale}/signin`);
      }, 3000);
    } catch (err) {
      setError(tErrors('unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <LoadingSpinner />
        <p className="text-[var(--color-cardTextSecondary)]">
          Verifying your reset link...
        </p>
      </div>
    );
  }

  // No valid session - show error
  if (!hasValidSession && error) {
    return (
      <div className="space-y-6 text-center">
        <ErrorAlert message={error} />
        <Link href={`/${locale}/forgot-password`}>
          <Button variant="primary" fullWidth>
            Request New Reset Link
          </Button>
        </Link>
        <Link href={`/${locale}/signin`}>
          <Button variant="ghost" fullWidth>
            {t('back_to_login')}
          </Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-6 motion-fade-in text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-success) 20%, var(--color-cardBackground))' }}>
            <CheckCircleIcon size={32} style={{ color: 'var(--color-success)' }} />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--color-cardText)] mb-2">
            {t('password_updated')}
          </h2>
          <p className="text-[var(--color-cardTextSecondary)]">
            {t('password_updated_subtitle')}
          </p>
        </div>

        <p className="text-sm text-[var(--color-cardTextSecondary)]">
          Redirecting to login...
        </p>

        <Link href={`/${locale}/signin`}>
          <Button fullWidth variant="primary">
            {t('back_to_login')}
          </Button>
        </Link>
      </div>
    );
  }

  // Form state
  return (
    <form onSubmit={handleSubmit} className="space-y-6 motion-fade-in" noValidate>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-cardText)] mb-2">
          {t('reset_password_title')}
        </h2>
        <p className="text-[var(--color-cardTextSecondary)]">
          {t('reset_password_subtitle')}
        </p>
      </div>

      <ErrorAlert message={error} />

      <div className="space-y-5">
        <div>
          <Input
            label={t('new_password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('new_password_placeholder')}
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
          
          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-cardTextSecondary)]">Password strength</span>
                <span className="font-medium" style={{ color: getStrengthColor() }}>
                  {getStrengthLabel()}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor() }}
                />
              </div>
            </div>
          )}
        </div>

        <Input
          label={t('confirm_new_password')}
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t('confirm_new_password_placeholder')}
          icon={<LockIcon size={20} className="text-[var(--color-cardTextSecondary)]" />}
          required
          className="bg-[var(--color-background)]/50 backdrop-blur-sm"
          endAdornment={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[var(--color-cardTextSecondary)] hover:text-[var(--color-cardText)] transition p-1 hover:bg-[var(--color-surface)]/50 rounded-full"
            >
              {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          }
        />

        {/* Password match indicator */}
        {confirmPassword.length > 0 && (
          <p className="text-xs" style={{ color: passwordsMatch(password, confirmPassword) ? 'var(--color-success)' : 'var(--color-error)' }}>
            {passwordsMatch(password, confirmPassword) ? '✓ Passwords match' : '✕ Passwords do not match'}
          </p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isLoading}
        disabled={!password || !confirmPassword || !passwordsMatch(password, confirmPassword)}
        className="mt-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-[var(--color-primary)] text-[var(--color-primaryText)] hover:bg-[var(--color-accent)] hover:text-[var(--color-text)]"
      >
        {t('update_password')}
      </Button>
    </form>
  );
}
