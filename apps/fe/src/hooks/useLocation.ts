'use client';

import { useState, useCallback } from 'react';

interface LocationState {
  coords: GeolocationCoordinates | null;
  error: string | null;
  isLoading: boolean;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    coords: null,
    error: null,
    isLoading: false
  });

  const getCurrentLocation = useCallback((): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation not supported by your browser';
        setLocation(prev => ({ 
          ...prev, 
          error,
          isLoading: false 
        }));
        reject(new Error(error));
        return;
      }

      setLocation(prev => ({ ...prev, isLoading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            coords: position.coords,
            error: null,
            isLoading: false
          });
          resolve(position.coords);
        },
        (error) => {
          let errorMessage = 'Location error';
          let shouldClearCoords = false;
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              shouldClearCoords = true; // User explicitly denied permission
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              // Keep previous coords - temporary GPS issue
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              // Keep previous coords - just a timeout, not a permanent failure
              break;
          }
          
          setLocation(prev => ({
            coords: shouldClearCoords ? null : prev.coords,
            error: errorMessage,
            isLoading: false
          }));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 8000, // 8 seconds timeout
          maximumAge: 300000 // 5 minutes - use cached location
        }
      );
    });
  }, []);

  return { 
    ...location, 
    getCurrentLocation
  };
}

