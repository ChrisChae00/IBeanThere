/**
 * Collections API Client
 * 
 * Provides functions for interacting with the cafe collections feature.
 * Includes CRUD operations, quick-save, and sharing functionality.
 */

import type {
  Collection,
  CollectionDetail,
  CollectionItem,
  CollectionCreateRequest,
  CollectionUpdateRequest,
  CafeSaveStatus,
  QuickSaveResponse,
  ShareTokenResponse,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// =========================================================
// Helper Functions
// =========================================================

async function getAuthHeaders(): Promise<HeadersInit> {
  const { createClient } = await import('@/shared/lib/supabase/client');
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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('NOT_AUTHENTICATED');
    }
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

// =========================================================
// Collection CRUD
// =========================================================

/**
 * Get all collections for the current user.
 */
export async function getMyCollections(): Promise<Collection[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/collections`, { headers });
  return handleResponse<Collection[]>(response);
}

/**
 * Create a new collection.
 */
export async function createCollection(
  data: CollectionCreateRequest
): Promise<Collection> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<Collection>(response);
}

/**
 * Get detailed collection info including all items.
 */
export async function getCollectionDetail(
  collectionId: string
): Promise<CollectionDetail> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}`, { headers });
  return handleResponse<CollectionDetail>(response);
}

/**
 * Update a collection.
 */
export async function updateCollection(
  collectionId: string,
  data: CollectionUpdateRequest
): Promise<Collection> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<Collection>(response);
}

/**
 * Delete a collection.
 * Note: System collections (Favourites, Save for Later) cannot be deleted.
 */
export async function deleteCollection(collectionId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse<void>(response);
}

// =========================================================
// Collection Items
// =========================================================

/**
 * Add a cafe to a collection.
 */
export async function addCafeToCollection(
  collectionId: string,
  cafeId: string,
  note?: string
): Promise<CollectionItem> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cafe_id: cafeId, note }),
  });
  return handleResponse<CollectionItem>(response);
}

/**
 * Remove a cafe from a collection.
 */
export async function removeCafeFromCollection(
  collectionId: string,
  cafeId: string
): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/api/v1/collections/${collectionId}/items/${cafeId}`,
    { method: 'DELETE', headers }
  );
  return handleResponse<void>(response);
}

// =========================================================
// Sharing
// =========================================================

/**
 * Generate a share token for a collection.
 */
export async function generateShareToken(
  collectionId: string
): Promise<ShareTokenResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}/share`, {
    method: 'POST',
    headers,
  });
  return handleResponse<ShareTokenResponse>(response);
}

/**
 * Get a collection by its share token (public endpoint).
 */
export async function getSharedCollection(
  token: string
): Promise<CollectionDetail> {
  // This is a public endpoint, no auth needed
  const response = await fetch(`${API_BASE_URL}/api/v1/collections/shared/${token}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<CollectionDetail>(response);
}

// =========================================================
// Quick Save (Favourites / Save for Later)
// =========================================================

/**
 * Get the save status of a cafe for the current user.
 */
export async function getCafeSaveStatus(
  cafeId: string
): Promise<CafeSaveStatus> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/cafes/${cafeId}/save-status`, { headers });
  return handleResponse<CafeSaveStatus>(response);
}

/**
 * Quick save/unsave a cafe to Favourites or Save for Later.
 * Toggles the save state - if already saved, removes it.
 * 
 * @param cafeId - The cafe ID to save/unsave
 * @param type - 'favourite' or 'save_later'
 * @returns The action taken (added or removed) and collection ID
 */
export async function quickSaveCafe(
  cafeId: string,
  type: 'favourite' | 'save_later'
): Promise<QuickSaveResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/cafes/${cafeId}/quick-save`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ save_type: type }),
  });
  return handleResponse<QuickSaveResponse>(response);
}

/**
 * Toggle favourite status for a cafe.
 * Convenience wrapper around quickSaveCafe.
 */
export async function toggleFavourite(cafeId: string): Promise<QuickSaveResponse> {
  return quickSaveCafe(cafeId, 'favourite');
}

/**
 * Toggle save for later status for a cafe.
 * Convenience wrapper around quickSaveCafe.
 */
export async function toggleSaveForLater(cafeId: string): Promise<QuickSaveResponse> {
  return quickSaveCafe(cafeId, 'save_later');
}
