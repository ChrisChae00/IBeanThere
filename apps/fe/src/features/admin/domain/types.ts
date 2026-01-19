/**
 * Admin Reports Feature - Domain Layer
 * Type definitions for admin reports management.
 */

export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
export type TargetType = 'user' | 'cafe' | 'review' | 'website';

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

export interface AdminReport {
  id: string;
  reporterId: string;
  reporterUsername?: string;
  reporterDisplayName?: string;
  reportType: ReportType;
  targetType: TargetType;
  targetId?: string;
  targetUrl?: string;
  description: string;
  imageUrls: string[];
  status: ReportStatus;
  adminNotes?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ReportsFilter {
  status?: ReportStatus;
  targetType?: TargetType;
  page: number;
  pageSize: number;
}

export interface ReportsListResult {
  reports: AdminReport[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface UpdateReportData {
  status?: ReportStatus;
  adminNotes?: string;
}

// Status display utilities
export const STATUS_COLORS: Record<ReportStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-800' },
  resolved: { bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const TARGET_TYPE_ICONS: Record<TargetType, string> = {
  user: '👤',
  cafe: '☕',
  review: '📝',
  website: '🌐',
};
