'use client';

import { useTranslations } from 'next-intl';
import PendingCafesList from './PendingCafesList';

export default function AdminDashboardClient() {
  const t = useTranslations('admin');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
          {t('pending_cafes_title')}
        </h2>
        <p className="text-[var(--color-textSecondary)] text-sm">
          {t('pending_cafes_description')}
        </p>
      </div>
      <PendingCafesList />
    </div>
  );
}

