import { BusinessHours } from '@/types/map';
import { API_BASE_URL, getAuthHeaders, handleResponse, apiFetch } from './client';

export interface PendingCafe {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  description: string | null;
  status: 'pending' | 'verified' | 'disputed';
  verification_count: number;
  verified_at: string | null;
  admin_verified: boolean;
  navigator_id: string | null;
  vanguard_ids: Array<{
    user_id: string;
    role: string;
    verified_at: string;
  }>;
  created_at: string;
  updated_at: string | null;
  business_hours?: BusinessHours;
}

export interface PendingCafesResponse {
  cafes: PendingCafe[];
  total_count: number;
}

export interface AdminVerifyResponse {
  message: string;
  cafe: PendingCafe;
}

export interface AdminDeleteResponse {
  message: string;
  cafe_id: string;
}

/** Shared error mapping for admin endpoints */
const ADMIN_ERROR_MAP = {
  403: 'ADMIN_ACCESS_REQUIRED',
  404: 'CAFE_NOT_FOUND',
} as const;

export async function getPendingCafes(): Promise<PendingCafesResponse> {
  const headers = await getAuthHeaders();
  
  const response = await apiFetch(`${API_BASE_URL}/api/v1/cafes/admin/pending`, {
    method: 'GET',
    headers,
  });
  
  return handleResponse<PendingCafesResponse>(response, ADMIN_ERROR_MAP);
}

export async function verifyCafe(cafeId: string): Promise<AdminVerifyResponse> {
  const headers = await getAuthHeaders();
  
  const response = await apiFetch(`${API_BASE_URL}/api/v1/cafes/admin/${cafeId}/verify`, {
    method: 'POST',
    headers,
  });
  
  return handleResponse<AdminVerifyResponse>(response, ADMIN_ERROR_MAP);
}

export async function deleteCafe(cafeId: string): Promise<AdminDeleteResponse> {
  const headers = await getAuthHeaders();
  
  const response = await apiFetch(`${API_BASE_URL}/api/v1/cafes/admin/${cafeId}`, {
    method: 'DELETE',
    headers,
  });
  
  return handleResponse<AdminDeleteResponse>(response, ADMIN_ERROR_MAP);
}

export interface CafeUpdateData {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  business_hours?: BusinessHours;
}

export interface AdminUpdateResponse {
  message: string;
  cafe: PendingCafe;
}

export async function updateCafe(cafeId: string, data: CafeUpdateData): Promise<AdminUpdateResponse> {
  const headers = await getAuthHeaders();
  
  const response = await apiFetch(`${API_BASE_URL}/api/v1/cafes/admin/${cafeId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  
  return handleResponse<AdminUpdateResponse>(response, ADMIN_ERROR_MAP);
}
