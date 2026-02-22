/**
 * Shared API client utilities.
 *
 * Single source of truth for:
 *  - API base URL
 *  - Auth header retrieval
 *  - Generic response handler with consistent error handling
 *  - Network-safe fetch wrapper
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Error Types ────────────────────────────────────────────

/**
 * Structured API error with HTTP status and optional error code.
 * Thrown by `handleResponse` and `apiFetch` for consistent error handling.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status code (0 for network errors) */
    public readonly status: number,
    /** Optional machine-readable error code (e.g. 'NOT_AUTHENTICATED') */
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Check if the error is a network connectivity issue */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  /** Check if the error is an authentication issue */
  get isAuthError(): boolean {
    return this.status === 401 || this.code === "NOT_AUTHENTICATED";
  }
}

/**
 * Check if an error is an authentication error.
 * Works with both `ApiError` (via `.isAuthError` / `.code`) and
 * legacy `Error` (via `.message === 'NOT_AUTHENTICATED'`).
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) return error.isAuthError;
  if (error instanceof Error) return error.message === 'NOT_AUTHENTICATED';
  return false;
}

/**
 * Extract the machine-readable error code from an error.
 * Returns `ApiError.code`, or falls back to `Error.message` for legacy errors.
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof ApiError) return error.code ?? error.message;
  if (error instanceof Error) return error.message;
  return 'UNKNOWN_ERROR';
}

// ─── Auth Headers ───────────────────────────────────────────

/**
 * Build request headers with a valid Bearer token.
 *
 * @param requireAuth
 *   - `true` (default): throws `ApiError` when no session exists.
 *   - `false`: returns headers without Authorization when unauthenticated
 *     (useful for endpoints that behave differently for logged-in users).
 */
export async function getAuthHeaders(
  requireAuth: boolean = true,
): Promise<HeadersInit> {
  const { createClient } = await import("@/shared/lib/supabase/client");
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  } else if (requireAuth) {
    throw new ApiError("Authentication required", 401, "NOT_AUTHENTICATED");
  }

  return headers;
}

// ─── Response Handler ───────────────────────────────────────

/**
 * Parse error body from a failed response.
 * Uses `detail → message` fallback chain for consistent error extraction
 * across different API error response formats.
 */
async function parseErrorBody(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.detail || body.message || `HTTP error ${response.status}`;
  } catch {
    return `HTTP error ${response.status}`;
  }
}

/**
 * Generic response handler that:
 *  - Checks the optional `errorMap` for status-specific error messages first.
 *  - Throws on 401 with a consistent error code.
 *  - Parses the JSON body using `detail → message` fallback chain.
 *  - Returns `undefined` for 204 No Content.
 *
 * @param response - The fetch Response object
 * @param errorMap - Optional mapping of HTTP status codes → error messages.
 *                   Use this for domain-specific error messages (e.g. 403 → 'ADMIN_ACCESS_REQUIRED').
 */
export async function handleResponse<T>(
  response: Response,
  errorMap?: Record<number, string>,
): Promise<T> {
  if (!response.ok) {
    // Check errorMap first for status-specific handling
    if (errorMap?.[response.status]) {
      throw new ApiError(
        errorMap[response.status],
        response.status,
        errorMap[response.status],
      );
    }

    // Default 401 handling
    if (response.status === 401) {
      throw new ApiError("Authentication required", 401, "NOT_AUTHENTICATED");
    }

    // Parse error body with detail → message fallback
    const message = await parseErrorBody(response);
    throw new ApiError(message, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ─── Fetch Wrapper ──────────────────────────────────────────

/**
 * Network-safe fetch wrapper that catches `TypeError` (network failures,
 * DNS errors, CORS issues) and wraps them as `ApiError` with status 0.
 *
 * Use this instead of bare `fetch()` to ensure network errors are handled
 * consistently across all API functions.
 *
 * @param input - URL or Request object
 * @param init - Fetch options
 * @returns The fetch Response object
 * @throws ApiError with status 0 for network errors
 */
export async function apiFetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    // TypeError is thrown for network failures (DNS, CORS, offline, etc.)
    if (error instanceof TypeError) {
      throw new ApiError(
        "Network error. Please check your connection and try again.",
        0,
        "NETWORK_ERROR",
      );
    }
    throw error;
  }
}
