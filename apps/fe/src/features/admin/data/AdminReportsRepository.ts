/**
 * Admin Reports Feature - Data Layer
 * Repository for admin reports operations.
 */

import { API_BASE_URL, apiFetch, handleResponse, ApiError } from '@/lib/api/client';
import { createClient } from '@/shared/lib/supabase/client';
import type {
  AdminReport,
  ReportsFilter,
  ReportsListResult,
  UpdateReportData,
  ReportStatus,
  TargetType,
} from '../domain';

// API response types (snake_case)
interface ReportApiResponse {
  id: string;
  reporter_id: string;
  reporter_username?: string;
  reporter_display_name?: string;
  report_type: string;
  target_type: string;
  target_id?: string;
  target_url?: string;
  description: string;
  image_urls: string[];
  status: string;
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
}

interface ReportsListApiResponse {
  reports: ReportApiResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/** Shared error mapping for admin report endpoints */
const ADMIN_REPORT_ERROR_MAP = {
  403: 'ADMIN_ACCESS_REQUIRED',
  404: 'REPORT_NOT_FOUND',
} as const;

// Transform API response to domain entity
function toDomainReport(response: ReportApiResponse): AdminReport {
  return {
    id: response.id,
    reporterId: response.reporter_id,
    reporterUsername: response.reporter_username,
    reporterDisplayName: response.reporter_display_name,
    reportType: response.report_type as AdminReport['reportType'],
    targetType: response.target_type as TargetType,
    targetId: response.target_id,
    targetUrl: response.target_url,
    description: response.description,
    imageUrls: response.image_urls || [],
    status: response.status as ReportStatus,
    adminNotes: response.admin_notes,
    createdAt: new Date(response.created_at),
    resolvedAt: response.resolved_at ? new Date(response.resolved_at) : undefined,
  };
}

export class AdminReportsRepository {
  /**
   * Get auth headers with Bearer token from Supabase
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      throw new ApiError('Authentication required', 401, 'NOT_AUTHENTICATED');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }

  /**
   * Fetch reports list with filters (admin only)
   */
  async fetchReports(filter: ReportsFilter): Promise<ReportsListResult> {
    const headers = await this.getAuthHeaders();

    const params = new URLSearchParams();
    params.set('page', filter.page.toString());
    params.set('page_size', filter.pageSize.toString());
    if (filter.status) {
      params.set('status', filter.status);
    }
    if (filter.targetType) {
      params.set('target_type', filter.targetType);
    }

    const response = await apiFetch(`${API_BASE_URL}/api/v1/reports?${params}`, {
      headers,
    });

    const data = await handleResponse<ReportsListApiResponse>(response, ADMIN_REPORT_ERROR_MAP);

    return {
      reports: data.reports.map(toDomainReport),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
      hasMore: data.has_more,
    };
  }

  /**
   * Get a single report by ID (admin only)
   */
  async getReport(reportId: string): Promise<AdminReport> {
    const headers = await this.getAuthHeaders();

    const response = await apiFetch(`${API_BASE_URL}/api/v1/reports/${reportId}`, {
      headers,
    });

    const data = await handleResponse<ReportApiResponse>(response, ADMIN_REPORT_ERROR_MAP);
    return toDomainReport(data);
  }

  /**
   * Update report status and/or admin notes (admin only)
   */
  async updateReport(reportId: string, updateData: UpdateReportData): Promise<AdminReport> {
    const headers = await this.getAuthHeaders();

    const requestBody: Record<string, unknown> = {};
    if (updateData.status !== undefined) {
      requestBody.status = updateData.status;
    }
    if (updateData.adminNotes !== undefined) {
      requestBody.admin_notes = updateData.adminNotes;
    }

    const response = await apiFetch(`${API_BASE_URL}/api/v1/reports/${reportId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await handleResponse<ReportApiResponse>(response, ADMIN_REPORT_ERROR_MAP);
    return toDomainReport(data);
  }

  /**
   * Get pending reports count for dashboard badge
   */
  async getPendingCount(): Promise<number> {
    try {
      const result = await this.fetchReports({
        status: 'pending',
        page: 1,
        pageSize: 1,
      });
      return result.total;
    } catch {
      return 0;
    }
  }
}

// Singleton instance
let adminReportsRepositoryInstance: AdminReportsRepository | null = null;

export function getAdminReportsRepository(): AdminReportsRepository {
  if (!adminReportsRepositoryInstance) {
    adminReportsRepositoryInstance = new AdminReportsRepository();
  }
  return adminReportsRepositoryInstance;
}
