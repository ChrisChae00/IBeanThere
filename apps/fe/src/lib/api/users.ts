import { API_BASE_URL, getAuthHeaders, handleResponse } from './client';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  role?: string;
  created_at: string;
  updated_at?: string | null;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: 'GET',
    headers,
  });
  
  return handleResponse<UserResponse>(response);
}

