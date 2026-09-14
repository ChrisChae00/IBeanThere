'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { getAuthRepository } from '@/features/auth/data/repositories/AuthRepository';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';
import { AuthHeading } from './AuthLayout';
import { ArrowLeftIcon, ErrorAlert, Button, Input } from '@/components/ui';

interface ForgotPasswordFormProps {
  locale: string;
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showEmailReminder, setShowEmailReminder] = useState(false);

  const authRepository = getAuthRepository();
  const { translateError } = useErrorTranslator();

  // Countdown timer for resend button
  useEffect(() => {
    if (isEmailSent && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setCanResend(true);
      setShowEmailReminder(true);
    }
  }, [isEmailSent, countdown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getResetRedirectUrl = useCallback(() => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || '';
    return `${baseUrl}/${locale}/reset-password`;
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateEmail(email)) {
      setError(tErrors('invalid_email'));
      setIsLoading(false);
      return;
    }

    try {
      const result = await authRepository.sendPasswordResetEmail(
        email,
        getResetRedirectUrl()
      );

      /*
        Supabase answers an address with no account with success and sends nothing. The
        errors it can return -- a per-account resend cooldown, a recipient the default
        mailer refuses, a send that failed -- therefore only happen for addresses that
        have an account, so printing them tells anyone which emails are registered.

        Production shows the neutral "sent" screen for them (its copy says "if there is
        an account"); the operator's view is the Supabase auth log. Development prints
        the error, because a swallowed one is how a mail that never left looked exactly
        like one that did. Only the per-IP request limit is shown everywhere: it trips
        before the account lookup, so it is the same answer for every address. The email
        send limit ("email rate limit exceeded") trips after it, and is account-specific.
      */
      if (!result.success) {
        const message = result.error?.message ?? '';
        if (/request rate limit/i.test(message)) {
          setError(tErrors('too_many_requests'));
          return;
        }
        if (process.env.NODE_ENV === 'development') {
          setError(translateError(message));
          return;
        }
      }

      setIsEmailSent(true);
      setCountdown(60);
      setCanResend(false);
      setShowEmailReminder(false);
    } catch (err) {
      setError(tErrors('unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(60);
    setShowEmailReminder(false);
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleTryDifferentEmail = () => {
    setIsEmailSent(false);
    setEmail('');
    setError('');
    setCountdown(60);
    setCanResend(false);
    setShowEmailReminder(false);
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

  if (isEmailSent) {
    return (
      <div className="blur-fade-children space-y-5">
        <MailCheck aria-hidden className="mx-auto size-10 text-ink-primary" strokeWidth={1.5} />
        <AuthHeading
          title={t('reset_email_sent')}
          subtitle={t('reset_email_sent_subtitle', { email })}
        />

        <ErrorAlert message={error} />

        <div className="space-y-1 rounded-card border border-edge-rule p-4 text-sm text-ink-secondary break-keep">
          {showEmailReminder ? (
            <>
              <p className="font-medium text-ink-primary">{t('didnt_receive_email')}</p>
              <p>{t('double_check_email')}</p>
            </>
          ) : (
            <>
              <p>{t('check_spam_folder')}</p>
              <p>{t('email_may_take_time')}</p>
            </>
          )}
        </div>

        <Button onClick={handleResend} disabled={!canResend} loading={isLoading} variant="outline" fullWidth>
          {canResend ? t('resend_email') : `${t('resend_email')} (${countdown}s)`}
        </Button>

        <p className="text-center">
          <button
            type="button"
            onClick={handleTryDifferentEmail}
            className="min-h-11 text-sm font-semibold text-ink-primary underline underline-offset-4 decoration-edge-rule hover:decoration-ink-primary"
          >
            {t('try_different_email')}
          </button>
        </p>

        {backToSignIn}
      </div>
    );
  }

  return (
    <>
      <AuthHeading title={t('forgot_password_title')} subtitle={t('forgot_password_subtitle')} />

      <form onSubmit={handleSubmit} className="blur-fade-children space-y-5" noValidate>
        <ErrorAlert message={error} />

        <Input
          label={t('email_address')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('email_placeholder')}
          required
          className="rounded-full pl-5"
        />

        <Button type="submit" fullWidth loading={isLoading}>
          {t('send_reset_link')}
        </Button>

        {backToSignIn}
      </form>
    </>
  );
}
