'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAdminReportsRepository } from '../../data';
import type {
  AdminReport,
  ReportsFilter,
  ReportsListResult,
  UpdateReportData,
  ReportStatus,
  TargetType,
} from '../../domain';

export interface UseAdminReportsOptions {
  initialStatus?: ReportStatus;
  initialTargetType?: TargetType;
  pageSize?: number;
}

export interface UseAdminReportsReturn {
  // Data
  reports: AdminReport[];
  total: number;
  page: number;
  hasMore: boolean;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Filters
  statusFilter: ReportStatus | undefined;
  targetTypeFilter: TargetType | undefined;
  
  // Actions
  setStatusFilter: (status: ReportStatus | undefined) => void;
  setTargetTypeFilter: (targetType: TargetType | undefined) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  updateReport: (reportId: string, data: UpdateReportData) => Promise<AdminReport | null>;
}

/**
 * Hook for managing admin reports list with filtering and pagination.
 */
export function useAdminReports(options: UseAdminReportsOptions = {}): UseAdminReportsReturn {
  const { initialStatus, initialTargetType, pageSize = 20 } = options;
  const repository = useMemo(() => getAdminReportsRepository(), []);

  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<ReportStatus | undefined>(initialStatus);
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetType | undefined>(initialTargetType);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filter: ReportsFilter = {
        status: statusFilter,
        targetType: targetTypeFilter,
        page,
        pageSize,
      };

      const result = await repository.fetchReports(filter);
      
      setReports(result.reports);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      setReports([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [repository, statusFilter, targetTypeFilter, page, pageSize]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Reset page when filters change
  const handleSetStatusFilter = useCallback((status: ReportStatus | undefined) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleSetTargetTypeFilter = useCallback((targetType: TargetType | undefined) => {
    setTargetTypeFilter(targetType);
    setPage(1);
  }, []);

  const updateReport = useCallback(async (
    reportId: string,
    data: UpdateReportData
  ): Promise<AdminReport | null> => {
    try {
      const updatedReport = await repository.updateReport(reportId, data);
      
      // Update in local state
      setReports(prev => prev.map(r => 
        r.id === reportId ? updatedReport : r
      ));
      
      return updatedReport;
    } catch (err) {
      console.error('Failed to update report:', err);
      setError(err instanceof Error ? err.message : 'Failed to update report');
      return null;
    }
  }, [repository]);

  return {
    reports,
    total,
    page,
    hasMore,
    isLoading,
    error,
    statusFilter,
    targetTypeFilter,
    setStatusFilter: handleSetStatusFilter,
    setTargetTypeFilter: handleSetTargetTypeFilter,
    setPage,
    refresh: fetchReports,
    updateReport,
  };
}
