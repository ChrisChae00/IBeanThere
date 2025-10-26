'use client';

import { useState, useEffect } from 'react';
import InteractiveMap from './InteractiveMap';
import { useLocation } from '@/hooks/useLocation';
import { useMapData } from '@/hooks/useMapData';
import { CafeMapData } from '@/types/map';

interface MapWithFiltersProps {
  locale: string;
}

export default function MapWithFilters({ locale }: MapWithFiltersProps) {
  const { coords, getCurrentLocation, getDefaultLocation, error: locationError } = useLocation();
  const { cafes, isLoading, error, searchCafes } = useMapData();
  const [center, setCenter] = useState(getDefaultLocation());
  const [selectedCafe, setSelectedCafe] = useState<CafeMapData | null>(null);

  // Update center when user location is obtained
  useEffect(() => {
    if (coords) {
      const newCenter = { lat: coords.latitude, lng: coords.longitude };
      setCenter(newCenter);
    }
  }, [coords]);

  // Initial search with center location
  useEffect(() => {
    searchCafes({
      lat: center.lat,
      lng: center.lng,
      radius: 2000
    });
  }, [center.lat, center.lng, searchCafes]);

  const handleLocationClick = async () => {
    await getCurrentLocation();
  };

  const handleCafeClick = (cafe: CafeMapData) => {
    setSelectedCafe(cafe);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-[var(--color-surface)] rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-[var(--color-text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[500px] flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleLocationClick}
          className="bg-[var(--color-surface)] text-[var(--color-text)] px-4 py-2 rounded-lg shadow-lg hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <span>📍</span> Current Location
        </button>
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
    </div>
  );
}

