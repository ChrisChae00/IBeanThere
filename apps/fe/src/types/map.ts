export interface CafeMapData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  address: string;
  isOpen?: boolean;
  phoneNumber?: string;
  website?: string;
}

export interface MapSearchParams {
  lat: number;
  lng: number;
  radius: number;
}

export interface CacheEntry {
  data: CafeMapData[];
  timestamp: number;
  location: { lat: number; lng: number };
  radius: number;
}

export interface GoogleMapProps {
  cafes: CafeMapData[];
  center: { lat: number; lng: number };
  zoom: number;
  onMarkerClick?: (cafe: CafeMapData) => void;
}

