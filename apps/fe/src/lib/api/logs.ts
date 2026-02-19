import { CoffeeLog, CafeLogsResponse, LogFormData } from '@/types/api';
import { API_BASE_URL, getAuthHeaders, handleResponse } from './client';

export async function getCafeLogs(cafeId: string, page: number = 1, pageSize: number = 20): Promise<CafeLogsResponse> {
  const response = await fetch(
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
  
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/logs`, {
    method: 'GET',
    headers,
  });

  return handleResponse<CoffeeLog[]>(response);
}

export async function createLog(cafeId: string, data: LogFormData): Promise<CoffeeLog> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/v1/cafes/${cafeId}/visit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      cafe_id: cafeId,
      ...data,
      photo_urls: data.photo_urls || [],
      confirmed: true,
    }),
  });

  if (!response.ok && response.status === 403) {
    throw new Error('Not authorized to create this log');
  }

  return handleResponse<CoffeeLog>(response);
}

export async function updateLog(visitId: string, data: LogFormData): Promise<CoffeeLog> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/v1/visits/${visitId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      ...data,
      photo_urls: data.photo_urls || [],
    }),
  });

  if (!response.ok && response.status === 403) {
    throw new Error('Not authorized to update this log');
  }

  return handleResponse<CoffeeLog>(response);
}

export async function deleteLog(visitId: string): Promise<void> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/v1/visits/${visitId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Not authorized to delete this log');
    }
    if (response.status === 404) {
      throw new Error('Log not found');
    }
  }

  return handleResponse<void>(response);
}

