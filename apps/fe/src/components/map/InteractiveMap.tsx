'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { CafeMapData, GoogleMapProps } from '@/types/map';
import CoffeeBean from '@/components/ui/CoffeeBean';

export default function InteractiveMap({ 
  cafes, 
  center, 
  zoom, 
  onMarkerClick 
}: GoogleMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainer(node);
    }
  }, []);

  useEffect(() => {
    if (!container || mapRef.current) {
      return;
    }

    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('Missing Google Maps API key');
        setError('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'marker']
        });

        const { Map } = await loader.importLibrary('maps');
        
        const mapInstance = new Map(container, {
          center,
          zoom,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          mapId: 'IBEANTHERE_MAP'
        });
        
        mapRef.current = mapInstance;
        setIsLoading(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, [container, center, zoom]);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current || !cafes.length) {
      return;
    }

    const createMarkers = async () => {
      // Clear existing clusterer
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }

      // Clear existing markers
      markers.forEach(marker => {
        marker.map = null;
      });

      try {
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
        const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

        // Create markers for each cafe
        cafes.forEach(cafe => {
          const pin = new PinElement({
            background: '#8B4513',
            borderColor: '#5D2E0F',
            glyphColor: '#FFFFFF',
            scale: 1.2
          });

          const marker = new AdvancedMarkerElement({
            map: mapRef.current!,
            position: { lat: cafe.latitude, lng: cafe.longitude },
            title: cafe.name,
            content: pin.element
          });

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
            infoWindow.open(mapRef.current!, marker);
            onMarkerClick?.(cafe);
          });

          newMarkers.push(marker);
        });

        setMarkers(newMarkers);

        // Create or update marker clusterer (only if we have many cafes)
        if (newMarkers.length > 10 && mapRef.current) {
          if (!markerClustererRef.current) {
            markerClustererRef.current = new MarkerClusterer({
              map: mapRef.current,
              markers: newMarkers,
            });
          } else {
            markerClustererRef.current.clearMarkers();
            markerClustererRef.current.addMarkers(newMarkers);
          }
        }

        // Fit bounds only on initial load, not on every marker click
        // This prevents zooming out when clicking on markers
      } catch (err) {
        console.error('Error creating markers:', err);
      }
    };

    createMarkers();
  }, [cafes, onMarkerClick]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Map Container - Always rendered so ref can be set */}
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full rounded-xl overflow-hidden" 
      />
      
      {/* Loading/Error Overlay */}
      {(isLoading || error) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)] rounded-xl z-10">
          {error ? (
            <div className="text-center px-4">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-[var(--color-text)] font-semibold mb-2">Map Error</p>
              <p className="text-[var(--color-text-secondary)] text-sm">{error}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-spin mb-2 flex justify-center">
                <CoffeeBean size="lg" />
              </div>
              <p className="text-[var(--color-text-secondary)]">Loading map...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
