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

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ 
        ...prev, 
        error: 'Geolocation not supported by your browser',
        isLoading: false 
      }));
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
      },
      (error) => {
        let errorMessage = 'Location error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            break;
        }
        
        setLocation({
          coords: null,
          error: errorMessage,
          isLoading: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  return { 
    ...location, 
    getCurrentLocation
  };
}

