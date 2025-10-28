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
  proximityRadius: 100, // 100 meters
  minStayDuration: 300000, // 5 minutes
  maxStayDuration: 600000, // 10 minutes
};

export function useVisitDetection(
  cafes: CafeMapData[],
  onVisitDetected?: (cafe: CafeMapData, duration: number) => void,
  config: Partial<VisitDetectionConfig> = {}
) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [nearbyStays, setNearbyStays] = useState<Map<string, CafeStay>>(new Map());
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
  const checkProximityToCafes = useCallback((location: LocationPoint) => {
    const now = Date.now();
    const updatedStays = new Map(staysRef.current);
    
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
        if (existingStay) {
          // Update existing stay
          const duration = now - existingStay.enteredAt;
          updatedStays.set(cafe.id, {
            ...existingStay,
            lastSeenAt: now,
            duration
          });
          
          // Check if we should trigger visit detection
          if (
            !existingStay.notificationShown &&
            duration >= fullConfig.minStayDuration &&
            duration <= fullConfig.maxStayDuration
          ) {
            updatedStays.set(cafe.id, {
              ...existingStay,
              notificationShown: true,
              duration
            });
            
            // Trigger callback
            if (onVisitDetected) {
              const durationMinutes = Math.floor(duration / 60000);
              onVisitDetected(cafe, durationMinutes);
            }
          }
        } else {
          // New stay detected
          updatedStays.set(cafe.id, {
            cafe,
            enteredAt: now,
            lastSeenAt: now,
            duration: 0,
            notificationShown: false
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

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now()
        };
        
        setCurrentLocation(location);
        checkProximityToCafes(location);
      },
      (error) => {
        // Only log non-timeout errors to avoid console spam
        if (error.code !== error.TIMEOUT) {
          console.error('Geolocation error:', error);
        }
      },
      {
        enableHighAccuracy: false,  // Reduced accuracy for better performance
        maximumAge: 30000,  // Accept cached location up to 30 seconds
        timeout: 15000  // Increased timeout to 15 seconds
      }
    );

    // Set up periodic checks
    checkIntervalRef.current = setInterval(() => {
      if (currentLocation) {
        checkProximityToCafes(currentLocation);
      }
    }, fullConfig.checkInterval);

    setIsTracking(true);
  }, [isTracking, requestPermission, checkProximityToCafes, fullConfig.checkInterval, currentLocation]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
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

