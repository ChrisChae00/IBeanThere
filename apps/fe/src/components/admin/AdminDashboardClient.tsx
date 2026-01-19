'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, Coffee } from 'lucide-react';
import PendingCafesList from './PendingCafesList';
import { getAdminReportsRepository } from '@/features/admin';

type Tab = 'cafes' | 'reports';

export default function AdminDashboardClient() {
  const t = useTranslations('admin');
  const params = useParams();
  const locale = params.locale as string;
  const [activeTab, setActiveTab] = useState<Tab>('cafes');
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  // Fetch pending reports count for badge
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const repository = getAdminReportsRepository();
        const count = await repository.getPendingCount();
        setPendingReportsCount(count);
      } catch {
        // Silently fail - badge just won't show
      }
    };
    fetchCount();
  }, []);

  return (
    <div>
      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-8 border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab('cafes')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cafes'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <Coffee size={18} />
          {t('pending_cafes_title')}
        </button>

        <Link
          href={`/${locale}/admin/reports`}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <AlertCircle size={18} />
          {t('reports.page_title')}
          {pendingReportsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-error)] text-white">
              {pendingReportsCount}
            </span>
          )}
        </Link>
      </div>

      {/* Tab Content */}
      {activeTab === 'cafes' && (
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
      )}
    </div>
  );
}
