/**
 * Report Feature - Main Entry Point
 * 
 * Clean Architecture structure:
 * - domain: Type definitions and business logic
 * - data: Repository implementation for API/storage
 * - presentation: React hooks and UI components
 */

// Domain exports
export * from './domain';

// Data exports
export { getReportRepository } from './data';
export type { ReportRepository } from './data';

// Presentation exports
export { 
  useReportModal,
  ReportModal,
  ReportButton,
  ImageUploader,
} from './presentation';

export type {
  ReportModalState,
  UseReportModalReturn,
} from './presentation';
