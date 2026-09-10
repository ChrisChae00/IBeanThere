'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import { createClient } from '@/shared/lib/supabase/client';
import { validatePassword, passwordsMatch, calculatePasswordStrength } from '@/features/auth/domain';
import { cn } from '@/lib/cn';
import { AuthHeading } from './AuthLayout';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  ErrorAlert,
  Button,
  Input,
  LoadingSpinner
} from '@/components/ui';

/* Pill fields, matching the sign-in and sign-up forms. */
const FIELD = 'rounded-full pl-5';

/* The bar carries the colour; the word beside it stays in ink (design-language §4). */
function strengthLevel(strength: number) {
  if (strength < 25) return { key: 'strength_weak', bar: 'bg-state-danger' } as const;
  if (strength < 50) return { key: 'strength_fair', bar: 'bg-state-warning' } as const;
  if (strength < 75) return { key: 'strength_good', bar: 'bg-state-warning' } as const;
  return { key: 'strength_strong', bar: 'bg-state-success' } as const;
}

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

  const backToSignIn = (
    <p className="text-center">
      <Link
        href={`/${locale}/signin`}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeftIcon size={16} />
        {t('back_to_login')}
      </Link>
    </p>
  );

  if (isCheckingSession) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoadingSpinner />
        <p className="text-sm text-ink-secondary">{t('verifying_reset_link')}</p>
      </div>
    );
  }

  if (!hasValidSession && error) {
    return (
      <div className="blur-fade-children space-y-5">
        <AuthHeading title={t('reset_password_title')} />
        <ErrorAlert message={error} />
        <Button fullWidth onClick={() => router.push(`/${locale}/forgot-password`)}>
          {t('request_new_link')}
        </Button>
        {backToSignIn}
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="blur-fade-children space-y-5">
        <CircleCheck aria-hidden className="mx-auto size-10 text-ink-primary" strokeWidth={1.5} />
        <AuthHeading title={t('password_updated')} subtitle={t('password_updated_subtitle')} />
        <p className="text-center text-sm text-ink-secondary">{t('redirecting_to_login')}</p>
        {backToSignIn}
      </div>
    );
  }

  const strength = strengthLevel(passwordStrength);
  const matches = passwordsMatch(password, confirmPassword);

  return (
    <>
      <AuthHeading title={t('reset_password_title')} subtitle={t('reset_password_subtitle')} />

      <form onSubmit={handleSubmit} className="blur-fade-children space-y-5" noValidate>
        <ErrorAlert message={error} />

        <div className="space-y-5">
          <div>
            <Input
              label={t('new_password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('new_password_placeholder')}
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

            {password.length > 0 && (
              <div className="mt-2 px-5">
                <div className="h-1 overflow-hidden rounded-full bg-edge-rule">
                  <div
                    className={cn('h-full transition-all duration-300', strength.bar)}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-secondary">
                  {t('password_strength', { level: t(strength.key) })}
                </p>
              </div>
            )}
          </div>

          <div>
            <Input
              label={t('confirm_new_password')}
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirm_new_password_placeholder')}
              required
              className={FIELD}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t('hide_password') : t('show_password')}
                  className="rounded-full p-1 text-ink-secondary hover:text-ink-primary"
                >
                  {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              }
            />

            {confirmPassword.length > 0 && (
              <p className="mt-2 flex items-center gap-2 px-5 text-xs text-ink-secondary">
                <span
                  aria-hidden
                  className={cn('size-1.5 rounded-full', matches ? 'bg-state-success' : 'bg-state-danger')}
                />
                {matches ? t('passwords_match') : tErrors('passwords_not_match')}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={!password || !confirmPassword || !matches}
        >
          {t('update_password')}
        </Button>
      </form>
    </>
  );
}
