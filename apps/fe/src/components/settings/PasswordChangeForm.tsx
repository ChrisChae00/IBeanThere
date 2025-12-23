'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/shared/ui';
import { Button } from '@/shared/ui';

interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PasswordChangeForm({ onSuccess, onCancel }: PasswordChangeFormProps) {
  const t = useTranslations('settings');
  const tErrors = useTranslations('errors');
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError(tErrors('weak_password'));
      return;
    }

    setIsLoading(true);

    try {
      // First, get current user email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        setError(t('password_change_error'));
        setIsLoading(false);
        return;
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError(t('current_password_incorrect'));
        setIsLoading(false);
        return;
      }

      // Current password verified, now update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(t('password_change_error'));
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch {
      setError(t('password_change_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
          {t('current_password')}
        </label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading || success}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
          {t('new_password')}
        </label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading || success}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
          {t('confirm_new_password')}
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading || success}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}

      {success && (
        <p className="text-sm text-[var(--color-success)]">{t('password_changed')}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isLoading || success || !currentPassword || !newPassword || !confirmPassword}
          className="flex-1"
        >
          {isLoading ? '...' : t('change_password')}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}
