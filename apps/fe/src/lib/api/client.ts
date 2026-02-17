/**
 * Shared API client utilities.
 *
 * Single source of truth for:
 *  - API base URL
 *  - Auth header retrieval
 *  - Generic response handler
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Build request headers with a valid Bearer token.
 *
 * @param requireAuth
 *   - `true` (default): throws `NOT_AUTHENTICATED` when no session exists.
 *   - `false`: returns headers without Authorization when unauthenticated
 *     (useful for endpoints that behave differently for logged-in users).
 */
export async function getAuthHeaders(
  requireAuth: boolean = true
): Promise<HeadersInit> {
  const { createClient } = await import('@/shared/lib/supabase/client');
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  } else if (requireAuth) {
    throw new Error('NOT_AUTHENTICATED');
  }

  return headers;
}

/**
 * Generic response handler that:
 *  - Throws on 401 with a consistent error code.
 *  - Parses the JSON body (or returns `undefined` for 204 No Content).
 *  - Surfaces the server's `detail` message when available.
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('NOT_AUTHENTICATED');
    }
    const error = await response
      .json()
      .catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
