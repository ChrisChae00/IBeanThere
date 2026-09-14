'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getAuthRepository } from '@/features/auth/data/repositories/AuthRepository';
import { Button } from '@/shared/ui';

/*
  For an account with no password: `hasPassword` is false, so `PasswordChangeForm`'s
  "current password" step has nothing to verify against. Rather than a second form that
  calls `updateUser` straight from the browser, this sends the same reset-link mail the
  sign-in page's "forgot password" already does -- reviewed, rate-limited, and proven.
  The one difference from that flow: the reader is already authenticated as themself, so
  the confirmation can name their own email outright instead of hedging with "if this
  address has an account."
*/
export default function SetPasswordPrompt({ email, provider }: { email: string; provider: string }) {
  const t = useTranslations('settings');
  const tErrors = useTranslations('errors');
  const locale = useLocale();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function send() {
    setStatus('sending');
    setError('');
    const redirectUrl = `${window.location.origin}/${locale}/reset-password`;
    const result = await getAuthRepository().sendPasswordResetEmail(email, redirectUrl);
    if (!result.success) {
      setError(/request rate limit/i.test(result.error.message) ? tErrors('too_many_requests') : tErrors('unknown'));
      setStatus('error');
      return;
    }
    setStatus('sent');
  }

  const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);

  if (status === 'sent') {
    return (
      <p className="py-4 text-sm leading-relaxed text-ink-secondary">
        {t('set_password_sent', { email })}
      </p>
    );
  }

  return (
    <div className="space-y-3 py-4">
      <p className="text-sm leading-relaxed text-ink-secondary">
        {t('provider_password', { provider: providerLabel })}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={send} loading={status === 'sending'}>
        {t('send_reset_link')}
      </Button>
      {error && <p role="alert" className="text-sm text-ink-primary">{error}</p>}
    </div>
  );
}
