import { TrendingCafeResponse, CafeSearchResponse, CafeRegistrationRequest, CafeRegistrationResponse, LocationSearchResult, CafeDetailResponse } from '@/types/api';
import { API_BASE_URL, getAuthHeaders, handleResponse } from './client';

export async function registerCafe(
  data: CafeRegistrationRequest
): Promise<CafeRegistrationResponse> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/v1/cafes/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('NOT_AUTHENTICATED');
      }
      if (response.status === 409) {
        const errorData = await response.json();
        return {
          success: false,
          error: 'DUPLICATE_CAFE',
          message: errorData.detail || 'A cafe already exists at this location',
          existingCafe: errorData.cafe
        };
      }
      if (response.status === 400) {
        const errorData = await response.json();
        return {
          success: false,
          error: 'DISTANCE_TOO_FAR',
          message: errorData.detail || 'You must be within 50m of the cafe'
        };
      }
      throw new Error('REGISTER_CAFE_FAILED');
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
    if (error instanceof Error && error.message === 'NOT_AUTHENTICATED') {
      throw error;
    }
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Failed to register cafe. Please try again.'
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
    
    // Add user location if provided to prioritize nearby results
    if (userLocation) {
      url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
    }
    
    // Add country code if provided
    if (countryCode) {
      url += `&countrycode=${encodeURIComponent(countryCode)}`;
    }
    
    const response = await fetch(url, {
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
    
    const response = await fetch(url, {
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
    
    // Add location parameters for city-based filtering
    if (location) {
      url += `&lat=${location.lat}&lng=${location.lng}&radius=50000`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending cafes: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching trending cafes:', error);
    return [];
  }
}

export async function getPendingCafes(): Promise<CafeSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/cafes/pending`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse<CafeSearchResponse>(response);
}

export async function getCafeDetail(cafeId: string): Promise<CafeDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/cafes/${cafeId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store', // Disable caching to ensure fresh data
  });

  if (!response.ok && response.status === 404) {
    throw new Error('Cafe not found');
  }

  return handleResponse<CafeDetailResponse>(response);
}

export async function searchCafes(
  lat: number,
  lng: number,
  radius: number = 2000
): Promise<CafeSearchResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/cafes/search?lat=${lat}&lng=${lng}&radius=${radius}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  );

  return handleResponse<CafeSearchResponse>(response);
}

