'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { API_BASE_URL, apiFetch, handleResponse } from '@/lib/api/client';

export async function deleteCurrentUser(confirmation: string): Promise<void> {
  if (confirmation !== 'DELETE') throw new Error('Confirmation required');
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');
  // The backend validates the token and determines the target. The server action keeps
  // cache invalidation after deletion, when getUser can no longer authenticate us.
  const response = await apiFetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmation }),
  });
  await handleResponse<void>(response);
  revalidateTag('cafe');
  revalidateTag('trending-cafes');
}
