'use client';

import { useState, useCallback } from 'react';
import { TargetType, ReportType } from '@/lib/api/reports';

export interface ReportModalState {
  isOpen: boolean;
  targetType: TargetType;
  targetId?: string;
  targetUrl?: string;
  preselectedReportType?: ReportType;
}

export interface UseReportModalReturn {
  modalState: ReportModalState;
  openModal: (params: Omit<ReportModalState, 'isOpen'>) => void;
  closeModal: () => void;
  openUserReport: (userId: string, username: string) => void;
  openCafeReport: (cafeId: string, cafeName: string) => void;
  openReviewReport: (reviewId: string, cafeId: string) => void;
  openFeedbackModal: () => void;
}

const initialState: ReportModalState = {
  isOpen: false,
  targetType: 'website',
  targetId: undefined,
  targetUrl: undefined,
  preselectedReportType: undefined,
};

/**
 * Hook for managing report modal state.
 * Provides convenience methods for opening the modal with pre-filled context.
 */
export function useReportModal(): UseReportModalReturn {
  const [modalState, setModalState] = useState<ReportModalState>(initialState);

  const openModal = useCallback((params: Omit<ReportModalState, 'isOpen'>) => {
    setModalState({
      isOpen: true,
      ...params,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(initialState);
  }, []);

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

  return {
    modalState,
    openModal,
    closeModal,
    openUserReport,
    openCafeReport,
    openReviewReport,
    openFeedbackModal,
  };
}
