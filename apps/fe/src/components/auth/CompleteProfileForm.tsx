'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';
import { createClient } from '@/lib/supabase/client';
import {
  ErrorAlert,
  Button,
  Input
} from '@/components/ui';

interface CompleteProfileFormProps {
  locale: string;
  returnUrl?: string; // Where to redirect after success
}

export default function CompleteProfileForm({ locale, returnUrl = '/' }: CompleteProfileFormProps) {
  const t = useTranslations('auth'); // Reuse auth translations
  const tErrors = useTranslations('errors');
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const supabase = createClient();
  const { translateError } = useErrorTranslator();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
    const reservedWords = [
      'admin', 'root', 'api', 'www', 'test', 'user', 'guest', 'null', 'undefined',
      'support', 'help', 'ibeanthere', 'system', 'manager', 'official', 'operator'
    ];
    if (reservedWords.includes(username.toLowerCase())) {
      return { isValid: false, error: 'username_reserved' };
    }

    // 5. Prohibit only numbers
    const onlyNumbersRegex = /^\d+$/;
    if (onlyNumbersRegex.test(username)) {
      return { isValid: false, error: 'username_only_numbers' };
    }

    // 6. Prohibit overly simple patterns
    const simplePatternRegex = /^(.)\1+$|^abc$|^qwe$|^asd$|^zxc$/i;
    if (simplePatternRegex.test(username)) {
      return { isValid: false, error: 'username_too_simple' };
    }

    return { isValid: true };
  };

  const validation = validateUsername(formData.username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validation.isValid) {
      setError(tErrors(validation.error!));
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError(tErrors('terms_required'));
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError(translateError('Session expired. Please sign in again.'));
        setIsLoading(false);
        return;
      }

      const accessToken = session.access_token;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const payload = JSON.stringify({
        username: formData.username,
        display_name: formData.displayName || formData.username,
        terms_accepted: true,
        privacy_accepted: true,
        consent_version: '1.0.0'
      });

      const response = await fetch(`${apiUrl}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      // CRITICAL STEP: Update Supabase Auth Metadata locally!
      // The backend updates the database, but Supabase Auth Session (JWT) needs to be refreshed
      // with the new username so that useAuth hook knows the profile is complete.
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          display_name: formData.displayName || formData.username
        }
      });

      if (updateError) {
        console.warn('Failed to update Supabase Auth metadata:', updateError.message);
        // We continue anyway because the DB entry is correct.
        // A page reload (window.location.href) usually forces a session refresh.
      } else {
        // Force session refresh to be sure
        await supabase.auth.refreshSession();
      }

      // Success - Redirect
      // Handle relative paths carefully with locale
      const redirectPath = returnUrl.startsWith('/') ? returnUrl : `/${returnUrl}`;
      // Ensure we don't redirect back to onboarding/complete-profile loops if returnUrl was somehow set to that
      const finalUrl = redirectPath.includes('complete-profile') ? `/${locale}` : redirectPath;
      
      window.location.href = finalUrl;

    } catch (err: any) {
      setError(translateError(err.message || 'unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <ErrorAlert message={error} />

      <div className="space-y-4">
        <Input
          name="username"
          label={t('username')}
          placeholder={t('username_placeholder')}
          value={formData.username}
          onChange={handleInputChange}
          error={validation.error && formData.username.length > 0 ? tErrors(validation.error) : undefined}
          helperText={t('username_hint')}
          required
        />
        
        <Input
          name="displayName"
          label={t('display_name')}
          placeholder={t('display_name_placeholder')}
          value={formData.displayName}
          onChange={handleInputChange}
          required
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

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white transition-colors"
          disabled={isLoading || (!validation.isValid && formData.username.length > 0) || !agreeToTerms}
          loading={isLoading}
        >
          {t('complete_setup')}
        </Button>
      </div>
    </form>
  );
}
