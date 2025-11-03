'use client';

import { useState, useCallback } from 'react';
import { CafeMapData, MapSearchParams } from '@/types/map';
import { CafeSearchResponse } from '@/types/api';

interface MapDataState {
  cafes: CafeMapData[];
  isLoading: boolean;
  error: string | null;
}

export function useMapData() {
  const [state, setState] = useState<MapDataState>({
    cafes: [],
    isLoading: false,
    error: null
  });

  const searchCafes = useCallback(async (params: MapSearchParams) => {
    console.log(`Searching cafes for lat=${params.lat.toFixed(6)}, lng=${params.lng.toFixed(6)}, radius=${params.radius}m`);

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = `${apiUrl}/api/v1/cafes/search?lat=${params.lat}&lng=${params.lng}&radius=${params.radius}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch cafes: ${response.status} ${response.statusText}`);
      }

      const result: CafeSearchResponse = await response.json();
      const rawCafes = result.cafes || [];
      
      console.log(`Received ${rawCafes.length} cafes from API (cache_hit=${result.cache_hit})`);
      
      const cafes: CafeMapData[] = rawCafes.map((cafe) => ({
        id: cafe.id || '',
        name: cafe.name || '',
        latitude: typeof cafe.latitude === 'string' ? parseFloat(cafe.latitude) : cafe.latitude || 0,
        longitude: typeof cafe.longitude === 'string' ? parseFloat(cafe.longitude) : cafe.longitude || 0,
        rating: cafe.rating ? (typeof cafe.rating === 'string' ? parseFloat(cafe.rating) : cafe.rating) : undefined,
        address: cafe.address || '',
        phoneNumber: cafe.phone_number,
        website: cafe.website,
        status: cafe.status || 'pending',
        verification_count: cafe.verification_count || 1,
        foundingCrew: cafe.founding_crew ? {
          navigator: cafe.founding_crew.navigator,
          vanguard: cafe.founding_crew.vanguard || []
        } : undefined
      }));

      setState({
        cafes,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching cafes:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cafes';
      
      setState({
        cafes: [],
        isLoading: false,
        error: errorMessage
      });
    }
  }, []);

  return {
    ...state,
    searchCafes
  };
}

