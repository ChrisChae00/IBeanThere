'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { CafeMapData, MapProps, getMarkerState } from '@/types/map';
import { createCustomMarkerIcon, createUserLocationIcon, createSelectedLocationIcon, createClusterIcon, ClusterState } from '@/lib/markerStyles';
import { UserLocationIcon } from '@/shared/ui';

// ─── Map Resize Handler ─────────────────────────────────────

/** Tailwind `lg` breakpoint — matches the 2-column grid in explore-map */
/**
 * Watches the map container for size changes and calls `map.invalidateSize()` so
 * Leaflet re-renders tiles to fill the new dimensions.
 *
 * Observed at every width, not only in the two-column layout: the map's height is
 * viewport-relative on a phone (`45svh`, which changes when the browser's own chrome
 * collapses) and settles a frame or two after mount inside a flex column. A map that
 * measured itself once keeps requesting tiles for the size it had then, which is what
 * leaves the grey L-shape around whatever did load.
 */
function MapResizeHandler() {
  const map = useMap();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const invalidate = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      map.invalidateSize({ animate: false, pan: false });
    }, 150);
  }, [map]);

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    // The dynamic import can settle after the first measurement.
    const initialTimer = setTimeout(() => {
      map.invalidateSize({ animate: false, pan: false });
    }, 300);

    const observer = new ResizeObserver(() => invalidate());
    observer.observe(container);

    return () => {
      clearTimeout(initialTimer);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      observer.disconnect();
    };
  }, [map, invalidate]);

  return null;
}

// ─── Utilities ──────────────────────────────────────────────

/*
  Every marker on this map supplies its own divIcon, so Leaflet's default icon is never
  reached. The old override pointed it at unpkg, which the app's CSP img-src blocks —
  deleting the override is the fix, not allowlisting a CDN we do not use.
*/

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
  map,
  selectedCafeId
}: {
  cafes: CafeMapData[];
  onMarkerClick?: (cafe: CafeMapData) => void;
  map: L.Map;
  selectedCafeId?: string | null;
}) {
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  /* The selected pin has to be repainted without rebuilding every marker, so the
     markers are addressable by cafe id. */
  const markersByIdRef = useRef<Map<string, L.Marker>>(new Map());

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
      disableClusteringAtZoom: 16,
      maxClusterRadius: (zoom: number) => {
        if (zoom <= 8) return 80;
        if (zoom <= 10) return 65;
        if (zoom <= 12) return 50;
        if (zoom <= 14) return 35;
        return 20;
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
      }
    });

    clusterGroup.on('clusterclick', (event: any) => {
      const cluster = event.layer;
      const markers = cluster.getAllChildMarkers();
      if (markers.length === 1) {
        const cafe = (markers[0].options as any).cafeData as CafeMapData;
        if (cafe && onMarkerClick) {
          onMarkerClick(cafe);
        }
      }
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
      markersRef.current = [];
    };
  }, [map, onMarkerClick]);

  useEffect(() => {
    if (!clusterGroupRef.current) return;

    clusterGroupRef.current.clearLayers();
    markersRef.current = [];
    markersByIdRef.current.clear();

    const newMarkers: L.Marker[] = [];

    cafes.forEach((cafe) => {
      const markerState = getMarkerState(cafe);
      const marker = L.marker([cafe.latitude, cafe.longitude], {
        icon: createCustomMarkerIcon(markerState, cafe.id === selectedCafeId),
        cafeData: cafe
      } as any);

      marker.on('click', () => {
        onMarkerClick?.(cafe);
      });

      /* No `bindPopup`: the details open in the panel anchored beside the pin, and a
         Leaflet popup on top of it was a second card saying the same thing. */
      newMarkers.push(marker);
      markersByIdRef.current.set(cafe.id, marker);
    });

    clusterGroupRef.current.addLayers(newMarkers);
    markersRef.current = newMarkers;
    // `selectedCafeId` is deliberately not a dependency: selecting a pin repaints two
    // icons below, rather than rebuilding every marker on the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafes, onMarkerClick]);

  useEffect(() => {
    markersByIdRef.current.forEach((marker, id) => {
      const cafe = (marker.options as any).cafeData as CafeMapData;
      marker.setIcon(createCustomMarkerIcon(getMarkerState(cafe), id === selectedCafeId));
      if (id === selectedCafeId) marker.setZIndexOffset(1000);
      else marker.setZIndexOffset(0);
    });
  }, [selectedCafeId, cafes]);

  return null;
}

/*
  A full-width map on a phone is a scroll trap: every drag over it pans the map, so the
  page under it can never be reached. The fix is the one Google's own embeds use — the
  map does not take a gesture until the reader shows they meant it for the map.

    one finger   -> the page scrolls, and a hint says how to move the map
    two fingers  -> the map pans
    tap          -> still places the pin, which is what this page is for
    wheel        -> scrolls the page; only ctrl/cmd + wheel zooms

  Leaflet's own handlers are toggled rather than the events being swallowed, so the map
  keeps its inertia, its double-tap zoom and its keyboard panning.
*/
function GestureGate({ onHint }: { onHint: (visible: boolean) => void }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    /* The wheel rule is worth having on a desktop too: a tall page with a map in it
       otherwise stops scrolling wherever the pointer happens to be. */
    map.scrollWheelZoom.disable();
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
      }
    };
    container.addEventListener('wheel', onWheel, { passive: true });

    if (!isTouch) {
      return () => {
        container.removeEventListener('wheel', onWheel);
      };
    }

    map.dragging.disable();

    let hintTimer: ReturnType<typeof setTimeout> | undefined;
    const showHint = () => {
      onHint(true);
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => onHint(false), 1600);
    };

    let touchStartedAt: { x: number; y: number } | null = null;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length >= 2) {
        map.dragging.enable();
        clearTimeout(hintTimer);
        onHint(false);
        return;
      }
      map.dragging.disable();
      /* A tap is not a drag attempt, so the hint waits to see whether the finger moves. */
      touchStartedAt = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1 || !touchStartedAt) return;
      const moved =
        Math.abs(event.touches[0].clientX - touchStartedAt.x) +
        Math.abs(event.touches[0].clientY - touchStartedAt.y);
      if (moved > 12) showHint();
    };

    const onTouchEnd = () => {
      touchStartedAt = null;
      map.dragging.disable();
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      clearTimeout(hintTimer);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    };
  }, [map, onHint]);

  return null;
}

