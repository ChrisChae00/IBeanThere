import { Bean, CafeBeansResponse, Roaster } from '@/types/api';
import { API_BASE_URL, getAuthHeaders, handleResponse, apiFetch } from './client';

/*
  The shared roaster/bean catalogue.

  Search returns candidates, never a match: the person picks the roaster they meant,
  and creating is always an insert. Two roasters really can share a name in two
  cities, and one bean name really can mean a different lot next season -- a wrong
  merge costs more to unpick than a duplicate row costs to leave.
*/
export async function searchRoasters(q: string): Promise<Roaster[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/roasters?q=${encodeURIComponent(q)}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  return handleResponse<Roaster[]>(response);
}

export async function createRoaster(name: string, city?: string): Promise<Roaster> {
  const headers = await getAuthHeaders();
  const response = await apiFetch(`${API_BASE_URL}/api/v1/roasters`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, city: city || undefined }),
  });
  return handleResponse<Roaster>(response);
}

export async function getRoasterBeans(roasterId: string, q = ''): Promise<Bean[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/roasters/${roasterId}/beans?q=${encodeURIComponent(q)}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  return handleResponse<Bean[]>(response);
}

export async function createBean(roasterId: string, name: string): Promise<Bean> {
  const headers = await getAuthHeaders();
  const response = await apiFetch(`${API_BASE_URL}/api/v1/beans`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ roaster_id: roasterId, name }),
  });
  return handleResponse<Bean>(response);
}

export type { CafeBeansResponse };
