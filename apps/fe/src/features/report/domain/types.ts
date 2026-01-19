/**
 * Report Feature - Domain Layer
 * Type definitions for the report feature.
 */

// Report Types
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

// Domain Entities
export interface Report {
  id: string;
  reporterId: string;
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
  reporterUsername?: string;
  reporterDisplayName?: string;
}

export interface ReportCreateData {
  reportType: ReportType;
  targetType: TargetType;
  targetId?: string;
  targetUrl?: string;
  description: string;
  imageUrls: string[];
}

// Report type categories by target
export const REPORT_TYPE_CATEGORIES: Record<TargetType, ReportType[]> = {
  user: ['user_inappropriate_name', 'user_inappropriate_avatar', 'user_inappropriate_bio', 'user_spam'],
  cafe: ['cafe_incorrect_info', 'cafe_closed', 'cafe_duplicate', 'cafe_new_request'],
  review: ['review_inappropriate', 'review_spam'],
  website: ['bug_report', 'feature_request', 'other'],
};

export function getReportTypesForTarget(targetType: TargetType): ReportType[] {
  return REPORT_TYPE_CATEGORIES[targetType];
}
