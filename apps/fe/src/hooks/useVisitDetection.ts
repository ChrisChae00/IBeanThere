'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CafeMapData } from '@/types/map';

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface CafeStay {
  cafe: CafeMapData;
  enteredAt: number;
  lastSeenAt: number;
  duration: number;
  notificationShown: boolean;
}

interface VisitDetectionConfig {
  enabled: boolean;
  checkInterval: number;
  proximityRadius: number;
  minStayDuration: number;
  maxStayDuration: number;
}

const DEFAULT_CONFIG: VisitDetectionConfig = {
  enabled: false,
  checkInterval: 30000, // Check every 30 seconds
  proximityRadius: 50, // 50 meters
  minStayDuration: 0, // Immediate detection
  maxStayDuration: 600000, // 10 minutes
};

export function useVisitDetection(
  cafes: CafeMapData[],
  onVisitDetected?: (cafes: CafeMapData[]) => void,
  config: Partial<VisitDetectionConfig> = {}
) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [nearbyStays, setNearbyStays] = useState<Map<string, CafeStay>>(new Map());
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const staysRef = useRef<Map<string, CafeStay>>(new Map());

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Check proximity to cafes and update stays
  const checkProximityToCafes = useCallback((location: LocationPoint, accuracy?: number) => {
    // Ignore locations with low accuracy (> 50m)
    if (accuracy && accuracy > 50) {
      return;
    }

    const now = Date.now();
    const updatedStays = new Map(staysRef.current);
    const nearbyCafes: CafeMapData[] = [];
    
    cafes.forEach(cafe => {
      const distance = calculateDistance(
        location.lat,
        location.lng,
        cafe.latitude,
        cafe.longitude
      );
      
      const isNearby = distance <= fullConfig.proximityRadius;
      const existingStay = updatedStays.get(cafe.id);
      
      if (isNearby) {
        nearbyCafes.push(cafe);
        
        if (existingStay) {
          // Update existing stay
          const duration = now - existingStay.enteredAt;
          updatedStays.set(cafe.id, {
            ...existingStay,
            lastSeenAt: now,
            duration
          });
        } else {
          // New stay detected - immediate notification
          updatedStays.set(cafe.id, {
            cafe,
            enteredAt: now,
            lastSeenAt: now,
            duration: 0,
            notificationShown: true
          });
        }
      } else if (existingStay) {
        // User left the area - remove stay
        const timeSinceLastSeen = now - existingStay.lastSeenAt;
        if (timeSinceLastSeen > fullConfig.checkInterval * 2) {
          updatedStays.delete(cafe.id);
        }
      }
    });
    
    // Trigger callback with all nearby cafes (immediate detection)
    if (nearbyCafes.length > 0 && onVisitDetected) {
      const hasNewCafes = nearbyCafes.some(cafe => {
        const stay = staysRef.current.get(cafe.id);
        return !stay || !stay.notificationShown;
      });
      
      if (hasNewCafes) {
        onVisitDetected(nearbyCafes);
      }
    }
    
    staysRef.current = updatedStays;
    setNearbyStays(new Map(updatedStays));
  }, [cafes, fullConfig, calculateDistance, onVisitDetected]);

  // Request location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      setPermissionGranted(false);
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted') {
        setPermissionGranted(true);
        return true;
      } else if (permission.state === 'prompt') {
        // Will be prompted when we call getCurrentPosition
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setPermissionGranted(true);
              resolve(true);
            },
            () => {
              setPermissionGranted(false);
              resolve(false);
            }
          );
        });
      } else {
        setPermissionGranted(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  // Start tracking
  const startTracking = useCallback(async () => {
    if (isTracking) return;
    
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.error('Location permission denied');
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    // Start watching position (foreground only)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now()
        };
        
        setCurrentLocation(location);
        checkProximityToCafes(location, position.coords.accuracy);
      },
      (error) => {
        // Only log non-timeout errors to avoid console spam
        if (error.code !== error.TIMEOUT) {
          console.error('Geolocation error:', error);
        }
      },
      {
        enableHighAccuracy: true,  // High accuracy for check-in
        maximumAge: 10000,  // Accept cached location up to 10 seconds
        timeout: 15000  // Timeout to 15 seconds
      }
    );

    setIsTracking(true);
  }, [isTracking, requestPermission, checkProximityToCafes]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    staysRef.current.clear();
    setNearbyStays(new Map());
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Auto-start if enabled in config
  useEffect(() => {
    if (fullConfig.enabled && !isTracking) {
      startTracking();
    } else if (!fullConfig.enabled && isTracking) {
      stopTracking();
    }
  }, [fullConfig.enabled, isTracking, startTracking, stopTracking]);

  return {
    isTracking,
    currentLocation,
    nearbyStays: Array.from(nearbyStays.values()),
    permissionGranted,
    startTracking,
    stopTracking,
    requestPermission
  };
}

