'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '../ui/LoadingSpinner';

const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  loading: () => <div className="h-full w-full flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: false
});
import LocationPermissionOverlay from './LocationPermissionOverlay';
import NearbyCafeAlert from '../visits/NearbyCafeAlert';
import FranchiseFilterComponent from './FranchiseFilter';
import CafeInfoModal from './CafeInfoModal';
import { RefreshIcon } from '@/components/ui';
import UserLocationIcon from '../ui/UserLocationIcon';
import { useLocation } from '@/hooks/useLocation';
import { useMapData } from '@/hooks/useMapData';
import { useVisitDetection } from '@/hooks/useVisitDetection';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { CafeMapData, FranchiseFilter, NearbyCafe } from '@/types/map';
import { isFranchise } from '@/lib/franchiseDetector';
import { checkIn } from '@/lib/api/visits';
import { calculateDistance } from '@/lib/utils/checkIn';

function getCSSVariable(name: string, fallback: string = ''): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback;
  }
  return fallback;
}

interface MapWithFiltersProps {
  locale: string;
  userMarkerPalette?: string;
  mapTitle?: string;
  mapSubtitle?: string;
}

export default function MapWithFilters({ locale, userMarkerPalette, mapTitle, mapSubtitle }: MapWithFiltersProps) {
  const t = useTranslations('map');
  const tVisit = useTranslations('visit');
  const { coords, getCurrentLocation, error: locationError } = useLocation();
  const { cafes: allCafes, isLoading, error, searchCafes, clearCache } = useMapData();
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
    
    // Debounce the search - increased to 1500ms for less frequent requests
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
        
        // Only search if location changed significantly (at least 1km)
        const SEARCH_THRESHOLD = 1000; // meters
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
        const radius = Math.max(latDist, lngDist) * 2.0;
        
        searchCafes({
          lat: centerLat,
          lng: centerLng,
          radius: Math.floor(Math.min(radius, 20000)) // Increased to 20km max
        });
      } catch (error) {
        console.error('Error in handleBoundsChanged:', error);
      }
    }, 1500); // 1500ms debounce for less frequent requests
  }, [searchCafes]);

  // Check permission state on mount and auto-start tracking if granted
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        const state = result.state as 'prompt' | 'granted' | 'denied';
        // Only auto-set if granted. If denied or prompt, let user try clicking 'Share Location'.
        // This fixes the issue where Safari reports 'denied' and hides the button immediately.
        if (state === 'granted') {
          setLocationPermission('granted');
        } else {
          setLocationPermission('prompt');
        }
        
        // Auto-start location tracking if permission already granted
        // Check user preference from localStorage
        const autoTrackingEnabled = typeof window !== 'undefined' 
          ? localStorage.getItem('location_auto_tracking_enabled') !== 'false'
          : true; // Default to true for SSR
        
        if (state === 'granted' && autoTrackingEnabled) {
          getCurrentLocation()
            .then(() => {
              setTrackingEnabled(true);
            })
            .catch((error) => {
              // Silently handle timeout errors during auto-load
              if (process.env.NODE_ENV === 'development') {
                console.debug('Location auto-load timeout (expected):', error.message);
              }
              // Still enable tracking even if initial location fetch fails
              setTrackingEnabled(true);
            });
        }
        
        result.onchange = () => {
          const newState = result.state as 'prompt' | 'granted' | 'denied';
          setLocationPermission(newState);
          
          // Check user preference from localStorage
          const autoTrackingEnabled = typeof window !== 'undefined' 
            ? localStorage.getItem('location_auto_tracking_enabled') !== 'false'
            : true; // Default to true for SSR
          
          // Auto-start tracking when permission changes to granted (if user preference allows)
          if (newState === 'granted' && !trackingEnabled && autoTrackingEnabled) {
            getCurrentLocation()
              .then(() => {
                setTrackingEnabled(true);
              })
              .catch((error) => {
                if (process.env.NODE_ENV === 'development') {
                  console.debug('Location auto-load timeout (expected):', error.message);
                }
                setTrackingEnabled(true);
              });
          } else if (newState !== 'granted' && trackingEnabled) {
            // Stop tracking if permission is revoked
            setTrackingEnabled(false);
          }
        };
      }).catch(() => {
        setLocationPermission('prompt');
      });
    }
  }, [getCurrentLocation, trackingEnabled]);

  // Update center when location is available and trigger initial search
  useEffect(() => {
    if (coords) {
      const newCenter = { lat: coords.latitude, lng: coords.longitude };
      setCenter(newCenter);
      
      let forceReload = false;
      
      // Check if cache needs refresh after cafe registration
      if (typeof window !== 'undefined') {
        const needsRefresh = localStorage.getItem('cafe_cache_needs_refresh');
        if (needsRefresh === 'true') {
          clearCache();
          lastSearchRef.current = null;
          forceReload = true;
          localStorage.removeItem('cafe_cache_needs_refresh');
        }
      }
      
      // Only search if this is a new location or forced reload
      if (forceReload || !lastSearchRef.current || 
          Math.abs(lastSearchRef.current.lat - newCenter.lat) > 0.001 ||
          Math.abs(lastSearchRef.current.lng - newCenter.lng) > 0.001) {
        
        lastSearchRef.current = newCenter;
        
        // Aggressive initial load: 20km radius
        searchCafes({
          lat: newCenter.lat,
          lng: newCenter.lng,
          radius: 20000
        }, forceReload);
      }
    }
  }, [coords, searchCafes, clearCache]);

  const handleLocationClick = () => {
    // If coords already exist, update center immediately
    if (coords) {
      const newCenter = { lat: coords.latitude, lng: coords.longitude };
      setCenter(newCenter);
      setForceCenterUpdate(true);
      setTimeout(() => setForceCenterUpdate(false), 100);
    }
    
    // Try to get fresh location
    getCurrentLocation()
      .then(() => {
        // Location successfully retrieved - center will be updated by useEffect
        setForceCenterUpdate(true);
        setTimeout(() => setForceCenterUpdate(false), 100);
      })
      .catch((error) => {
        // Only show error for critical failures, not timeouts
        // Timeout errors keep previous coords, so location is still available
        if (error.message === 'Location request timeout') {
          // Use cached/previous location - center already updated above if coords exist
          if (process.env.NODE_ENV === 'development') {
            console.debug('Location request timeout, using cached location');
          }
          // If coords exist, center was already updated above
          if (coords) {
            setForceCenterUpdate(true);
            setTimeout(() => setForceCenterUpdate(false), 100);
          }
        } else if (error.message === 'Location permission denied') {
          // Permission denied - don't show error as it's handled elsewhere
          if (process.env.NODE_ENV === 'development') {
            console.debug('Location permission denied');
          }
        } else {
          // Other errors - show notification
          if (process.env.NODE_ENV === 'development') {
            console.debug('Location request failed:', error.message);
          }
          showToast(t('location_error'), 'error');
        }
      });
  };

  const handleRequestPermission = async (): Promise<boolean> => {
    try {
      await getCurrentLocation();
      setLocationPermission('granted');
      // Auto-start tracking when permission is granted (if user preference allows)
      const autoTrackingEnabled = typeof window !== 'undefined' 
        ? localStorage.getItem('location_auto_tracking_enabled') !== 'false'
        : true; // Default to true for SSR
      if (autoTrackingEnabled) {
        setTrackingEnabled(true);
      }
      return true;
    } catch (error) {
      setLocationPermission('denied');
      return false;
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

  const handleRefreshCafes = async () => {
    clearCache();
    lastSearchRef.current = null;
    if (center) {
      await searchCafes({
        lat: center.lat,
        lng: center.lng,
        radius: 20000
      }, true);
      showToast(t('cafes_refreshed'), 'success');
    }
  };
  

  return (
    <div className="flex-1 flex flex-col">
      {/* Header: Title/Subtitle on top, Controls below on small screens */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        {/* Left side: Title and Subtitle */}
        <div className="flex-1 min-w-0">
          {mapTitle && (
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2 sm:whitespace-nowrap">
              {mapTitle}
            </h2>
          )}
          {mapSubtitle && (
            <p className="text-[var(--color-text-secondary)] sm:whitespace-nowrap">
              {mapSubtitle}
            </p>
          )}
        </div>
        {/* Right side: Controls and Results Info */}
        <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={handleRefreshCafes}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors flex-shrink-0"
              title={t('refresh_cafes')}
              disabled={isLoading}
            >
              <RefreshIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">{t('refresh')}</span>
            </button>

            <FranchiseFilterComponent
              filter={franchiseFilter}
              onFilterChange={setFranchiseFilter}
              totalCafes={allCafes.length}
              localCafes={localCafes}
              franchiseCafes={franchiseCafes}
            />
          </div>
          {/* Results Info - Compact */}
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] text-right mt-2">
            <span>
              {filteredCafes.length} of {allCafes.length} cafes
              {isTracking && nearbyStays.length > 0 && (
                <span className="ml-2 text-[var(--color-primary)]">
                  · {nearbyStays.length} nearby
                </span>
              )}
            </span>
            <button
              onClick={handleLocationClick}
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
              title={t('location_button')}
              disabled={!coords}
            >
              <UserLocationIcon 
                size={32} 
                color={getCSSVariable('--color-userMarkerMap') || getCSSVariable('--color-secondary') || '#8C5A3A'} 
              />
            </button>
          </div>
        </div>
      </div>



      {/* Map */}
      <div className="flex-1 min-h-[400px]">
        {locationPermission !== 'granted' ? (
          <LocationPermissionOverlay
            onRequestPermission={handleRequestPermission}
            permissionState={locationPermission}
          />
        ) : !center ? (
          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden h-full flex items-center justify-center bg-[var(--color-surface)]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-[var(--color-text-secondary)] mt-4 text-sm">{t('loading_location')}</p>
            </div>
          </div>
        ) : (
          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden h-full relative">
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
            {isLoading && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-[var(--color-surface)] px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-[var(--color-text)]">{t('loading_cafes')}</span>
                </div>
              </div>
            )}
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

      {/* Cafe Info Modal */}
      {selectedCafe && (
        <CafeInfoModal
          cafe={selectedCafe}
          onClose={() => setSelectedCafe(null)}
        />
      )}
    </div>
  );
}
