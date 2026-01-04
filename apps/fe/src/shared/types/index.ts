/**
 * Shared Types for Clean Architecture
 */

/**
 * Result type for operations that can fail
 * Used for error handling without throwing exceptions
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async state for data fetching operations
 */
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Pagination info for list responses
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

/**
 * Common entity base with ID
 */
export interface Entity {
  id: string;
}

/**
 * Timestamped entity with created/updated dates
 */
export interface TimestampedEntity extends Entity {
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Coordinates for location-based features
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * API error codes
 */
export type ErrorCode =
  | 'NOT_AUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Structured API error
 */
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Helper to create a success result
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Helper to create a failure result
 */
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error };
}
