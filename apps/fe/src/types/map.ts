export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface CafeMapData {
  id: string;
  name: string;
  slug?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  address: string;
  isOpen?: boolean;
  phoneNumber?: string;
  website?: string;
  source_url?: string;
  businessHours?: BusinessHours;
  status?: 'pending' | 'verified' | 'disputed';
  verification_count?: number;
  foundingCrew?: {
    navigator?: {
      user_id: string;
      username?: string;
    };
    vanguard?: Array<{
      user_id: string;
      username?: string;
      role: 'vanguard_2nd' | 'vanguard_3rd';
    }>;
  };
  main_image?: string;
}

export type CafeMarkerState = 'pending-1' | 'pending-2' | 'verified';

export function getMarkerState(cafe: CafeMapData): CafeMarkerState {
  if (cafe.status === 'verified') {
    return 'verified';
  }
  const count = cafe.verification_count || 1;
  return count === 1 ? 'pending-1' : 'pending-2';
}

export interface FranchiseFilter {
  showFranchises: boolean;
  blockedFranchises: string[];
  preferredFranchises: string[];
  filterMode: 'all' | 'local' | 'preferred';
}

export interface MapControlCallbacks {
  onLocationClick: () => void;
  onToggleTracking: () => void;
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

export interface MapProps {
  cafes: CafeMapData[];
  center: { lat: number; lng: number };
  zoom: number;
  userLocation?: { lat: number; lng: number };
  selectedLocation?: { lat: number; lng: number };
  userMarkerPalette?: string;
  onMarkerClick?: (cafe: CafeMapData) => void;
  onBoundsChanged?: (bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => void;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
}

export interface NearbyCafe extends CafeMapData {
  distance: number;
}

export interface CheckInResult {
  success: boolean;
  visitId?: string;
  message?: string;
  error?: string;
}

