import { CoffeeLog, CafeLogsResponse, LogFormData } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

export async function getCafeLogs(cafeId: string, page: number = 1, pageSize: number = 20): Promise<CafeLogsResponse> {
  const response = await fetch(
    `${API_URL}/api/v1/cafes/${cafeId}/logs?page=${page}&page_size=${pageSize}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch cafe logs: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getMyLogs(): Promise<CoffeeLog[]> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/api/v1/users/me/logs`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(`Failed to fetch my logs: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function createLog(cafeId: string, data: LogFormData): Promise<CoffeeLog> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/api/v1/cafes/${cafeId}/visit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      cafe_id: cafeId,
      rating: data.rating,
      comment: data.comment,
      photo_urls: data.photo_urls || [],
      is_public: data.is_public,
      anonymous: data.anonymous,
      coffee_type: data.coffee_type,
      confirmed: true,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create log: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function updateLog(visitId: string, data: LogFormData): Promise<CoffeeLog> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/api/v1/visits/${visitId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      rating: data.rating,
      comment: data.comment,
      photo_urls: data.photo_urls || [],
      is_public: data.is_public,
      anonymous: data.anonymous,
      coffee_type: data.coffee_type,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 403) {
      throw new Error('Not authorized to update this log');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update log: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function deleteLog(visitId: string): Promise<void> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/api/v1/visits/${visitId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 403) {
      throw new Error('Not authorized to delete this log');
    }
    if (response.status === 404) {
      throw new Error('Log not found');
    }
    throw new Error(`Failed to delete log: ${response.status} ${response.statusText}`);
  }
}

