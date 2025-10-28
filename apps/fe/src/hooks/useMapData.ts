'use client';

import { useState, useEffect, useCallback } from 'react';
import { CafeMapData, MapSearchParams } from '@/types/map';
import { useCafeCache } from './useCafeCache';

interface MapDataState {
  cafes: CafeMapData[];
  isLoading: boolean;
  error: string | null;
}

// Memory cache for recent searches (Tier 1)
const memoryCache = new Map<string, CacheEntry>();

interface CacheEntry {
  data: CafeMapData[];
  timestamp: number;
}

const MEMORY_CACHE_TTL = 3600000; // 1 hour in milliseconds

export function useMapData() {
  const [state, setState] = useState<MapDataState>({
    cafes: [],
    isLoading: false,
    error: null
  });

  const { getCachedData, setCachedData, clearStaleCache } = useCafeCache();

  useEffect(() => {
    clearStaleCache();
  }, [clearStaleCache]);

  const searchCafes = useCallback(async (params: MapSearchParams) => {
    const cacheKey = `${params.lat.toFixed(4)},${params.lng.toFixed(4)},${params.radius}`;
    
    // Tier 1: Check memory cache (fastest)
    const memoryCached = memoryCache.get(cacheKey);
    if (memoryCached && Date.now() - memoryCached.timestamp < MEMORY_CACHE_TTL) {
      setState({
        cafes: memoryCached.data,
        isLoading: false,
        error: null
      });
      return;
    }

    // Tier 2: Check IndexedDB cache
    const indexedDBCached = await getCachedData(params.lat, params.lng, params.radius);
    if (indexedDBCached && indexedDBCached.length > 0) {
      memoryCache.set(cacheKey, {
        data: indexedDBCached,
        timestamp: Date.now()
      });

      setState({
        cafes: indexedDBCached,
        isLoading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = `${apiUrl}/api/v1/cafes/search?lat=${params.lat}&lng=${params.lng}&radius=${params.radius}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch cafes: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const rawCafes = result.cafes || [];
      
      const cafes: CafeMapData[] = rawCafes.map((cafe: any) => ({
        id: cafe.id || cafe.google_place_id || '',
        name: cafe.name || '',
        latitude: parseFloat(cafe.latitude) || 0,
        longitude: parseFloat(cafe.longitude) || 0,
        rating: parseFloat(cafe.google_rating) || 0,
        address: cafe.address || '',
        isOpen: cafe.opening_hours?.open_now,
        phoneNumber: cafe.phone_number,
        website: cafe.website
      }));

      // Store in memory cache (Tier 1)
      memoryCache.set(cacheKey, {
        data: cafes,
        timestamp: Date.now()
      });

      // Store in IndexedDB cache (Tier 2)
      await setCachedData(params.lat, params.lng, params.radius, cafes);

      setState({
        cafes,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching cafes:', error);
      
      setState({
        cafes: [],
        isLoading: false,
        error: null
      });
    }
  }, [getCachedData, setCachedData]);

  const clearCache = useCallback(() => {
    memoryCache.clear();
    setState({
      cafes: [],
      isLoading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    searchCafes,
    clearCache
  };
}

