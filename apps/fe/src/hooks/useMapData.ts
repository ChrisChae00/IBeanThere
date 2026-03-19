'use client';

import { useState, useCallback } from 'react';
import { CafeMapData, MapSearchParams } from '@/types/map';
import { CafeSearchResponse } from '@/types/api';
import { useSpatialCafeCache } from './useSpatialCafeCache';
import { apiFetch, API_BASE_URL } from '@/lib/api/client';
import { getTrendingCafes } from '@/lib/api/cafes';

interface MapDataState {
  cafes: CafeMapData[];
  isLoading: boolean;
  error: string | null;
  isTrendingFallback: boolean;
}

export function useMapData() {
  const [state, setState] = useState<MapDataState>({
    cafes: [],
    isLoading: false,
    error: null,
    isTrendingFallback: false
  });

  const { getCafes, addCafes, isCached, clearCache, filterCafesByDistance } = useSpatialCafeCache();

  const fetchTrendingFallback = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const trending = await getTrendingCafes(8);
      const cafes: CafeMapData[] = trending.map(cafe => ({
        id: cafe.id,
        name: cafe.name,
        slug: cafe.slug,
        latitude: cafe.latitude,
        longitude: cafe.longitude,
        address: cafe.address,
        status: cafe.status || 'pending',
        verification_count: 1,
        main_image: cafe.main_image ?? cafe.image
      }));
      setState({ cafes, isLoading: false, error: null, isTrendingFallback: true });
    } catch (error) {
      console.error('Error fetching trending fallback:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const searchCafes = useCallback(async (params: MapSearchParams, forceReload = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, isTrendingFallback: false }));

    try {
      if (!forceReload) {
        const cachedCafes = getCafes();
        const nearbyCached = filterCafesByDistance(cachedCafes, params.lat, params.lng, params.radius);
        
        if (isCached(params.lat, params.lng, params.radius) && nearbyCached.length > 0) {
          setState({
            cafes: nearbyCached,
            isLoading: false,
            error: null,
            isTrendingFallback: false
          });
          return;
        }
      }

      const url = `${API_BASE_URL}/api/v1/cafes/search?lat=${params.lat}&lng=${params.lng}&radius=${params.radius}`;
      
      const response = await apiFetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch cafes: ${response.status} ${response.statusText}`);
      }

      const result: CafeSearchResponse = await response.json();
      const rawCafes = result.cafes || [];
      
      const cafes: CafeMapData[] = rawCafes.map((cafe) => ({
        id: cafe.id || '',
        name: cafe.name || '',
        slug: cafe.slug,
        latitude: typeof cafe.latitude === 'string' ? parseFloat(cafe.latitude) : cafe.latitude || 0,
        longitude: typeof cafe.longitude === 'string' ? parseFloat(cafe.longitude) : cafe.longitude || 0,
        rating: cafe.rating ? (typeof cafe.rating === 'string' ? parseFloat(cafe.rating) : cafe.rating) : undefined,
        address: cafe.address || '',
        phoneNumber: cafe.phone,
        website: cafe.website,
        source_url: cafe.source_url,
        businessHours: cafe.business_hours,
        timezone: cafe.timezone,
        status: cafe.status || 'pending',
        verification_count: cafe.verification_count || 1,
        foundingCrew: cafe.founding_crew ? {
          navigator: cafe.founding_crew.navigator,
          scouts: (cafe.founding_crew.vanguard || []).map(v => ({
            ...v,
            role: (v.role === 'vanguard_2nd' ? 'scout_1' : 'scout_2') as 'scout_1' | 'scout_2'
          }))
        } : undefined,
        main_image: cafe.main_image
      }));

      addCafes(cafes, { lat: params.lat, lng: params.lng }, params.radius);

      setState({
        cafes,
        isLoading: false,
        error: null,
        isTrendingFallback: false
      });
    } catch (error) {
      console.error('Error fetching cafes:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cafes';

      setState(prev => ({
        cafes: prev.cafes, // preserve existing cafes on error
        isLoading: false,
        error: errorMessage,
        isTrendingFallback: prev.isTrendingFallback
      }));
    }
  }, [getCafes, addCafes, isCached, filterCafesByDistance]);

  return {
    ...state,
    searchCafes,
    fetchTrendingFallback,
    clearCache
  };
}

