'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Input } from '@/shared/ui';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/shared/ui/base/dialog';
import { createClient } from '@/shared/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { deleteCurrentUser } from '@/app/actions/account';
import NavSelect from '@/components/layout/NavSelect';
import PasswordChangeForm from './PasswordChangeForm';
import SetPasswordPrompt from './SetPasswordPrompt';

const LOCALE_NAMES: Record<string, string> = { en: 'English', ko: '한국어' };

// A row-width control, filled by `control-flat` rather than the nav bar's pill; `group`
// stays because the chevron in `NavSelect` reads its rotation off that class.
const DROPDOWN_TRIGGER =
  'control-flat group flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-(--radius-control) px-4 text-base font-normal sm:w-56';

export default function SettingsClient({
  email,
  hasPassword,
  linkedProvider,
}: {
  email: string;
  hasPassword: boolean;
  linkedProvider: string | null;
}) {
  const t = useTranslations('settings');
  const locale = useLocale();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [busy, setBusy] = useState<'signout' | 'delete' | null>(null);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [deleted, setDeleted] = useState(false);

  async function signOut() {
    setBusy('signout');
    setError('');
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      window.location.replace(`/${locale}`);
    } catch {
      setError(t('sign_out_error'));
      setBusy(null);
    }
  }

  async function deleteAccount(event: React.FormEvent) {
    event.preventDefault();
    if (confirmation !== 'DELETE' || busy) return;
    setBusy('delete');
    setError('');
    try {
      await deleteCurrentUser(confirmation);
    } catch {
      setError(t('delete_error'));
      setBusy(null);
      return;
    }
    // The account is already gone. A local sign-out failure must not offer deletion again.
    setDeleted(true);
    try { await createClient().auth.signOut({ scope: 'local' }); } catch { /* Auth deletion already succeeded. */ } finally { setBusy(null); }
  }

  const row = 'flex min-h-12 items-center justify-between gap-4 py-4 text-ink-primary hover:underline active:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink-primary';

  return (
    <div className="divide-y divide-edge-rule rounded-(--radius-card) border border-edge-rule bg-surface-raised px-6 text-ink-primary sm:px-8">
      <section aria-labelledby="preferences-title" className="grid gap-6 py-10 md:grid-cols-[1fr_2fr] md:gap-12">
        <div>
          <h2 id="preferences-title" className="font-sans text-2xl">{t('app_preferences')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{t('preferences_description')}</p>
        </div>
        <div className="min-w-0 space-y-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <span>{t('theme')}</span>
            <NavSelect
              ariaLabel={t('theme')}
              label={t(`themes.${currentTheme.name}`)}
              value={currentTheme.name}
              onChange={setTheme}
              options={availableThemes.map(theme => ({ value: theme.name, label: t(`themes.${theme.name}`) }))}
              triggerClassName={DROPDOWN_TRIGGER}
              panelClassName="w-(--anchor-width)"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <span>{t('language')}</span>
            <NavSelect
              ariaLabel={t('language')}
              label={LOCALE_NAMES[locale] ?? locale.toUpperCase()}
              value={locale}
              onChange={next => { if (next !== locale) window.location.href = `/${next}/settings`; }}
              options={Object.entries(LOCALE_NAMES).map(([value, label]) => ({ value, label }))}
              triggerClassName={DROPDOWN_TRIGGER}
              panelClassName="w-(--anchor-width)"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="account-title" className="grid gap-6 py-10 md:grid-cols-[1fr_2fr] md:gap-12">
        <div>
          <h2 id="account-title" className="font-sans text-2xl">{t('account')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{t('account_description')}</p>
        </div>
        <div className="min-w-0 divide-y divide-edge-subtle">
          <div className="pb-4">
            <p className="text-sm text-ink-secondary">{t('signed_in_as')}</p>
            <p className="mt-1 break-all">{email}</p>
          </div>
          <Link href={`/${locale}/profile`} className={row}>{t('profile_settings')}<ArrowUpRight aria-hidden className="size-4 shrink-0" /></Link>
          <div>
            {hasPassword ? <>
              <button type="button" onClick={() => setShowPasswordForm(!showPasswordForm)} aria-expanded={showPasswordForm} aria-controls="settings-password" className={`${row} w-full text-left`}>
                {t('change_password')}{showPasswordForm ? <ChevronDown aria-hidden className="size-4 shrink-0" /> : <ChevronRight aria-hidden className="size-4 shrink-0" />}
              </button>
              <div id="settings-password" hidden={!showPasswordForm} className="pb-5">
                {showPasswordForm && <PasswordChangeForm onSuccess={() => setShowPasswordForm(false)} onCancel={() => setShowPasswordForm(false)} />}
              </div>
            </> : <SetPasswordPrompt email={email} provider={linkedProvider ?? 'provider'} />}
          </div>
          <div className="pt-4">
            <Button variant="danger" onClick={signOut} loading={busy === 'signout'} disabled={busy !== null}>{t('sign_out')}</Button>
            {error && !deleteOpen && <p role="alert" className="mt-3 text-sm">{error}</p>}
          </div>
        </div>
      </section>

      <section aria-labelledby="privacy-title" className="grid gap-6 py-10 md:grid-cols-[1fr_2fr] md:gap-12">
        <div>
          <h2 id="privacy-title" className="font-sans text-2xl">{t('privacy_help')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{t('privacy_description')}</p>
        </div>
        <div className="min-w-0 divide-y divide-edge-subtle">
          <Link href={`/${locale}/my-logs`} className={row}>{t('manage_logs')}<ArrowUpRight aria-hidden className="size-4 shrink-0" /></Link>
          <Link href={`/${locale}/privacy`} className={row}>{t('privacy_policy')}<ArrowUpRight aria-hidden className="size-4 shrink-0" /></Link>
          <Link href={`/${locale}/terms`} className={row}>{t('terms_of_service')}<ArrowUpRight aria-hidden className="size-4 shrink-0" /></Link>
        </div>
      </section>

      <section aria-labelledby="delete-title" className="grid gap-6 py-10 md:grid-cols-[1fr_2fr] md:gap-12">
        <h2 id="delete-title" className="font-sans text-2xl">{t('withdrawal')}</h2>
        <div className="min-w-0">
          <p className="mb-5 text-sm leading-relaxed text-ink-secondary">{t('delete_description')}</p>
          <Dialog open={deleteOpen} onOpenChange={open => {
            if (busy === 'delete' || deleted) return;
            setDeleteOpen(open); setConfirmation(''); setError('');
          }}>
            <DialogTrigger render={<Button variant="danger" disabled={busy !== null} />}>{t('withdrawal')}</DialogTrigger>
            <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-(--radius-card) border border-edge-rule bg-surface-page p-6 text-ink-primary sm:max-w-lg motion-reduce:animate-none">
              <DialogTitle className="text-2xl leading-snug">{deleted ? t('delete_success') : t('delete_title')}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-ink-secondary">{deleted ? t('delete_success_description') : t('delete_consequences')}</DialogDescription>
              {deleted ? <Link href={`/${locale}`} className="btn-line inline-flex min-h-12 items-center justify-center px-5">{t('back_home')}</Link> : <form onSubmit={deleteAccount} className="space-y-5">
                <Input label={t('delete_confirmation')} value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="off" spellCheck={false} disabled={busy === 'delete'} className="rounded-(--radius-control) bg-surface-page text-ink-primary shadow-none" />
                {error && <p role="alert" className="text-sm leading-relaxed">{error}</p>}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={busy === 'delete'}>{t('cancel')}</Button>
                  <Button type="submit" variant="danger" loading={busy === 'delete'} disabled={confirmation !== 'DELETE' || busy !== null}>{t('delete_permanently')}</Button>
                </div>
              </form>}
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
}
