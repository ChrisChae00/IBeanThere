import { TrendingCafeResponse, CafeSearchResponse, CafeRegistrationRequest, CafeRegistrationResponse, LocationSearchResult, CafeDetailResponse } from '@/types/api';

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

export async function registerCafe(
  data: CafeRegistrationRequest
): Promise<CafeRegistrationResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${apiUrl}/api/v1/cafes/register`, {
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    let url = `${apiUrl}/api/v1/cafes/osm/search?q=${encodeURIComponent(postcode)}`;
    
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
      headers: {
        'Content-Type': 'application/json'
      }
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/api/v1/cafes/osm/reverse?lat=${lat}&lng=${lng}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
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
  offset: number = 0
): Promise<TrendingCafeResponse[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/api/v1/cafes/trending?limit=${limit}&offset=${offset}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending cafes: ${response.status} ${response.statusText}`);
    }
    
    const data: TrendingCafeResponse[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching trending cafes:', error);
    return [];
  }
}

export async function getPendingCafes(): Promise<CafeSearchResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/api/v1/cafes/pending`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch pending cafes: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch pending cafes: ${response.status} ${response.statusText}`);
    }
    
    const data: CafeSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pending cafes:', error);
    throw error;
  }
}

export async function getCafeDetail(cafeId: string): Promise<CafeDetailResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/api/v1/cafes/${cafeId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store', // Disable caching to ensure fresh data
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Cafe not found');
      }
      throw new Error(`Failed to fetch cafe detail: ${response.status} ${response.statusText}`);
    }
    
    const data: CafeDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cafe detail:', error);
    throw error;
  }
}

export async function searchCafes(
  lat: number,
  lng: number,
  radius: number = 2000
): Promise<CafeSearchResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/api/v1/cafes/search?lat=${lat}&lng=${lng}&radius=${radius}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search cafes: ${response.status} ${response.statusText}`);
    }
    
    const data: CafeSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching cafes:', error);
    throw error;
  }
}

