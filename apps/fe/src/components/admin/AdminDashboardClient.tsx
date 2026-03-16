'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, Coffee } from 'lucide-react';
import PendingCafesList from './PendingCafesList';
import AllCafesList from './AllCafesList';
import { getAdminReportsRepository, ReportsList } from '@/features/admin';

type Tab = 'cafes' | 'reports';
type CafeSubTab = 'pending' | 'all';

export default function AdminDashboardClient() {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<Tab>('cafes');
  const [cafeSubTab, setCafeSubTab] = useState<CafeSubTab>('pending');
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

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
      <div className="flex items-center gap-4 mb-8 border-b border-[var(--color-border)] overflow-x-auto">
        <button
          onClick={() => setActiveTab('cafes')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'cafes'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <Coffee size={18} />
          {t('cafes_tab')}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <AlertCircle size={18} />
          {t('reports.page_title')}
          {pendingReportsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-error)] text-white">
              {pendingReportsCount}
            </span>
          )}
        </button>
      </div>

      {/* Cafes Tab */}
      {activeTab === 'cafes' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
              {t('cafes_tab')}
            </h2>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setCafeSubTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                cafeSubTab === 'pending'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
              }`}
            >
              {t('sub_tab_pending')}
            </button>
            <button
              onClick={() => setCafeSubTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                cafeSubTab === 'all'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
              }`}
            >
              {t('sub_tab_all')}
            </button>
          </div>

          {cafeSubTab === 'pending' && <PendingCafesList />}
          {cafeSubTab === 'all' && <AllCafesList />}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
              {t('reports.page_title')}
            </h2>
            <p className="text-[var(--color-textSecondary)] text-sm">
              {t('reports.page_description')}
            </p>
          </div>
          <ReportsList />
        </div>
      )}
    </div>
  );
}
