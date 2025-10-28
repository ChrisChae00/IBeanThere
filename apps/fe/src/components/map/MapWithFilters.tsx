'use client';

import { useState, useEffect } from 'react';
import InteractiveMap from './InteractiveMap';
import VisitConfirmation from '../visits/VisitConfirmation';
import { useLocation } from '@/hooks/useLocation';
import { useMapData } from '@/hooks/useMapData';
import { useVisitDetection } from '@/hooks/useVisitDetection';
import { CafeMapData } from '@/types/map';

interface MapWithFiltersProps {
  locale: string;
}

export default function MapWithFilters({ locale }: MapWithFiltersProps) {
  const { coords, getCurrentLocation, getDefaultLocation, error: locationError } = useLocation();
  const { cafes, isLoading, error, searchCafes } = useMapData();
  const [center, setCenter] = useState(getDefaultLocation());
  const [selectedCafe, setSelectedCafe] = useState<CafeMapData | null>(null);
  const [pendingVisit, setPendingVisit] = useState<{ cafe: CafeMapData; duration: number } | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  // Request user location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Update center when user location is obtained
  useEffect(() => {
    if (coords) {
      const newCenter = { lat: coords.latitude, lng: coords.longitude };
      setCenter(newCenter);
    }
  }, [coords]);

  // Search cafes when center changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCafes({
        lat: center.lat,
        lng: center.lng,
        radius: 2000
      });
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [center, searchCafes]);

  // Visit detection hook
  const { isTracking, nearbyStays, startTracking, stopTracking, permissionGranted } = useVisitDetection(
    cafes,
    (cafe, duration) => {
      setPendingVisit({ cafe, duration });
    },
    {
      enabled: trackingEnabled,
      minStayDuration: 300000, // 5 minutes
      maxStayDuration: 600000  // 10 minutes
    }
  );

  const handleLocationClick = async () => {
    await getCurrentLocation();
  };

  const handleCafeClick = async (cafe: CafeMapData) => {
    setSelectedCafe(cafe);
    
    // Record cafe view
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

  const handleVisitConfirm = async (cafe: CafeMapData, duration: number) => {
    // TODO: Get user_id from auth context when auth is ready
    const userId = 'temp-user-id';
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Get current location for check-in
      if (coords) {
        await fetch(`${apiUrl}/api/v1/cafes/${cafe.id}/visit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cafe_id: cafe.id,
            check_in_lat: coords.latitude,
            check_in_lng: coords.longitude,
            duration_minutes: duration,
            auto_detected: true,
            confirmed: true
          })
        });
        
        console.log(`✅ Visit confirmed for ${cafe.name}`);
      }
    } catch (error) {
      console.error('Failed to record visit:', error);
    }
    
    setPendingVisit(null);
  };

  const handleVisitDismiss = () => {
    setPendingVisit(null);
  };

  const toggleTracking = () => {
    if (trackingEnabled) {
      stopTracking();
      setTrackingEnabled(false);
    } else {
      startTracking();
      setTrackingEnabled(true);
    }
  };

  return (
    <div className="relative h-full min-h-[500px] flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleLocationClick}
          className="bg-[var(--color-surface)] text-[var(--color-text)] px-4 py-2 rounded-lg shadow-lg hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2 text-sm font-medium min-h-[44px]"
        >
          <span>📍</span> Current Location
        </button>
        
        <button
          onClick={toggleTracking}
          className={`
            px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2 text-sm font-medium min-h-[44px]
            ${isTracking 
              ? 'bg-[var(--color-primary)] text-white' 
              : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
            }
          `}
        >
          <span>{isTracking ? '✓' : '🎯'}</span>
          {isTracking ? 'Tracking Visits' : 'Track Visits'}
        </button>
        
        {isTracking && nearbyStays.length > 0 && (
          <div className="bg-[var(--color-surface)] text-[var(--color-text)] px-3 py-2 rounded-lg shadow-lg text-xs">
            Near {nearbyStays.length} cafe{nearbyStays.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[450px]">
        <InteractiveMap
          cafes={cafes}
          center={center}
          zoom={14}
          onMarkerClick={handleCafeClick}
        />
      </div>

      {/* Visit Confirmation */}
      {pendingVisit && (
        <VisitConfirmation
          cafe={pendingVisit.cafe}
          duration={pendingVisit.duration}
          onConfirm={handleVisitConfirm}
          onDismiss={handleVisitDismiss}
        />
      )}
    </div>
  );
}

