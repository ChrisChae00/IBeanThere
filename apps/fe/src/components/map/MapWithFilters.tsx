'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { LoadingSpinner, RefreshIcon, UserLocationIcon } from '@/shared/ui';
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  loading: () => <div className="h-full w-full flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: false
});
import LocationPermissionOverlay from './LocationPermissionOverlay';

import CafeInfoModal from './CafeInfoModal';
import { useLocation } from '@/hooks/useLocation';
import { useMapData } from '@/hooks/useMapData';
import { useVisitDetection } from '@/hooks/useVisitDetection';

import { useToast } from '@/contexts/ToastContext';
import { CafeMapData } from '@/types/map';

import { API_BASE_URL, apiFetch } from '@/lib/api/client';

/*
  One banner for every state the map can be in: searching, showing the trending
  fallback, or failed. The three used to be separate overlays -- and the failure had no
  overlay at all, because `useMapData` keeps the previous results on error, so a failed
  search looked exactly like a successful one that found the same cafes.
*/
function MapStatusBanner({
  message,
  busy,
  onRetry,
  retryLabel
}: {
  message: string | null;
  busy?: boolean;
  onRetry?: () => void;
  retryLabel: string;
}) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="absolute top-2 left-1/2 -translate-x-1/2 z-(--z-map-chrome) flex items-center gap-2 rounded-(--radius-pill) border border-edge-rule bg-surface-raised px-3 py-1.5 text-xs text-ink-secondary shadow-sm"
    >
      {busy && <LoadingSpinner size="sm" />}
      <span className="whitespace-nowrap">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-(--radius-control) px-1 font-medium text-ink-primary underline underline-offset-2 hover:opacity-80"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

interface MapWithFiltersProps {
  locale: string;
  mapTitle?: string;
  mapSubtitle?: string;
}

