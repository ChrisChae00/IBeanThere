'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getPendingCafes, verifyCafe, deleteCafe, PendingCafe } from '@/lib/api/admin';
import { ErrorAlert } from '@/shared/ui';
import PendingCafeCard from './PendingCafeCard';

export default function PendingCafesList() {
  const t = useTranslations('admin');
  const [cafes, setCafes] = useState<PendingCafe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);

  const translateError = (errorCode: string): string => {
    const errorMap: Record<string, string> = {
      'ADMIN_ACCESS_REQUIRED': t('error_admin_required'),
      'NOT_AUTHENTICATED': t('error_not_authenticated'),
      'CAFE_NOT_FOUND': t('error_cafe_not_found'),
      'FETCH_PENDING_CAFES_FAILED': t('error_fetching'),
      'VERIFY_CAFE_FAILED': t('error_verifying'),
      'DELETE_CAFE_FAILED': t('error_deleting'),
    };
    return errorMap[errorCode] || t('error_unknown');
  };

  const fetchPendingCafes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPendingCafes();
      setCafes(response.cafes);
    } catch (err) {
      console.error('Error fetching pending cafes:', err);
      const errorMessage = err instanceof Error ? err.message : 'FETCH_PENDING_CAFES_FAILED';
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCafes();
  }, []);

  const handleVerify = async (cafeId: string) => {
    setShowVerifyModal(true);
    setSelectedCafeId(cafeId);
  };

  const handleDelete = async (cafeId: string) => {
    setShowDeleteModal(true);
    setSelectedCafeId(cafeId);
  };

  const confirmVerify = async () => {
    if (!selectedCafeId) return;

    setVerifyingId(selectedCafeId);
    setActionError(null);
    setShowVerifyModal(false);

    try {
      await verifyCafe(selectedCafeId);
      await fetchPendingCafes();
    } catch (err) {
      console.error('Error verifying cafe:', err);
      const errorMessage = err instanceof Error ? err.message : 'VERIFY_CAFE_FAILED';
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
      await fetchPendingCafes();
    } catch (err) {
      console.error('Error deleting cafe:', err);
      const errorMessage = err instanceof Error ? err.message : 'DELETE_CAFE_FAILED';
      setActionError(translateError(errorMessage));
    } finally {
      setDeletingId(null);
      setSelectedCafeId(null);
    }
  };

  if (isLoading) {
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
          onClick={fetchPendingCafes}
          className="mt-2 px-4 py-2 bg-[var(--color-error)] hover:opacity-90 text-white rounded-lg min-h-[44px] transition-opacity"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (cafes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-textSecondary)] text-lg">
          {t('no_pending_cafes')}
        </p>
      </div>
    );
  }

  return (
    <>
      {actionError && (
        <div className="mb-4">
          <ErrorAlert message={actionError} />
        </div>
      )}
      <div 
        className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]"
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="space-y-4">
          {cafes.map((cafe) => (
            <PendingCafeCard
              key={cafe.id}
              cafe={cafe}
              onVerify={handleVerify}
              onDelete={handleDelete}
              isVerifying={verifyingId === cafe.id}
              isDeleting={deletingId === cafe.id}
            />
          ))}
        </div>
      </div>

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
                onClick={() => {
                  setShowVerifyModal(false);
                  setSelectedCafeId(null);
                }}
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
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCafeId(null);
                }}
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

