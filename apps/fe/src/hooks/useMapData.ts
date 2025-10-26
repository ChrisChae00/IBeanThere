'use client';

import { useState, useEffect, useCallback } from 'react';
import { CafeMapData, MapSearchParams } from '@/types/map';

interface MapDataState {
  cafes: CafeMapData[];
  isLoading: boolean;
  error: string | null;
}

// Memory cache for recent searches
const memoryCache = new Map<string, CacheEntry>();

interface CacheEntry {
  data: CafeMapData[];
  timestamp: number;
}

const CACHE_TTL = 3600000; // 1 hour in milliseconds

export function useMapData() {
  const [state, setState] = useState<MapDataState>({
    cafes: [],
    isLoading: false,
    error: null
  });

  const searchCafes = useCallback(async (params: MapSearchParams) => {
    const cacheKey = `${params.lat.toFixed(4)},${params.lng.toFixed(4)},${params.radius}`;
    
    // Check memory cache
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setState({
        cafes: cached.data,
        isLoading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/cafes/search?lat=${params.lat}&lng=${params.lng}&radius=${params.radius}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cafes');
      }

      const result = await response.json();
      const rawCafes = result.cafes || [];
      
      // Transform backend response to frontend format
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

      // Store in memory cache
      memoryCache.set(cacheKey, {
        data: cafes,
        timestamp: Date.now()
      });

      setState({
        cafes,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState({
        cafes: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cafes'
      });
    }
  }, []);

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

