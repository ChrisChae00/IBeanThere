'use client';

import { useRef, useCallback, useEffect } from 'react';
import { CafeMapData } from '@/types/map';

interface CafeCacheEntry {
  cafe: CafeMapData;
  timestamp: number;
}

interface LoadedRegion {
  center: { lat: number; lng: number };
  radius: number;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000;
const STORAGE_KEY = 'ibeanthere_cafe_cache';
const REGIONS_KEY = 'ibeanthere_loaded_regions';

const STATUS_PRIORITY: Record<string, number> = { verified: 0, pending: 1, disputed: 2 };

function isBetterCafe(candidate: CafeMapData, existing: CafeMapData): boolean {
  const cStatus = STATUS_PRIORITY[candidate.status ?? ''] ?? 99;
  const eStatus = STATUS_PRIORITY[existing.status ?? ''] ?? 99;
  if (cStatus !== eStatus) return cStatus < eStatus;
  const cVc = candidate.verification_count ?? 0;
  const eVc = existing.verification_count ?? 0;
  if (cVc !== eVc) return cVc > eVc;
  return candidate.id > existing.id;
}

function coordKey(cafe: CafeMapData): string {
  return `${cafe.latitude.toFixed(6)}_${cafe.longitude.toFixed(6)}`;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useSpatialCafeCache() {
  const cafeMap = useRef<Map<string, CafeCacheEntry>>(new Map());
  const coordIndex = useRef<Map<string, string>>(new Map());
  const loadedRegions = useRef<LoadedRegion[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedCafes = localStorage.getItem(STORAGE_KEY);
      const storedRegions = localStorage.getItem(REGIONS_KEY);
      
      if (storedCafes) {
        const parsed: Array<[string, CafeCacheEntry]> = JSON.parse(storedCafes);
        const now = Date.now();
        
        parsed.forEach(([id, entry]) => {
          if (now - entry.timestamp < CACHE_TTL) {
            const ck = coordKey(entry.cafe);
            const existingId = coordIndex.current.get(ck);
            if (existingId) {
              const existingEntry = cafeMap.current.get(existingId);
              if (existingEntry && !isBetterCafe(entry.cafe, existingEntry.cafe)) {
                return; // existing is better, skip duplicate coord
              }
              cafeMap.current.delete(existingId);
            }
            coordIndex.current.set(ck, id);
            cafeMap.current.set(id, entry);
          }
        });
      }
      
      if (storedRegions) {
        const parsed: LoadedRegion[] = JSON.parse(storedRegions);
        const now = Date.now();
        
        loadedRegions.current = parsed.filter(
          region => now - region.timestamp < CACHE_TTL
        );
      }
    } catch (error) {
      console.error('Error loading cafe cache from localStorage:', error);
    }
  }, []);

  const saveToStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const cafesArray = Array.from(cafeMap.current.entries());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cafesArray));
        localStorage.setItem(REGIONS_KEY, JSON.stringify(loadedRegions.current));
      } catch (error) {
        console.error('Error saving cafe cache to localStorage:', error);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const getCafes = useCallback((): CafeMapData[] => {
    const now = Date.now();
    const validCafes: CafeMapData[] = [];
    
    cafeMap.current.forEach((entry, id) => {
      if (now - entry.timestamp < CACHE_TTL) {
        validCafes.push(entry.cafe);
      } else {
        cafeMap.current.delete(id);
        const ck = coordKey(entry.cafe);
        if (coordIndex.current.get(ck) === id) {
          coordIndex.current.delete(ck);
        }
      }
    });
    
    return validCafes;
  }, []);

  const addCafes = useCallback((cafes: CafeMapData[], center: { lat: number; lng: number }, radius: number) => {
    const now = Date.now();

    cafes.forEach(cafe => {
      const ck = coordKey(cafe);
      const existingId = coordIndex.current.get(ck);
      if (existingId && existingId !== cafe.id) {
        const existingEntry = cafeMap.current.get(existingId);
        if (existingEntry && !isBetterCafe(cafe, existingEntry.cafe)) {
          return; // existing is better, skip
        }
        cafeMap.current.delete(existingId);
      }
      coordIndex.current.set(ck, cafe.id);
      cafeMap.current.set(cafe.id, {
        cafe,
        timestamp: now
      });
    });

    loadedRegions.current.push({
      center,
      radius,
      timestamp: now
    });

    loadedRegions.current = loadedRegions.current.filter(
      region => now - region.timestamp < CACHE_TTL
    );

    saveToStorage();
  }, [saveToStorage]);

  const isCached = useCallback((lat: number, lng: number, radius: number): boolean => {
    const now = Date.now();
    
    return loadedRegions.current.some(region => {
      if (now - region.timestamp >= CACHE_TTL) {
        return false;
      }
      
      const distance = calculateDistance(lat, lng, region.center.lat, region.center.lng);
      return distance + radius <= region.radius;
    });
  }, []);

  const clearCache = useCallback(() => {
    cafeMap.current.clear();
    coordIndex.current.clear();
    loadedRegions.current = [];
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(REGIONS_KEY);
      } catch (error) {
        console.error('Error clearing cache from localStorage:', error);
      }
    }
  }, []);

  const filterCafesByDistance = useCallback((
    cafes: CafeMapData[],
    lat: number,
    lng: number,
    radius: number
  ): CafeMapData[] => {
    return cafes.filter(cafe => {
      const distance = calculateDistance(lat, lng, cafe.latitude, cafe.longitude);
      return distance <= radius;
    });
  }, []);

  return {
    getCafes,
    addCafes,
    isCached,
    clearCache,
    filterCafesByDistance
  };
}

