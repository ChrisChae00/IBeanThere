'use client';

import { useState, useCallback, useEffect } from 'react';

interface LocationState {
  coords: GeolocationCoordinates | null;
  error: string | null;
  isLoading: boolean;
}

// Global singleton state for location to share across all hook instances
let globalCoords: GeolocationCoordinates | null = null;
let lastFetchTime: number = 0;
const CACHE_STALE_TIME = 30000; // 30 seconds
const listeners = new Set<(coords: GeolocationCoordinates | null) => void>();

function updateGlobalCoords(coords: GeolocationCoordinates | null) {
  globalCoords = coords;
  lastFetchTime = Date.now();
  listeners.forEach(listener => listener(coords));
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    coords: globalCoords,
    error: null,
    isLoading: false
  });

  // Sync with global state changes
  useEffect(() => {
    const listener = (coords: GeolocationCoordinates | null) => {
      setLocation(prev => ({ ...prev, coords }));
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<GeolocationCoordinates> => {
    // 1. Check if we have a fresh global coordinate already
    const now = Date.now();
    if (globalCoords && (now - lastFetchTime) < CACHE_STALE_TIME) {
      return globalCoords;
    }

    const fetchLocation = (options: PositionOptions): Promise<GeolocationCoordinates> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Update global cache and notify all listeners
            updateGlobalCoords(position.coords);
            
            setLocation(prev => ({
              ...prev,
              error: null,
              isLoading: false
            }));
            resolve(position.coords);
          },
          (error) => {
            reject(error);
          },
          options
        );
      });
    };

    if (!navigator.geolocation) {
      const error = 'Geolocation not supported by your browser';
      setLocation(prev => ({ ...prev, error, isLoading: false }));
      throw new Error(error);
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try with high accuracy first
      return await fetchLocation({
        enableHighAccuracy: true,
        timeout: 15000, 
        maximumAge: 10000 
      });
    } catch (_firstError: unknown) {
      // If timed out or failed, try again with low accuracy
      try {
        return await fetchLocation({
          enableHighAccuracy: false,
          timeout: 15000, 
          maximumAge: 60000 
        });
      } catch (secondError: unknown) {
        let errorMessage = 'Location error';
        let shouldClearCoords = false;

        if (secondError instanceof GeolocationPositionError) {
          switch (secondError.code) {
            case secondError.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              shouldClearCoords = true;
              break;
            case secondError.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case secondError.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }
        }

        setLocation(prev => ({
          coords: shouldClearCoords ? null : prev.coords,
          error: errorMessage,
          isLoading: false
        }));
        
        if (shouldClearCoords) {
          updateGlobalCoords(null);
        }
        
        throw new Error(errorMessage);
      }
    }
  }, []);

  return { 
    ...location, 
    getCurrentLocation
  };
}