export default function MapWithFilters({ locale, mapTitle, mapSubtitle }: MapWithFiltersProps) {
  const t = useTranslations('map');

  const { coords, getCurrentLocation, error: locationError } = useLocation();
  const { cafes: allCafes, isLoading, error, searchCafes, fetchTrendingFallback, isTrendingFallback, clearCache } = useMapData();

  const { showToast } = useToast();
  
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<CafeMapData | null>(null);

  const [trackingEnabled, setTrackingEnabled] = useState(false);

  const [forceCenterUpdate, setForceCenterUpdate] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  // Track last search location to prevent excessive API calls
  const lastSearchRef = useRef<{ lat: number; lng: number } | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const expansionAttemptedRef = useRef(false);
  const trendingFallbackAttemptedRef = useRef(false);

  const MIN_CAFE_COUNT = 9;
  const EXPANDED_RADIUS = 150000; // 150km

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
          // Center changed significantly — allow re-expansion for new area
          expansionAttemptedRef.current = false;
          trendingFallbackAttemptedRef.current = false;
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
          radius: Math.floor(Math.min(radius, 150000))
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
        expansionAttemptedRef.current = false;
        trendingFallbackAttemptedRef.current = false;

        // Initial load: 20km radius
        searchCafes({
          lat: newCenter.lat,
          lng: newCenter.lng,
          radius: 20000
        }, forceReload);
      }
    }
  }, [coords, searchCafes, clearCache]);

  // Progressive expansion: if initial 20km search returned < MIN_CAFE_COUNT, expand to 150km (once)
  useEffect(() => {
    // Guard: skip if loading, already attempted, no center, or no initial search done yet
    if (isLoading || expansionAttemptedRef.current || !center || !lastSearchRef.current) return;
    if (allCafes.length < MIN_CAFE_COUNT) {
      expansionAttemptedRef.current = true;
      searchCafes({
        lat: center.lat,
        lng: center.lng,
        radius: EXPANDED_RADIUS
      });
    }
  }, [allCafes.length, isLoading, center, searchCafes]);

  // Trending fallback: if 150km expansion returned 0 cafes, load global trending top 8
  useEffect(() => {
    if (isLoading || !expansionAttemptedRef.current || trendingFallbackAttemptedRef.current) return;
    if (allCafes.length === 0 && !isTrendingFallback) {
      trendingFallbackAttemptedRef.current = true;
      fetchTrendingFallback();
    }
  }, [allCafes.length, isLoading, isTrendingFallback, fetchTrendingFallback]);

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

  // Visit detection hook
  const { isTracking, nearbyStays, startTracking, stopTracking, permissionGranted } = useVisitDetection(
    allCafes,
    () => {},
    {
      enabled: trackingEnabled,
      minStayDuration: 0,
      maxStayDuration: 600000,
      proximityRadius: 50
    }
  );

  const handleCafeClick = useCallback(async (cafe: CafeMapData) => {
    setSelectedCafe(cafe);
    
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/cafes/${cafe.id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      // fetch only rejects on network failure, so a throttled or rejected view
      // looks like success unless the status is checked. 204 = deliberately dropped.
      if (!res.ok || res.status === 204) {
        console.error('Cafe view not recorded:', res.status, cafe.id);
      }
    } catch (error) {
      console.error('Failed to record cafe view:', error);
    }
  }, []);



  const handleRefreshCafes = useCallback(async () => {
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
  }, [center, clearCache, searchCafes, showToast, t]);
  

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header: Title/Subtitle on top, Controls below on small screens */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        {/* Left side: Title and Subtitle */}
        <div className="flex-1 min-w-0">
          {mapTitle && (
            <h2 className="mb-2 text-2xl text-ink-primary sm:whitespace-nowrap">
              {mapTitle}
            </h2>
          )}
          {mapSubtitle && (
            <p className="text-ink-secondary sm:whitespace-nowrap">
              {mapSubtitle}
            </p>
          )}
        </div>
        {/* Right side: Controls and Results Info */}
        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={handleRefreshCafes}
              className="relief-control flex min-h-11 shrink-0 items-center gap-2 rounded-(--radius-pill) border border-edge-rule px-4 text-ink-primary disabled:opacity-60"
              title={t('refresh_cafes')}
              disabled={isLoading}
            >
              <RefreshIcon className="w-4 h-4 shrink-0" />
              <span className="landing-micro whitespace-nowrap">{t('refresh')}</span>
            </button>
          </div>
          {/* Results Info - Compact */}
          <div className="mt-2 flex items-center gap-2 text-right text-ink-secondary">
            <span className="landing-micro">
              {t('cafes_on_map', { count: allCafes.length })}
              {isTracking && nearbyStays.length > 0 && (
                <span className="ml-2 text-ink-primary">
                  · {t('nearby_now', { count: nearbyStays.length })}
                </span>
              )}
            </span>
            <button
              onClick={handleLocationClick}
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
              title={t('location_button')}
              disabled={!coords}
            >
              <UserLocationIcon size={32} color="var(--marker-user)" />
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
          <div className="flex h-full items-center justify-center overflow-hidden rounded-(--radius-card) border border-edge-rule bg-surface-raised">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-ink-secondary mt-4 text-sm">{t('loading_location')}</p>
            </div>
          </div>
        ) : (
          <div className="relative h-full overflow-hidden rounded-(--radius-card) border border-edge-rule">
            <MapStatusBanner
              message={
                isLoading ? t('loading_cafes')
                : error ? t('search_error')
                : isTrendingFallback ? t('trending_fallback_banner')
                : null
              }
              busy={isLoading}
              onRetry={error && !isLoading ? handleRefreshCafes : undefined}
              retryLabel={t('retry')}
            />
            <InteractiveMap
              cafes={allCafes}
              center={center}
              zoom={14}
              userLocation={coords ? { lat: coords.latitude, lng: coords.longitude } : undefined}
              onMarkerClick={handleCafeClick}
              onBoundsChanged={isTrendingFallback ? undefined : handleBoundsChanged}
              forceCenterUpdate={forceCenterUpdate}
              fitToMarkers={isTrendingFallback}
            />
          </div>
        )}
      </div>



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
