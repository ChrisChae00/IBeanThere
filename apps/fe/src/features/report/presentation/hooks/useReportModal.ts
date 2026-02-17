'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getReportRepository } from '../../data';
import type { ReportCreateData, TargetType, ReportType, Report } from '../../domain';

export interface ReportModalState {
  isOpen: boolean;
  targetType: TargetType;
  targetId?: string;
  targetUrl?: string;
  preselectedReportType?: ReportType;
}

export interface UseReportModalReturn {
  modalState: ReportModalState;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  openModal: (params: Omit<ReportModalState, 'isOpen'>) => void;
  closeModal: () => void;
  openUserReport: (userId: string, username: string) => void;
  openCafeReport: (cafeId: string, cafeName: string) => void;
  openReviewReport: (reviewId: string, cafeId: string) => void;
  openFeedbackModal: () => void;
  submitReport: (data: Omit<ReportCreateData, 'targetType' | 'targetId' | 'targetUrl'>) => Promise<Report | null>;
  uploadImage: (file: File) => Promise<string>;
  resetState: () => void;
}

const initialState: ReportModalState = {
  isOpen: false,
  targetType: 'website',
  targetId: undefined,
  targetUrl: undefined,
  preselectedReportType: undefined,
};

/**
 * Hook for managing report modal state and operations.
 * Follows Clean Architecture - uses ReportRepository for data operations.
 */
export function useReportModal(): UseReportModalReturn {
  const { user } = useAuth();
  const repository = useMemo(() => getReportRepository(), []);

  const [modalState, setModalState] = useState<ReportModalState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(false);
  }, []);

  const openModal = useCallback((params: Omit<ReportModalState, 'isOpen'>) => {
    resetState();
    setModalState({
      isOpen: true,
      ...params,
    });
  }, [resetState]);

  const closeModal = useCallback(() => {
    setModalState(initialState);
    resetState();
  }, [resetState]);

  const openUserReport = useCallback((userId: string, username: string) => {
    const targetUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/profile/${username}`
      : `/profile/${username}`;

    openModal({
      targetType: 'user',
      targetId: userId,
      targetUrl,
    });
  }, [openModal]);

  const openCafeReport = useCallback((cafeId: string, cafeName: string) => {
    const targetUrl = typeof window !== 'undefined'
      ? window.location.href
      : `/cafes/${cafeId}`;

    openModal({
      targetType: 'cafe',
      targetId: cafeId,
      targetUrl,
    });
  }, [openModal]);

  const openReviewReport = useCallback((reviewId: string, cafeId: string) => {
    const targetUrl = typeof window !== 'undefined'
      ? `${window.location.href}#review-${reviewId}`
      : `/cafes/${cafeId}#review-${reviewId}`;

    openModal({
      targetType: 'review',
      targetId: reviewId,
      targetUrl,
    });
  }, [openModal]);

  const openFeedbackModal = useCallback(() => {
    const targetUrl = typeof window !== 'undefined'
      ? window.location.href
      : '/';

    openModal({
      targetType: 'website',
      targetUrl,
    });
  }, [openModal]);

  const submitReport = useCallback(async (
    data: Omit<ReportCreateData, 'targetType' | 'targetId' | 'targetUrl'>
  ): Promise<Report | null> => {
    if (!user) {
      setError('login_required');
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fullData: ReportCreateData = {
        ...data,
        targetType: modalState.targetType,
        targetId: modalState.targetId,
        targetUrl: modalState.targetUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
      };

      const report = await repository.submitReport(fullData);
      setSuccess(true);
      return report;
    } catch (err) {
      console.error('Report submission error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('submit_failed');
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, repository, modalState]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('login_required');
    }
    return repository.uploadImage(file, user.id);
  }, [user, repository]);

  return {
    modalState,
    isSubmitting,
    error,
    success,
    openModal,
    closeModal,
    openUserReport,
    openCafeReport,
    openReviewReport,
    openFeedbackModal,
    submitReport,
    uploadImage,
    resetState,
  };
}
