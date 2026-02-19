import { CoffeeLog, CafeLogsResponse, LogFormData } from '@/types/api';
import { API_BASE_URL, getAuthHeaders, handleResponse, apiFetch } from './client';

/** Status-specific error messages for log operations */
const LOG_ERROR_MAP = {
  403: 'Not authorized to perform this action',
  404: 'Log not found',
} as const;

export async function getCafeLogs(cafeId: string, page: number = 1, pageSize: number = 20): Promise<CafeLogsResponse> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/cafes/${cafeId}/logs?page=${page}&page_size=${pageSize}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return handleResponse<CafeLogsResponse>(response);
}

export async function getMyLogs(): Promise<CoffeeLog[]> {
  const headers = await getAuthHeaders();
  
  const response = await apiFetch(`${API_BASE_URL}/api/v1/users/me/logs`, {
    method: 'GET',
    headers,
  });

  return handleResponse<CoffeeLog[]>(response);
}

export async function createLog(cafeId: string, data: LogFormData): Promise<CoffeeLog> {
  const headers = await getAuthHeaders();
  
  const response = await apiFetch(`${API_BASE_URL}/api/v1/cafes/${cafeId}/visit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      cafe_id: cafeId,
      ...data,
      photo_urls: data.photo_urls || [],
      confirmed: true,
    }),
  });

  return handleResponse<CoffeeLog>(response, LOG_ERROR_MAP);
}

export async function updateLog(visitId: string, data: LogFormData): Promise<CoffeeLog> {
  const headers = await getAuthHeaders();
  
  const response = await apiFetch(`${API_BASE_URL}/api/v1/visits/${visitId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      ...data,
      photo_urls: data.photo_urls || [],
    }),
  });

  return handleResponse<CoffeeLog>(response, LOG_ERROR_MAP);
}

export async function deleteLog(visitId: string): Promise<void> {
  const headers = await getAuthHeaders();
  
  const response = await apiFetch(`${API_BASE_URL}/api/v1/visits/${visitId}`, {
    method: 'DELETE',
    headers,
  });

  return handleResponse<void>(response, LOG_ERROR_MAP);
}
