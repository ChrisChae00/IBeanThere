import { TrendingCafeResponse, CafeSearchResponse } from '@/types/api';

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
      throw new Error(`Failed to fetch pending cafes: ${response.status} ${response.statusText}`);
    }
    
    const data: CafeSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pending cafes:', error);
    return { cafes: [], total_count: 0 };
  }
}