function MapContent({
  cafes,
  userLocation,
  selectedLocation,
  onMarkerClick,
  onBoundsChanged,
  onMapClick,
  center,
  zoom,
  forceCenterUpdate,
  fitToMarkers,
  selectedCafe,
  onSelectedPointChange
}: {
  cafes: CafeMapData[];
  userLocation?: { lat: number; lng: number };
  selectedLocation?: { lat: number; lng: number };
  onMarkerClick?: (cafe: CafeMapData) => void;
  selectedCafe?: CafeMapData | null;
  onSelectedPointChange?: (point: { x: number; y: number } | null) => void;
  onBoundsChanged?: (bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => void;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
  center: { lat: number; lng: number };
  zoom: number;
  forceCenterUpdate?: boolean;
  fitToMarkers?: boolean;
}) {
  const map = useMap();
  const t = useTranslations('map');

  useEffect(() => {
    if (!fitToMarkers || cafes.length === 0) return;
    const bounds = L.latLngBounds(cafes.map(c => [c.latitude, c.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [fitToMarkers, cafes, map]);

  /*
    A tapped pin moves to a known place -- against the left edge, halfway down -- so the
    card that opens has the rest of the frame to fill and the pin is never underneath it.
    Same move on a phone; only the card's placement differs there.
  */
  const selectedId = selectedCafe?.id;
  const selectedLat = selectedCafe?.latitude;
  const selectedLng = selectedCafe?.longitude;
  useEffect(() => {
    if (selectedLat === undefined || selectedLng === undefined) return;

    const size = map.getSize();
    const target = L.point(Math.max(size.x * 0.18, 72), size.y * 0.5);
    const delta = map.latLngToContainerPoint([selectedLat, selectedLng]).subtract(target);
    if (Math.abs(delta.x) > 2 || Math.abs(delta.y) > 2) {
      map.panBy(delta, { animate: true });
    }
    // Only when the selection changes: panning re-runs this effect through `map` moves
    // otherwise, and the pin would be dragged back every time the reader moved the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  /*
    The details panel is positioned in the map's own pixel space, so it has to be told
    where the pin is now -- after every pan, zoom and resize, not only on the click.
  */
  useEffect(() => {
    if (!onSelectedPointChange) return;
    if (!selectedCafe) {
      onSelectedPointChange(null);
      return;
    }

    const report = () => {
      const point = map.latLngToContainerPoint([selectedCafe.latitude, selectedCafe.longitude]);
      onSelectedPointChange({ x: point.x, y: point.y });
    };

    report();
    map.on('move zoom resize', report);
    return () => {
      map.off('move zoom resize', report);
    };
  }, [map, selectedCafe, onSelectedPointChange]);

  const selectedMarkerIcon = createSelectedLocationIcon(36);

  return (
    <>
      <MapResizeHandler />
      <MapCenterController center={center} zoom={zoom} forceUpdate={forceCenterUpdate} />
      {onBoundsChanged && <BoundsUpdater onBoundsChanged={onBoundsChanged} />}
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      <ClusterLayer
        cafes={cafes}
        onMarkerClick={onMarkerClick}
        map={map}
        selectedCafeId={selectedCafe?.id ?? null}
      />
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={createUserLocationIcon()}
        >
          <Popup>{t('current_location')}</Popup>
        </Marker>
      )}
      {selectedLocation && (
        <Marker
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
  onMarkerClick,
  onBoundsChanged,
  onMapClick,
  forceCenterUpdate,
  fitToMarkers,
  onLocationClick,
  selectedCafe,
  onSelectedPointChange
}: MapProps & {
  forceCenterUpdate?: boolean;
  fitToMarkers?: boolean;
  onLocationClick?: () => void;
  selectedCafe?: CafeMapData | null;
  onSelectedPointChange?: (point: { x: number; y: number } | null) => void;
}) {
  const t = useTranslations('map');
  const centerLatLng: [number, number] = [center.lat, center.lng];
  const [gestureHint, setGestureHint] = useState(false);

  return (
    /*
      Shorter than the viewport on a phone, so there is always page above and below the
      map to scroll by hand; the 500px floor returns once there is room for it.
    */
    <div className="relative z-0 h-full min-h-[45svh] w-full sm:min-h-[500px]">
      {/* Location button overlay on map */}
      {onLocationClick && (
        <button
          onClick={onLocationClick}
          className="absolute top-4 right-4 z-(--z-map-chrome) bg-transparent hover:opacity-80 transition-opacity flex items-center justify-center"
          title={t('location_button')}
        >
          <UserLocationIcon size={32} color="var(--color-text)" />
        </button>
      )}
      
      <MapContainer
        center={centerLatLng}
        zoom={zoom}
        maxZoom={19}
        /* The frame owns the corner; a hardcoded radius here fights every panel it sits in. */
        className="h-full w-full rounded-[inherit]"
        /* Off at mount; `GestureGate` turns it on for ctrl/cmd + wheel only. */
        scrollWheelZoom={false}
        zoomControl={true}
        style={{ zIndex: 0 }}
      >
        {/*
          The OSM Foundation runs these tiles for its own services; a third-party app
          living on them is against the tile usage policy, and the limit is per IP —
          which means one shared campus or office network, not one user. Swap this URL
          for a real provider before launch. See docs/HANDOFF.md §4.14.
        */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <GestureGate onHint={setGestureHint} />

        <MapContent 
          cafes={cafes} 
          userLocation={userLocation}
          selectedLocation={selectedLocation}
          onMarkerClick={onMarkerClick}
          onBoundsChanged={onBoundsChanged}
          onMapClick={onMapClick}
          center={center}
          zoom={zoom}
          forceCenterUpdate={forceCenterUpdate}
          fitToMarkers={fitToMarkers}
          selectedCafe={selectedCafe}
          onSelectedPointChange={onSelectedPointChange}
        />

        <MapGestureHint visible={gestureHint} label={t('gesture_hint')} />
      </MapContainer>
    </div>
  );
}

/*
  Inside the map so it is clipped by the frame, and `pointer-events-none` so it never
  eats the gesture it is explaining.
*/
function MapGestureHint({ visible, label }: { visible: boolean; label: string }) {
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none absolute inset-0 z-(--z-map-chrome) flex items-center justify-center bg-scrim-media/60 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <p className="landing-micro rounded-(--radius-pill) bg-surface-raised px-4 py-2 text-ink-primary">
        {label}
      </p>
    </div>
  );
}
