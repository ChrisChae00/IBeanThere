/**
 * Admin Reports Feature - Data Layer
 * Repository for admin reports operations.
 */

import { createClient } from '@/shared/lib/supabase/client';
import type {
  AdminReport,
  ReportsFilter,
  ReportsListResult,
  UpdateReportData,
  ReportStatus,
  TargetType,
} from '../domain';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
   * Get current access token from Supabase
   */
  private async getAccessToken(): Promise<string | null> {
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData?.session?.access_token || null;
  }

  /**
   * Fetch reports list with filters (admin only)
   */
  async fetchReports(filter: ReportsFilter): Promise<ReportsListResult> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const params = new URLSearchParams();
    params.set('page', filter.page.toString());
    params.set('page_size', filter.pageSize.toString());
    if (filter.status) {
      params.set('status', filter.status);
    }
    if (filter.targetType) {
      params.set('target_type', filter.targetType);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/reports?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch reports');
    }

    const data: ReportsListApiResponse = await response.json();

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
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch report');
    }

    const data: ReportApiResponse = await response.json();
    return toDomainReport(data);
  }

  /**
   * Update report status and/or admin notes (admin only)
   */
  async updateReport(reportId: string, updateData: UpdateReportData): Promise<AdminReport> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const requestBody: Record<string, unknown> = {};
    if (updateData.status !== undefined) {
      requestBody.status = updateData.status;
    }
    if (updateData.adminNotes !== undefined) {
      requestBody.admin_notes = updateData.adminNotes;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to update report');
    }

    const data: ReportApiResponse = await response.json();
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
