'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { CafeMapData, MapProps, getMarkerState } from '@/types/map';
import { createCustomMarkerIcon, createUserLocationIcon, createSelectedLocationIcon, createClusterIcon, ClusterState } from '@/lib/markerStyles';
import { useTheme } from '@/contexts/ThemeContext';
import UserLocationIcon from '@/components/ui/UserLocationIcon';

function getCSSVariable(name: string, fallback: string = ''): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback;
  }
  return fallback;
}

// Fix for default marker icon in React Leaflet
// _getIconUrl is a private property in Leaflet types but exists at runtime
// We need to delete it to prevent SSR/hydration issues with default icons
if (typeof window !== 'undefined') {
  if ('_getIconUrl' in L.Icon.Default.prototype) {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  }
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function BoundsUpdater({ 
  onBoundsChanged 
}: { 
  onBoundsChanged?: (bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => void;
}) {
  const map = useMap();
  const lastBoundsRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      const bounds = map.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      const boundsKey = `${ne.lat.toFixed(4)}_${ne.lng.toFixed(4)}_${sw.lat.toFixed(4)}_${sw.lng.toFixed(4)}`;
      
      if (boundsKey === lastBoundsRef.current) {
        return;
      }
      
      lastBoundsRef.current = boundsKey;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (onBoundsChanged) {
          onBoundsChanged({
            ne: { lat: ne.lat, lng: ne.lng },
            sw: { lat: sw.lat, lng: sw.lng }
          });
        }
      }, 500);
    };

    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);

    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [map, onBoundsChanged]);

  return null;
}

function MapClickHandler({
  onMapClick
}: {
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng });
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onMapClick]);

  return null;
}

function MapCenterController({
  center,
  zoom,
  forceUpdate
}: {
  center: { lat: number; lng: number };
  zoom: number;
  forceUpdate?: boolean;
}) {
  const map = useMap();
  const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const newCenter = { lat: center.lat, lng: center.lng };
    
    if (forceUpdate) {
      map.setView([newCenter.lat, newCenter.lng], zoom, {
        animate: true,
        duration: 0.5
      });
      lastCenterRef.current = newCenter;
      return;
    }
    
    const currentCenter = map.getCenter();
    
    const isSamePosition = lastCenterRef.current &&
      Math.abs(lastCenterRef.current.lat - newCenter.lat) < 0.0001 &&
      Math.abs(lastCenterRef.current.lng - newCenter.lng) < 0.0001;
    
    if (isSamePosition) {
      return;
    }

    const isCurrentPosition = 
      Math.abs(currentCenter.lat - newCenter.lat) < 0.0001 &&
      Math.abs(currentCenter.lng - newCenter.lng) < 0.0001 &&
      Math.abs(map.getZoom() - zoom) < 0.1;

    if (!isCurrentPosition) {
      map.setView([newCenter.lat, newCenter.lng], zoom, {
        animate: true,
        duration: 0.5
      });
      lastCenterRef.current = newCenter;
    }
  }, [center, zoom, map, forceUpdate]);

  return null;
}

