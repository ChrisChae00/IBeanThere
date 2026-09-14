import { API_BASE_URL, getAuthHeaders, handleResponse, apiFetch } from './client';
import { TasteTag, TrustedUser, UserPublicResponse, UserResponse } from '@/types/api';

// Re-export for consumers that import from this module
export type { UserPublicResponse, UserResponse } from '@/types/api';

export async function getCurrentUser(): Promise<UserResponse> {
  const headers = await getAuthHeaders();
  
  const response = await apiFetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: 'GET',
    headers,
  });
  
  return handleResponse<UserResponse>(response);
}

export interface UserUpdate {
  display_name: string;
  bio: string | null;
  avatar_url?: string;
  taste_tags: TasteTag[];
}

/**
 * Save the signed-in user's profile. Returns the saved record, so a caller can put it
 * straight into state instead of asking for it again.
 */
export async function updateCurrentUser(update: UserUpdate): Promise<UserResponse> {
  const headers = await getAuthHeaders();

  const response = await apiFetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(update),
  });

  return handleResponse<UserResponse>(response);
}

export async function searchUsers(query: string, limit = 5): Promise<UserPublicResponse[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/users/search?query=${encodeURIComponent(query)}&limit=${limit}`,
  );

  return handleResponse<UserPublicResponse[]>(response);
}

/*
  Public, and better with a token. The endpoint takes optional auth so a signed-out
  reader still gets the profile; a signed-in one additionally gets `is_trusted_by_me`,
  which is how the page knows whether to offer Follow or Following. Sent unauthenticated
  it answers `false` for everyone, which reads as "you follow nobody".
*/
export async function getPublicProfile(username: string): Promise<UserPublicResponse> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/users/profile-by-username/${encodeURIComponent(username)}`,
    { headers: await getAuthHeaders() },
  );

  return handleResponse<UserPublicResponse>(response);
}

/** Who trusts this person, and who this person trusts. Public, like the profile. */
export type TrustDirection = 'followers' | 'following';

export async function getTrustList(
  username: string,
  direction: TrustDirection,
): Promise<UserPublicResponse[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/users/${encodeURIComponent(username)}/${direction}`,
  );

  return handleResponse<UserPublicResponse[]>(response);
}

/**
 * The people whose taste the signed-in user trusts.
 *
 * There is no "is this one person trusted" endpoint, so a profile page reads the whole
 * list and looks in it. Cheap while the list is short; a dedicated endpoint is the fix
 * if it stops being.
 */
export async function getTasteMates(): Promise<TrustedUser[]> {
  const headers = await getAuthHeaders();

  const response = await apiFetch(`${API_BASE_URL}/api/v1/community/taste-mates`, {
    method: 'GET',
    headers,
  });

  return handleResponse<TrustedUser[]>(response);
}

/** Trust or untrust one person's taste. Throws `ApiError` so callers can show their own message. */
export async function setTrust(username: string, trusted: boolean): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/users/${encodeURIComponent(username)}/trust`,
    {
      method: trusted ? 'POST' : 'DELETE',
      headers,
    },
  );

  await handleResponse<void>(response);
}
