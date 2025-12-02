const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('NOT_AUTHENTICATED');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

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

export async function getPendingCafes(): Promise<PendingCafesResponse> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/api/v1/cafes/admin/pending`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('ADMIN_ACCESS_REQUIRED');
    }
    if (response.status === 401) {
      throw new Error('NOT_AUTHENTICATED');
    }
    throw new Error('FETCH_PENDING_CAFES_FAILED');
  }
  
  return response.json();
}

export async function verifyCafe(cafeId: string): Promise<AdminVerifyResponse> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/api/v1/cafes/admin/${cafeId}/verify`, {
    method: 'POST',
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('ADMIN_ACCESS_REQUIRED');
    }
    if (response.status === 404) {
      throw new Error('CAFE_NOT_FOUND');
    }
    if (response.status === 401) {
      throw new Error('NOT_AUTHENTICATED');
    }
    throw new Error('VERIFY_CAFE_FAILED');
  }
  
  return response.json();
}

export async function deleteCafe(cafeId: string): Promise<AdminDeleteResponse> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/api/v1/cafes/admin/${cafeId}`, {
    method: 'DELETE',
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('ADMIN_ACCESS_REQUIRED');
    }
    if (response.status === 404) {
      throw new Error('CAFE_NOT_FOUND');
    }
    if (response.status === 401) {
      throw new Error('NOT_AUTHENTICATED');
    }
    throw new Error('DELETE_CAFE_FAILED');
  }
  
  return response.json();
}