function ClusterLayer({
  cafes,
  onMarkerClick,
  map
}: {
  cafes: CafeMapData[];
  onMarkerClick?: (cafe: CafeMapData) => void;
  map: L.Map;
}) {
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const t = useTranslations('map');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (!map) return;

    if (!(L as any).MarkerClusterGroup) {
      console.error('MarkerClusterGroup not available. Make sure leaflet.markercluster is loaded.');
      return;
    }
    
    const clusterGroup = new (L as any).MarkerClusterGroup({
      chunkedLoading: true,
      animate: true,
      animateAddingMarkers: true,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: (zoom: number) => {
        if (zoom <= 10) return 80;
        if (zoom <= 15) return 65;
        return 50;
      },
      iconCreateFunction: (cluster: any) => {
        const markers = cluster.getAllChildMarkers();
        const count = markers.length;
        
        const cafes = markers.map((marker: L.Marker) => 
          (marker.options as any).cafeData as CafeMapData
        ).filter(Boolean);
        
        const hasVerified = cafes.some((cafe: CafeMapData) => cafe.status === 'verified');
        const state: ClusterState = hasVerified ? 'verified' : 'pending';
        
        return createClusterIcon(count, state);
      },
      onClusterClick: (event: any) => {
        const cluster = event.layer;
        const markers = cluster.getAllChildMarkers();
        
        if (markers.length === 1) {
          const cafe = (markers[0].options as any).cafeData as CafeMapData;
          if (cafe && onMarkerClick) {
            onMarkerClick(cafe);
          }
        }
      }
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
      markersRef.current.forEach(marker => {
        if (clusterGroupRef.current) {
          clusterGroupRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];
    };
  }, [map, onMarkerClick]);

  useEffect(() => {
    if (!clusterGroupRef.current) return;

    markersRef.current.forEach(marker => {
      clusterGroupRef.current!.removeLayer(marker);
    });
    markersRef.current = [];

    cafes.forEach((cafe) => {
      const markerState = getMarkerState(cafe);
      const marker = L.marker([cafe.latitude, cafe.longitude], {
        icon: createCustomMarkerIcon(markerState),
        cafeData: cafe
      } as any);

      marker.on('click', () => {
        onMarkerClick?.(cafe);
      });

      const verifiedText = t('verified');
      const navigatorText = t('navigator');
      const unknownText = tCommon('unknown');
      const checkInText = cafe.verification_count && cafe.verification_count > 1 ? t('check_ins') : t('check_in');
      
      const textSecondaryColor = getCSSVariable('--color-text-secondary', '#666');
      const borderColor = getCSSVariable('--color-border', '#e5e7eb');
      const primaryColor = getCSSVariable('--color-primary', '#3b82f6');
      
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${cafe.name}</h3>
          <p style="font-size: 14px; color: ${textSecondaryColor}; margin-bottom: 4px;">${cafe.address}</p>
          ${cafe.rating ? `<p style="font-size: 14px; margin-bottom: 4px;">⭐ ${cafe.rating.toFixed(1)}</p>` : ''}
          ${cafe.status === 'verified' ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${borderColor};">
              <p style="font-size: 12px; font-weight: 600; color: ${primaryColor};">${verifiedText}</p>
              ${cafe.foundingCrew?.navigator ? `<p style="font-size: 12px; color: ${textSecondaryColor};">${navigatorText}: ${cafe.foundingCrew.navigator.username || unknownText}</p>` : ''}
            </div>
          ` : ''}
          ${cafe.status === 'pending' && cafe.verification_count ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${borderColor};">
              <p style="font-size: 12px; color: ${textSecondaryColor};">${cafe.verification_count} ${checkInText}</p>
            </div>
          ` : ''}
          ${cafe.source_url ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${borderColor};">
              <a href="${cafe.source_url}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: ${primaryColor}; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                <span>📍</span>
                <span style="text-decoration: underline;">View on Google Maps</span>
              </a>
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      clusterGroupRef.current.addLayer(marker);
      markersRef.current.push(marker);
    });
  }, [cafes, onMarkerClick]);

  return null;
}

function MapContent({
  cafes,
  userLocation,
  selectedLocation,
  userMarkerPalette,
  onMarkerClick,
  onBoundsChanged,
  onMapClick,
  center,
  zoom,
  forceCenterUpdate,
  useClustering
}: {
  cafes: CafeMapData[];
  userLocation?: { lat: number; lng: number };
  selectedLocation?: { lat: number; lng: number };
  userMarkerPalette?: string;
  onMarkerClick?: (cafe: CafeMapData) => void;
  onBoundsChanged?: (bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => void;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
  center: { lat: number; lng: number };
  zoom: number;
  forceCenterUpdate?: boolean;
  useClustering: boolean;
}) {
  const map = useMap();
  const { currentTheme } = useTheme();
  const [markerKey, setMarkerKey] = useState(0);
  const t = useTranslations('map');
  
  useEffect(() => {
    setMarkerKey(prev => prev + 1);
  }, [currentTheme.name]);
  
  const selectedMarkerIcon = createSelectedLocationIcon(36);
  
  return (
    <>
      <MapCenterController center={center} zoom={zoom} forceUpdate={forceCenterUpdate} />
      {onBoundsChanged && <BoundsUpdater onBoundsChanged={onBoundsChanged} />}
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      {useClustering && <ClusterLayer cafes={cafes} onMarkerClick={onMarkerClick} map={map} />}
      {userLocation && (
        <Marker
          key={`user-${markerKey}`}
          position={[userLocation.lat, userLocation.lng]}
          icon={createUserLocationIcon(userMarkerPalette)}
        >
          <Popup>{t('current_location')}</Popup>
        </Marker>
      )}
      {selectedLocation && (
        <Marker
          key={`selected-${markerKey}`}
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={selectedMarkerIcon}
        >
          <Popup>{t('selected_location')}</Popup>
        </Marker>
      )}
    </>
  );
}

export default function InteractiveMap({
  cafes,
  center,
  zoom,
  userLocation,
  selectedLocation,
  userMarkerPalette,
  onMarkerClick,
  onBoundsChanged,
  onMapClick,
  forceCenterUpdate,
  onLocationClick
}: MapProps & { 
  forceCenterUpdate?: boolean;
  onLocationClick?: () => void;
}) {
  const t = useTranslations('map');
  const tCommon = useTranslations('common');
  const centerLatLng: [number, number] = [center.lat, center.lng];

  const shouldUseClustering = cafes.length >= 5;
  const displayCafes = shouldUseClustering ? [] : cafes;

  return (
    <div className="relative w-full h-full min-h-[500px] z-0">
      {/* Location button overlay on map */}
      {onLocationClick && (
        <button
          onClick={onLocationClick}
          className="absolute top-4 right-4 z-[1000] bg-transparent hover:opacity-80 transition-opacity flex items-center justify-center"
          title={t('location_button')}
        >
          <UserLocationIcon size={32} color="var(--color-text)" />
        </button>
      )}
      
      <MapContainer
        center={centerLatLng}
        zoom={zoom}
        className="h-full w-full rounded-xl"
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <MapContent 
          cafes={cafes} 
          userLocation={userLocation}
          selectedLocation={selectedLocation}
          userMarkerPalette={userMarkerPalette}
          onMarkerClick={onMarkerClick}
          onBoundsChanged={onBoundsChanged}
          onMapClick={onMapClick}
          center={center}
          zoom={zoom}
          forceCenterUpdate={forceCenterUpdate}
          useClustering={shouldUseClustering}
        />

        {displayCafes.map((cafe) => {
          const markerState = getMarkerState(cafe);
          return (
            <Marker
              key={cafe.id}
              position={[cafe.latitude, cafe.longitude]}
              icon={createCustomMarkerIcon(markerState)}
              eventHandlers={{
                click: () => {
                  onMarkerClick?.(cafe);
                }
              }}
            >
              <Popup>
                <div 
                  style={{
                    padding: '8px',
                    minWidth: '200px'
                  }}
                >
                  <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{cafe.name}</h3>
                  <p 
                    style={{ 
                      fontSize: '14px', 
                      color: getCSSVariable('--color-text-secondary', '#666'),
                      marginBottom: '4px'
                    }}
                  >
                    {cafe.address}
                  </p>
                  {cafe.rating && (
                    <p style={{ fontSize: '14px', marginBottom: '4px' }}>⭐ {cafe.rating.toFixed(1)}</p>
                  )}
                  {cafe.status === 'verified' && (
                    <div 
                      style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: `1px solid ${getCSSVariable('--color-border', '#e5e7eb')}`
                      }}
                    >
                      <p 
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: getCSSVariable('--color-primary', '#3b82f6')
                        }}
                      >
                        {t('verified')}
                      </p>
                      {cafe.foundingCrew?.navigator && (
                        <p 
                          style={{
                            fontSize: '12px',
                            color: getCSSVariable('--color-text-secondary', '#666')
                          }}
                        >
                          {t('navigator')}: {cafe.foundingCrew.navigator.username || tCommon('unknown')}
                        </p>
                      )}
                    </div>
                  )}
                  {cafe.status === 'pending' && cafe.verification_count && (
                    <div 
                      style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: `1px solid ${getCSSVariable('--color-border', '#e5e7eb')}`
                      }}
                    >
                      <p 
                        style={{
                          fontSize: '12px',
                          color: getCSSVariable('--color-text-secondary', '#666')
                        }}
                      >
                        {cafe.verification_count} {cafe.verification_count > 1 ? t('check_ins') : t('check_in')}
                      </p>
                    </div>
                  )}
                  {cafe.source_url && (
                    <div 
                      style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: `1px solid ${getCSSVariable('--color-border', '#e5e7eb')}`
                      }}
                    >
                      <a 
                        href={cafe.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          color: getCSSVariable('--color-primary', '#3b82f6'),
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>📍</span>
                        <span style={{ textDecoration: 'underline' }}>View on Google Maps</span>
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
