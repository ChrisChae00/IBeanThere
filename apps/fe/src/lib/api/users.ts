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
  
  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('NOT_AUTHENTICATED');
    }
    throw new Error('FETCH_USER_FAILED');
  }
  
  return response.json();
}

