'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAdminReports } from '../hooks';
import ReportCard from './ReportCard';
import { LoadingSpinner } from '@/shared/ui';
import type { ReportStatus, TargetType, UpdateReportData } from '../../domain';

interface ReportsListProps {
  initialStatus?: ReportStatus;
}

const STATUS_OPTIONS: Array<{ value: ReportStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const TARGET_TYPE_OPTIONS: Array<{ value: TargetType | 'all'; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'user', label: '👤 User' },
  { value: 'cafe', label: '☕ Cafe' },
  { value: 'review', label: '📝 Review' },
  { value: 'website', label: '🌐 Website' },
];

/**
 * Paginated list of reports with filters.
 */
export default function ReportsList({ initialStatus }: ReportsListProps) {
  const t = useTranslations('admin.reports');
  const {
    reports,
    total,
    page,
    hasMore,
    isLoading,
    error,
    statusFilter,
    targetTypeFilter,
    setStatusFilter,
    setTargetTypeFilter,
    setPage,
    refresh,
    updateReport,
  } = useAdminReports({ initialStatus, pageSize: 20 });

  const handleUpdateStatus = async (reportId: string, data: UpdateReportData) => {
    await updateReport(reportId, data);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-error)] mb-4">{error}</p>
        <button
          onClick={refresh}
          className="text-[var(--color-primary)] hover:underline"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--color-text)]">
            {t('status')}:
          </label>
          <select
            value={statusFilter || 'all'}
            onChange={(e) =>
              setStatusFilter(e.target.value === 'all' ? undefined : (e.target.value as ReportStatus))
            }
            className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target type filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--color-text)]">
            {t('type')}:
          </label>
          <select
            value={targetTypeFilter || 'all'}
            onChange={(e) =>
              setTargetTypeFilter(e.target.value === 'all' ? undefined : (e.target.value as TargetType))
            }
            className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {TARGET_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Total count */}
        <span className="text-sm text-[var(--color-text-secondary)]">
          {t('total_count', { count: total })}
        </span>
      </div>

      {/* Loading state */}
      {isLoading && reports.length === 0 && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && reports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-secondary)]">{t('no_reports')}</p>
        </div>
      )}

      {/* Reports list */}
      <div className="space-y-4">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </div>

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('previous')}
          </button>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {t('page', { page })}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasMore || isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('next')}
          </button>
        </div>
      )}

      {/* Loading overlay for updates */}
      {isLoading && reports.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
}
