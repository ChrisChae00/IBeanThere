import { API_BASE_URL, getAuthHeaders, handleResponse } from './client';
import { UserResponse } from '@/types/api';

// Re-export for consumers that import from this module
export type { UserResponse } from '@/types/api';

export async function getCurrentUser(): Promise<UserResponse> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: 'GET',
    headers,
  });
  
  return handleResponse<UserResponse>(response);
}

