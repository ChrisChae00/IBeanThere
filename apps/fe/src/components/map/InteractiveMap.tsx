'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { CafeMapData, GoogleMapProps } from '@/types/map';
import CoffeeBean from '@/components/ui/CoffeeBean';

export default function InteractiveMap({ 
  cafes, 
  center, 
  zoom, 
  onMarkerClick 
}: GoogleMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Callback ref - this is called when the element is mounted
  const setContainerRef = (element: HTMLDivElement | null) => {
    containerRef.current = element;
    
    if (element && !map) {
      const initMap = async () => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          setError('Google Maps API key is not configured');
          setIsLoading(false);
          return;
        }

        try {
          const loader = new Loader({
            apiKey,
            version: 'weekly',
            libraries: ['places']
          });

          const { Map } = await loader.importLibrary('maps');
          
          const mapInstance = new Map(element, {
            center,
            zoom,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false
          });
          
          setMap(mapInstance);
          setIsLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load map');
          setIsLoading(false);
        }
      };

      initMap();
    }
  };

  // Update map center when center prop changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  useEffect(() => {
    if (!map || !cafes.length) {
      return;
    }

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Create markers for each cafe
    cafes.forEach(cafe => {
      const marker = new google.maps.Marker({
        position: { lat: cafe.latitude, lng: cafe.longitude },
        map,
        title: cafe.name
      });

      // Escape HTML to prevent XSS attacks
      const escapeHtml = (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${escapeHtml(cafe.name)}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${escapeHtml(cafe.address)}</p>
            ${cafe.rating ? `<p style="margin: 0; font-size: 14px;">⭐ ${cafe.rating.toFixed(1)}</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onMarkerClick?.(cafe);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit bounds to show all cafes
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      map.fitBounds(bounds);
    }
  }, [map, cafes, onMarkerClick]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-[var(--color-surface)] rounded-xl">
        <div className="text-center">
          <div className="animate-spin mb-2 flex justify-center">
            <CoffeeBean size="lg" />
          </div>
          <p className="text-[var(--color-text-secondary)]">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden" style={{ minHeight: '500px' }}>
      <div 
        ref={setContainerRef}
        className="w-full h-full min-h-[500px]" 
        style={{ minHeight: '500px', width: '100%', height: '100%' }}
      >
      {isLoading && (
        <div className="flex items-center justify-center h-full bg-[var(--color-surface)]">
          <div className="text-center">
            <div className="animate-spin mb-2 flex justify-center">
              <CoffeeBean size="lg" />
            </div>
            <p className="text-[var(--color-text-secondary)]">Initializing map...</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
