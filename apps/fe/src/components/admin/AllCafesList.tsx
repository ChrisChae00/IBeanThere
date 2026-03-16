'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getAllCafes, verifyCafe, deleteCafe, updateCafe, PendingCafe, CafeUpdateData, AllCafesParams } from '@/lib/api/admin';
import { getErrorCode } from '@/lib/api/client';
import { ErrorAlert } from '@/shared/ui';
import PendingCafeCard, { EditCafeData } from './PendingCafeCard';

const PAGE_SIZE = 20;

type StatusFilter = 'all' | 'pending' | 'verified' | 'disputed';

export default function AllCafesList() {
  const t = useTranslations('admin');
  const [cafes, setCafes] = useState<PendingCafe[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);

  const translateError = (errorCode: string): string => {
    const errorMap: Record<string, string> = {
      'ADMIN_ACCESS_REQUIRED': t('error_admin_required'),
      'NOT_AUTHENTICATED': t('error_not_authenticated'),
      'CAFE_NOT_FOUND': t('error_cafe_not_found'),
      'FETCH_ALL_CAFES_FAILED': t('error_fetching_all'),
      'VERIFY_CAFE_FAILED': t('error_verifying'),
      'DELETE_CAFE_FAILED': t('error_deleting'),
      'UPDATE_CAFE_FAILED': t('error_updating'),
    };
    return errorMap[errorCode] || t('error_unknown');
  };

  const fetchCafes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: AllCafesParams = { page, pageSize: PAGE_SIZE };
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await getAllCafes(params);
      setCafes(response.cafes);
      setTotalCount(response.total_count);
    } catch (err) {
      console.error('Error fetching all cafes:', err);
      const errorMessage = getErrorCode(err);
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleVerify = (cafeId: string) => {
    setShowVerifyModal(true);
    setSelectedCafeId(cafeId);
  };

  const handleDelete = (cafeId: string) => {
    setShowDeleteModal(true);
    setSelectedCafeId(cafeId);
  };

  const handleEdit = async (cafeId: string, data: EditCafeData) => {
    setEditingId(cafeId);
    setActionError(null);
    try {
      await updateCafe(cafeId, data as CafeUpdateData);
      await fetchCafes();
    } catch (err) {
      console.error('Error updating cafe:', err);
      const errorMessage = getErrorCode(err);
      setActionError(translateError(errorMessage));
    } finally {
      setEditingId(null);
    }
  };

  const confirmVerify = async () => {
    if (!selectedCafeId) return;
    setVerifyingId(selectedCafeId);
    setActionError(null);
    setShowVerifyModal(false);
    try {
      await verifyCafe(selectedCafeId);
      await fetchCafes();
    } catch (err) {
      console.error('Error verifying cafe:', err);
      const errorMessage = getErrorCode(err);
      setActionError(translateError(errorMessage));
    } finally {
      setVerifyingId(null);
      setSelectedCafeId(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedCafeId) return;
    setDeletingId(selectedCafeId);
    setActionError(null);
    setShowDeleteModal(false);
    try {
      await deleteCafe(selectedCafeId);
      await fetchCafes();
    } catch (err) {
      console.error('Error deleting cafe:', err);
      const errorMessage = getErrorCode(err);
      setActionError(translateError(errorMessage));
    } finally {
      setDeletingId(null);
      setSelectedCafeId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasMore = page < totalPages;

  if (isLoading && cafes.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-[var(--color-textSecondary)]">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg p-4">
        <p className="text-[var(--color-error)]">{error}</p>
        <button
          onClick={fetchCafes}
          className="mt-2 px-4 py-2 bg-[var(--color-error)] hover:opacity-90 text-white rounded-lg min-h-[44px] transition-opacity"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--color-text)]">
            {t('status_filter')}:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
            className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="all">{t('status_all')}</option>
            <option value="pending">{t('status_pending')}</option>
            <option value="verified">{t('status_verified')}</option>
            <option value="disputed">{t('status_disputed')}</option>
          </select>
        </div>
        <span className="text-sm text-[var(--color-textSecondary)]">
          {t('page_info', { page, total: totalPages || 1 })}
        </span>
      </div>

      {actionError && (
        <div className="mb-4">
          <ErrorAlert message={actionError} />
        </div>
      )}

      {!isLoading && cafes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-textSecondary)] text-lg">{t('no_cafes')}</p>
        </div>
      ) : (
        <div
          className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]"
          style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
        >
          <div className="space-y-4">
            {cafes.map((cafe) => (
              <PendingCafeCard
                key={cafe.id}
                cafe={cafe}
                onVerify={handleVerify}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isVerifying={verifyingId === cafe.id}
                isDeleting={deletingId === cafe.id}
                isEditing={editingId === cafe.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {t('previous')}
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasMore || isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {t('next')}
          </button>
        </div>
      )}

      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface)] rounded-lg p-6 max-w-md w-full mx-4 border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              {t('confirm_verify_title')}
            </h3>
            <p className="text-[var(--color-textSecondary)] mb-6">
              {t('confirm_verify_message')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowVerifyModal(false); setSelectedCafeId(null); }}
                className="flex-1 px-4 py-2 bg-[var(--color-surface)] hover:opacity-80 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg min-h-[44px] transition-opacity"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmVerify}
                className="flex-1 px-4 py-2 bg-[var(--color-success)] hover:opacity-90 text-white rounded-lg min-h-[44px] transition-opacity"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface)] rounded-lg p-6 max-w-md w-full mx-4 border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              {t('confirm_delete_title')}
            </h3>
            <p className="text-[var(--color-textSecondary)] mb-6">
              {t('confirm_delete_message')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedCafeId(null); }}
                className="flex-1 px-4 py-2 bg-[var(--color-surface)] hover:opacity-80 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg min-h-[44px] transition-opacity"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-[var(--color-error)] hover:opacity-90 text-white rounded-lg min-h-[44px] transition-opacity"
              >
                {t('confirm_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
