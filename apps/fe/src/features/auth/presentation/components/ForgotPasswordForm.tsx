'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getAuthRepository } from '@/features/auth/data/repositories/AuthRepository';
import {
  MailIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ErrorAlert,
  Button,
  Input
} from '@/components/ui';

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

      if (!result.success) {
        // Supabase doesn't reveal if email exists, so we always show success
        // But we can still show generic errors for rate limiting etc.
        if (result.error?.message?.includes('rate')) {
          setError(tErrors('too_many_requests'));
          setIsLoading(false);
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

  // Success state - email sent
  if (isEmailSent) {
    return (
      <div className="space-y-6 motion-fade-in text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-success) 20%, var(--color-cardBackground))' }}>
            <CheckCircleIcon size={32} style={{ color: 'var(--color-success)' }} />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--color-cardText)] mb-2">
            {t('reset_email_sent')}
          </h2>
          <p className="text-[var(--color-cardTextSecondary)]">
            {t('reset_email_sent_subtitle', { email })}
          </p>
        </div>

        <div className="bg-[var(--color-surface)] p-4 rounded-xl text-sm text-[var(--color-cardTextSecondary)] space-y-2">
          <p>{t('check_spam_folder')}</p>
          <p>{t('email_may_take_time')}</p>
        </div>

        {/* Email reminder after countdown */}
        {showEmailReminder && (
          <div className="p-4 rounded-xl text-sm motion-fade-in" style={{ backgroundColor: 'color-mix(in srgb, var(--color-warning) 15%, var(--color-cardBackground))', color: 'color-mix(in srgb, var(--color-warning) 70%, var(--color-cardText))' }}>
            <p className="font-medium mb-2">{t('didnt_receive_email')}</p>
            <p>{t('double_check_email')}</p>
          </div>
        )}

        <div className="space-y-3 pt-4">
          <Button
            onClick={handleResend}
            disabled={!canResend}
            variant="outline"
            fullWidth
          >
            {canResend 
              ? t('resend_email')
              : `${t('resend_email')} (${countdown}s)`
            }
          </Button>

          <Button
            onClick={handleTryDifferentEmail}
            variant="ghost"
            fullWidth
            className="text-[var(--color-primary)]"
          >
            {t('try_different_email')}
          </Button>

          <Link href={`/${locale}/signin`} className="block">
            <Button
              variant="ghost"
              fullWidth
              leftIcon={<ArrowLeftIcon size={18} />}
              className="text-[var(--color-cardTextSecondary)]"
            >
              {t('back_to_login')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Initial state - email input form
  return (
    <form onSubmit={handleSubmit} className="space-y-6 motion-fade-in" noValidate>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-cardText)] mb-2">
          {t('forgot_password_title')}
        </h2>
        <p className="text-[var(--color-cardTextSecondary)]">
          {t('forgot_password_subtitle')}
        </p>
      </div>

      <ErrorAlert message={error} />

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
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isLoading}
        className="mt-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-[var(--color-primary)] text-[var(--color-primaryText)] hover:bg-[var(--color-accent)] hover:text-[var(--color-text)]"
      >
        {t('send_reset_link')}
      </Button>

      <div className="text-center mt-6">
        <Link href={`/${locale}/signin`}>
          <Button
            type="button"
            variant="ghost"
            leftIcon={<ArrowLeftIcon size={18} />}
            className="text-[var(--color-cardTextSecondary)] hover:text-[var(--color-cardText)]"
          >
            {t('back_to_login')}
          </Button>
        </Link>
      </div>
    </form>
  );
}
