/**
 * Report Feature - Data Layer
 * Repository for report operations.
 */

import { createClient } from '@/shared/lib/supabase/client';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api/client';
import type { ReportCreateData, Report, ReportType, TargetType } from '../domain';
const REPORTS_BUCKET = 'reports';

// API request/response types (snake_case for API compatibility)
interface ReportCreateRequest {
  report_type: ReportType;
  target_type: TargetType;
  target_id?: string;
  target_url?: string;
  description: string;
  image_urls: string[];
}

interface ReportApiResponse {
  id: string;
  reporter_id: string;
  report_type: ReportType;
  target_type: TargetType;
  target_id?: string;
  target_url?: string;
  description: string;
  image_urls: string[];
  status: string;
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
  reporter_username?: string;
  reporter_display_name?: string;
}

// Transform API response to domain entity
function toDomainReport(response: ReportApiResponse): Report {
  return {
    id: response.id,
    reporterId: response.reporter_id,
    reportType: response.report_type,
    targetType: response.target_type,
    targetId: response.target_id,
    targetUrl: response.target_url,
    description: response.description,
    imageUrls: response.image_urls,
    status: response.status as Report['status'],
    adminNotes: response.admin_notes,
    createdAt: new Date(response.created_at),
    resolvedAt: response.resolved_at ? new Date(response.resolved_at) : undefined,
    reporterUsername: response.reporter_username,
    reporterDisplayName: response.reporter_display_name,
  };
}

export class ReportRepository {
  /**
   * Submit a new report
   */
  async submitReport(data: ReportCreateData): Promise<Report> {
    const headers = await getAuthHeaders();
    const requestBody: ReportCreateRequest = {
      report_type: data.reportType,
      target_type: data.targetType,
      target_id: data.targetId,
      target_url: data.targetUrl,
      description: data.description,
      image_urls: data.imageUrls,
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error('duplicate_report');
      }
      throw new Error(error.detail || 'Failed to submit report');
    }

    const apiResponse: ReportApiResponse = await response.json();
    return toDomainReport(apiResponse);
  }

  /**
   * Upload a report image to Supabase Storage
   */
  async uploadImage(file: File, userId: string): Promise<string> {
    const supabase = createClient();

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please use JPEG, PNG, or WebP.');
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from(REPORTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Report image upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(REPORTS_BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

}

// Singleton instance
let reportRepositoryInstance: ReportRepository | null = null;

export function getReportRepository(): ReportRepository {
  if (!reportRepositoryInstance) {
    reportRepositoryInstance = new ReportRepository();
  }
  return reportRepositoryInstance;
}
