import { cache } from 'react';
import { TrendingCafeResponse, CafeSearchResponse, CafeRegistrationRequest, CafeRegistrationResponse, LocationSearchResult, CafeDetailResponse, GooglePlacesLookupResult } from '@/types/api';
import { API_BASE_URL, getAuthHeaders, handleResponse, apiFetch, ApiError } from './client';

export async function registerCafe(
  data: CafeRegistrationRequest
): Promise<CafeRegistrationResponse> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await apiFetch(`${API_BASE_URL}/api/v1/cafes/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError('Authentication required', 401, 'NOT_AUTHENTICATED');
      }
      if (response.status === 409) {
        const errorData = await response.json();
        return {
          success: false,
          error: 'DUPLICATE_CAFE',
          message: errorData.detail || errorData.message || 'A cafe already exists at this location',
          existingCafe: errorData.cafe
        };
      }
      if (response.status === 400) {
        const errorData = await response.json();
        return {
          success: false,
          error: 'DISTANCE_TOO_FAR',
          message: errorData.detail || errorData.message || 'You must be within 50m of the cafe'
        };
      }
      throw new ApiError('Failed to register cafe', response.status, 'REGISTER_CAFE_FAILED');
    }
    
    const result = await response.json();
    return {
      success: true,
      cafe: result.cafe,
      check_in: result.check_in,
      message: result.message
    };
  } catch (error) {
    console.error('Error registering cafe:', error);
    if (error instanceof ApiError && error.isAuthError) {
      throw error;
    }
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.code || 'NETWORK_ERROR',
        message: error.message
      };
    }
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Failed to register cafe. Please try again.'
    };
  }
}

export async function lookupGoogleMapsUrl(
  url: string
): Promise<GooglePlacesLookupResult> {
  try {
    const headers = await getAuthHeaders();

    const response = await apiFetch(`${API_BASE_URL}/api/v1/cafes/google-places/lookup`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError('Authentication required', 401, 'NOT_AUTHENTICATED');
      }
      if (response.status === 501) {
        return { success: false, error: 'NOT_CONFIGURED' };
      }
      if (response.status === 400) {
        return { success: false, error: 'INVALID_URL' };
      }
      if (response.status === 404) {
        return { success: false, error: 'PLACE_NOT_FOUND' };
      }
      return { success: false, error: 'LOOKUP_FAILED' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error looking up Google Maps URL:', error);
    if (error instanceof ApiError && error.isAuthError) {
      throw error;
    }
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Failed to look up place information. Please try again.',
    };
  }
}

export async function searchLocationByPostcode(
  postcode: string,
  userLocation?: { lat: number; lng: number },
  countryCode?: string
): Promise<LocationSearchResult | null> {
  try {
    let url = `${API_BASE_URL}/api/v1/cafes/osm/search?q=${encodeURIComponent(postcode)}`;
    
    if (userLocation) {
      url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
    }
    
    if (countryCode) {
      url += `&countrycode=${encodeURIComponent(countryCode)}`;
    }
    
    const response = await apiFetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return {
      lat: data.lat,
      lng: data.lng,
      display_name: data.display_name
    };
  } catch (error) {
    console.error('Error searching location by postcode:', error);
    return null;
  }
}

export async function reverseGeocodeLocation(
  lat: number,
  lng: number
): Promise<{ display_name: string; country_code?: string } | null> {
  try {
    const url = `${API_BASE_URL}/api/v1/cafes/osm/reverse?lat=${lat}&lng=${lng}`;
    
    const response = await apiFetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return {
      display_name: data.display_name || '',
      country_code: data.country_code || undefined
    };
  } catch (error) {
    console.error('Error reverse geocoding location:', error);
    return null;
  }
}

export async function getTrendingCafes(
  limit: number = 10,
  offset: number = 0,
  location?: { lat: number; lng: number }
): Promise<TrendingCafeResponse[]> {
  try {
    let url = `${API_BASE_URL}/api/v1/cafes/trending?limit=${limit}&offset=${offset}`;
    
    if (location) {
      url += `&lat=${location.lat}&lng=${location.lng}&radius=50000`;
    }
    
    const response = await apiFetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 14400, tags: ['trending-cafes'] },
    });

    return await handleResponse<TrendingCafeResponse[]>(response);
  } catch (error) {
    console.error('Error fetching trending cafes:', error);
    return [];
  }
}

export async function getPendingCafes(): Promise<CafeSearchResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/cafes/pending`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse<CafeSearchResponse>(response);
}

async function _getCafeDetail(cafeId: string): Promise<CafeDetailResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/cafes/${cafeId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 120, tags: ['cafe', `cafe-${cafeId}`] },
  });

  return handleResponse<CafeDetailResponse>(response, { 404: 'CAFE_NOT_FOUND' });
}

// React.cache() memoizes per render cycle — generateMetadata and the page
// component both call this, but only one network request is made per render.
export const getCafeDetail = cache(_getCafeDetail);

export async function searchCafes(
  lat: number,
  lng: number,
  radius: number = 2000
): Promise<CafeSearchResponse> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/cafes/search?lat=${lat}&lng=${lng}&radius=${radius}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  );

  return handleResponse<CafeSearchResponse>(response);
}
