/**
 * Reports API functions for frontend.
 */

import { API_BASE_URL, getAuthHeaders } from './client';

// Report types matching backend
export type ReportType =
  | 'user_inappropriate_name'
  | 'user_inappropriate_avatar'
  | 'user_inappropriate_bio'
  | 'user_spam'
  | 'cafe_incorrect_info'
  | 'cafe_closed'
  | 'cafe_duplicate'
  | 'cafe_new_request'
  | 'review_inappropriate'
  | 'review_spam'
  | 'bug_report'
  | 'feature_request'
  | 'other';

export type TargetType = 'user' | 'cafe' | 'review' | 'website';

export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export interface ReportCreateRequest {
  report_type: ReportType;
  target_type: TargetType;
  target_id?: string;
  target_url?: string;
  description: string;
  image_urls: string[];
}

export interface ReportResponse {
  id: string;
  reporter_id: string;
  report_type: ReportType;
  target_type: TargetType;
  target_id?: string;
  target_url?: string;
  description: string;
  image_urls: string[];
  status: ReportStatus;
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
  reporter_username?: string;
  reporter_display_name?: string;
}

/**
 * Submit a new report
 */
export async function submitReport(
  data: ReportCreateRequest
): Promise<ReportResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error('duplicate_report');
    }
    throw new Error(error.detail || 'Failed to submit report');
  }

  return response.json();
}

/**
 * Upload a report image to Supabase Storage
 */
export async function uploadReportImage(
  file: File,
  userId: string,
  supabaseClient: any
): Promise<string> {
  const REPORTS_BUCKET = 'reports';
  
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
  const { data, error } = await supabaseClient.storage
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
  const { data: urlData } = supabaseClient.storage
    .from(REPORTS_BUCKET)
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}

// Report type labels for UI (will be used with i18n)
export const REPORT_TYPE_CATEGORIES = {
  user: ['user_inappropriate_name', 'user_inappropriate_avatar', 'user_inappropriate_bio', 'user_spam'],
  cafe: ['cafe_incorrect_info', 'cafe_closed', 'cafe_duplicate', 'cafe_new_request'],
  review: ['review_inappropriate', 'review_spam'],
  website: ['bug_report', 'feature_request', 'other'],
} as const;

export function getReportTypesForTarget(targetType: TargetType): ReportType[] {
  return REPORT_TYPE_CATEGORIES[targetType] as unknown as ReportType[];
}
