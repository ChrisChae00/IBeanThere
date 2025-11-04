'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import InteractiveMap from './InteractiveMap';
import LocationPermissionOverlay from './LocationPermissionOverlay';
import NearbyCafeAlert from '../visits/NearbyCafeAlert';
import FranchiseFilterComponent from './FranchiseFilter';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useLocation } from '@/hooks/useLocation';
import { useMapData } from '@/hooks/useMapData';
import { useVisitDetection } from '@/hooks/useVisitDetection';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { CafeMapData, FranchiseFilter, NearbyCafe } from '@/types/map';
import { isFranchise } from '@/lib/franchiseDetector';
import { checkIn } from '@/lib/api/visits';
import { calculateDistance } from '@/lib/utils/checkIn';

interface MapWithFiltersProps {
  locale: string;
  userMarkerPalette?: string;
}

export default function MapWithFilters({ locale, userMarkerPalette }: MapWithFiltersProps) {
  const t = useTranslations('map');
  const tVisit = useTranslations('visit');
  const { coords, getCurrentLocation, error: locationError } = useLocation();
  const { cafes: allCafes, isLoading, error, searchCafes } = useMapData();
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<CafeMapData | null>(null);
  const [nearbyCafes, setNearbyCafes] = useState<NearbyCafe[]>([]);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [forceCenterUpdate, setForceCenterUpdate] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [franchiseFilter, setFranchiseFilter] = useState<FranchiseFilter>({
    showFranchises: true,
    blockedFranchises: [],
    preferredFranchises: [],
    filterMode: 'all'
  });
  
  // Track last search location to prevent excessive API calls
  const lastSearchRef = useRef<{ lat: number; lng: number } | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic search based on visible area with debouncing
  const handleBoundsChanged = useCallback((bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce the search
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        // Calculate center of visible bounds
        const centerLat = (bounds.ne.lat + bounds.sw.lat) / 2;
        const centerLng = (bounds.ne.lng + bounds.sw.lng) / 2;
        
        // Validate bounds
        if (isNaN(centerLat) || isNaN(centerLng) || Math.abs(centerLat) > 90 || Math.abs(centerLng) > 180) {
          console.error('Invalid bounds:', bounds);
          return;
        }
        
        // Only search if location changed significantly (at least 200m)
        const SEARCH_THRESHOLD = 200; // meters
        if (lastSearchRef.current) {
          const R = 6371000;
          const latDiff = centerLat - lastSearchRef.current.lat;
          const lngDiff = centerLng - lastSearchRef.current.lng;
          const dist = R * Math.sqrt(
            Math.pow(latDiff * Math.PI / 180, 2) + 
            Math.pow(lngDiff * Math.PI / 180, 2) * Math.pow(Math.cos(centerLat * Math.PI / 180), 2)
          );
          
          if (dist < SEARCH_THRESHOLD) {
            return; // Location hasn't changed enough
          }
        }
        
        lastSearchRef.current = { lat: centerLat, lng: centerLng };
        
        // Calculate radius in meters (expand to load more cafes around map)
        const R = 6371000; // Earth radius in meters
        const latDiff = bounds.ne.lat - bounds.sw.lat;
        const lngDiff = bounds.ne.lng - bounds.sw.lng;
        const latDist = R * Math.abs(latDiff) * (Math.PI / 180);
        const lngDist = R * Math.abs(lngDiff) * Math.cos(bounds.ne.lat * Math.PI / 180) * (Math.PI / 180);
        const radius = Math.max(latDist, lngDist) * 2.0; // Increased from 1.2 to 2.0 for wider search
        
        searchCafes({
          lat: centerLat,
          lng: centerLng,
          radius: Math.floor(Math.min(radius, 5000)) // Increased from 2500 to 5000m for wider coverage
        });
      } catch (error) {
        console.error('Error in handleBoundsChanged:', error);
      }
    }, 500); // 500ms debounce for faster response
  }, [searchCafes]);

  // Check permission state on mount and auto-start tracking if granted
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        const state = result.state as 'prompt' | 'granted' | 'denied';
        setLocationPermission(state);
        
        // Auto-start location tracking if permission already granted
        if (state === 'granted') {
          setTrackingEnabled(true);
          getCurrentLocation().catch((error) => {
            // Silently handle timeout errors during auto-load
            if (process.env.NODE_ENV === 'development') {
              console.debug('Location auto-load timeout (expected):', error.message);
            }
          });
        }
        
        result.onchange = () => {
          setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
        };
      }).catch(() => {
        setLocationPermission('prompt');
      });
    }
  }, [getCurrentLocation]);

  // Update center when location is available
  useEffect(() => {
    if (coords) {
      const newCenter = { lat: coords.latitude, lng: coords.longitude };
      setCenter(newCenter);
      lastSearchRef.current = newCenter;
    }
  }, [coords]);

  const handleLocationClick = () => {
    getCurrentLocation().catch((error) => {
      // User-initiated action - show toast notification
      if (process.env.NODE_ENV === 'development') {
        console.debug('Location request failed:', error.message);
      }
      showToast(t('location_error'), 'error');
    });
    setForceCenterUpdate(true);
    setTimeout(() => setForceCenterUpdate(false), 100);
  };

  const handleRequestPermission = async () => {
    try {
      await getCurrentLocation();
      setLocationPermission('granted');
    } catch (error) {
      setLocationPermission('denied');
    }
  };

  // Filter cafes based on franchise filter
  const { filteredCafes, localCafes, franchiseCafes } = useMemo(() => {
    let local = 0;
    let franchise = 0;

    const filtered = allCafes.filter(cafe => {
      const isFranchiseCafe = isFranchise(cafe.name);
      
      if (isFranchiseCafe) {
        franchise++;
      } else {
        local++;
      }

      if (franchiseFilter.filterMode === 'all') {
        return true;
      }
      
      if (franchiseFilter.filterMode === 'local') {
        return !isFranchiseCafe;
      }
      
      if (franchiseFilter.filterMode === 'preferred') {
        return franchiseFilter.preferredFranchises.some(pf => 
          cafe.name.toLowerCase().includes(pf.toLowerCase())
        );
      }
      
      return true;
    });

    return { 
      filteredCafes: filtered, 
      localCafes: local, 
      franchiseCafes: franchise 
    };
  }, [allCafes, franchiseFilter]);

  // Visit detection hook
  const { isTracking, nearbyStays, startTracking, stopTracking, permissionGranted } = useVisitDetection(
    filteredCafes,
    (cafes) => {
      if (!coords) return;
      
      const cafesWithDistance: NearbyCafe[] = cafes.map(cafe => ({
        ...cafe,
        distance: calculateDistance(
          coords.latitude,
          coords.longitude,
          cafe.latitude,
          cafe.longitude
        )
      }));
      
      setNearbyCafes(cafesWithDistance);
    },
    {
      enabled: trackingEnabled,
      minStayDuration: 0,
      maxStayDuration: 600000,
      proximityRadius: 50
    }
  );

  const handleCafeClick = async (cafe: CafeMapData) => {
    setSelectedCafe(cafe);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/cafes/${cafe.id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to record cafe view:', error);
    }
  };

  const handleCheckIn = async (cafe: NearbyCafe) => {
    if (isCheckingIn) return;
    
    if (!user) {
      showToast(tVisit('login_required'), 'warning');
      return;
    }
    
    if (!coords) {
      showToast(tVisit('location_permission_required'), 'warning');
      return;
    }
    
    setIsCheckingIn(true);
    try {
      const result = await checkIn(
        cafe,
        coords.latitude,
        coords.longitude,
        user.id
      );
      
      if (result.success) {
        showToast(tVisit('check_in_success'), 'success');
        setNearbyCafes([]);
      } else {
        showToast(result.error || tVisit('check_in_failed'), 'error');
      }
    } catch (error) {
      console.error('Failed to check in:', error);
      showToast(tVisit('check_in_failed'), 'error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleDismissAlert = () => {
    setNearbyCafes([]);
  };

  const toggleTracking = async () => {
    if (trackingEnabled) {
      stopTracking();
      setTrackingEnabled(false);
    } else {
      try {
        if (locationPermission !== 'granted') {
          await handleRequestPermission();
        }
        if (coords || locationPermission === 'granted') {
          startTracking();
          setTrackingEnabled(true);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Failed to start tracking:', error);
        }
        showToast(t('location_error'), 'error');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FranchiseFilterComponent
          filter={franchiseFilter}
          onFilterChange={setFranchiseFilter}
          totalCafes={allCafes.length}
          localCafes={localCafes}
          franchiseCafes={franchiseCafes}
        />
        
        <div className="flex gap-2">
          <button
            onClick={handleLocationClick}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2 text-sm font-medium min-h-[44px]"
          >
            <span>📍</span>
            <span>{t('location_button')}</span>
          </button>
          
          <button
            onClick={toggleTracking}
            className={`
              px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium min-h-[44px]
              ${isTracking 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              }
            `}
          >
            <span>{isTracking ? t('location_sharing_on') : t('location_sharing')}</span>
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-[var(--color-text-secondary)] mb-3">
        {filteredCafes.length} of {allCafes.length} cafes
        {isTracking && nearbyStays.length > 0 && (
          <span className="ml-2 text-[var(--color-primary)]">
            · {nearbyStays.length} nearby
          </span>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[450px]">
        {locationPermission !== 'granted' ? (
          <LocationPermissionOverlay
            onRequestPermission={handleRequestPermission}
            permissionState={locationPermission}
          />
        ) : !center ? (
          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden h-full flex items-center justify-center bg-[var(--color-surface)]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-[var(--color-text-secondary)] mt-4">{t('loading_location')}</p>
            </div>
          </div>
        ) : (
          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden h-full">
            <InteractiveMap
              cafes={filteredCafes}
              center={center}
              zoom={14}
              userLocation={coords ? { lat: coords.latitude, lng: coords.longitude } : undefined}
              userMarkerPalette={userMarkerPalette}
              onMarkerClick={handleCafeClick}
              onBoundsChanged={handleBoundsChanged}
              forceCenterUpdate={forceCenterUpdate}
            />
          </div>
        )}
      </div>

      {/* Nearby Cafes Alert */}
      {nearbyCafes.length > 0 && coords && (
        <NearbyCafeAlert
          cafes={nearbyCafes}
          userLocation={{ lat: coords.latitude, lng: coords.longitude }}
          onCheckIn={handleCheckIn}
          onDismiss={handleDismissAlert}
          isCheckingIn={isCheckingIn}
        />
      )}
    </div>
  );
}
