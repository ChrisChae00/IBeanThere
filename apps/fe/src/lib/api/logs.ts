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
      dessert: data.dessert,
      price: data.price,
      atmosphere_rating: data.atmosphere_rating,
      parking_info: data.parking_info,
      acidity_rating: data.acidity_rating,
      body_rating: data.body_rating,
      sweetness_rating: data.sweetness_rating,
      bitterness_rating: data.bitterness_rating,
      aftertaste_rating: data.aftertaste_rating,
      bean_origin: data.bean_origin,
      processing_method: data.processing_method,
      roast_level: data.roast_level,
      extraction_method: data.extraction_method,
      extraction_equipment: data.extraction_equipment,
      aroma_rating: data.aroma_rating,
      wifi_quality: data.wifi_quality,
      wifi_rating: data.wifi_rating,
      outlet_info: data.outlet_info,
      furniture_comfort: data.furniture_comfort,
      noise_level: data.noise_level,
      noise_rating: data.noise_rating,
      temperature_lighting: data.temperature_lighting,
      facilities_info: data.facilities_info,
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
      dessert: data.dessert,
      price: data.price,
      atmosphere_rating: data.atmosphere_rating,
      parking_info: data.parking_info,
      acidity_rating: data.acidity_rating,
      body_rating: data.body_rating,
      sweetness_rating: data.sweetness_rating,
      bitterness_rating: data.bitterness_rating,
      aftertaste_rating: data.aftertaste_rating,
      bean_origin: data.bean_origin,
      processing_method: data.processing_method,
      roast_level: data.roast_level,
      extraction_method: data.extraction_method,
      extraction_equipment: data.extraction_equipment,
      aroma_rating: data.aroma_rating,
      wifi_quality: data.wifi_quality,
      wifi_rating: data.wifi_rating,
      outlet_info: data.outlet_info,
      furniture_comfort: data.furniture_comfort,
      noise_level: data.noise_level,
      noise_rating: data.noise_rating,
      temperature_lighting: data.temperature_lighting,
      facilities_info: data.facilities_info,
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

