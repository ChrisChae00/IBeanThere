import { isTemporarilyClosed } from '@/lib/utils/businessHours';

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

/*
  The days a shop keeps, and one thing that is not a day.

  "Temporarily closed" is a state of the whole shop, not of a Tuesday, but it is stored
  in this same blob under `temporarily_closed` -- the API passes `business_hours` through
  untouched, so saying it here costs no column and no migration. The index signature
  stays day-shaped on purpose: every reader indexes by day name, and widening it to
  `DayHours | boolean` would make each of them narrow a value that is always a day.
  `lib/utils/businessHours.ts` owns the one cast that reads the flag -- go through
  `isTemporarilyClosed` and `dayHourEntries` rather than touching the key directly.
*/
export interface BusinessHours {
  [day: string]: DayHours;
}

export type CafeTraitId = 'sells_beans' | 'roasts_on_site' | 'filter_coffee';

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
  source_type?: string;
  source_url?: string;
  businessHours?: BusinessHours;
  timezone?: string;
  status?: 'pending' | 'verified' | 'disputed';
  verification_count?: number;
  foundingCrew?: {
    navigator?: {
      user_id: string;
      username?: string;
    };
  };
  main_image?: string;
  /* Derived server-side from coffee-trait observations; absent until the API says. */
  trait_flags?: Partial<Record<CafeTraitId, boolean>>;
}

export type CafeMarkerState = 'pending-1' | 'pending-2' | 'verified' | 'temporarily-closed';

/*
  Closed for now outranks verified: a reader scanning the map is deciding where to walk,
  and a shop that is shut is the wrong answer however well confirmed it is.
*/
export function getMarkerState(cafe: CafeMapData): CafeMarkerState {
  if (isTemporarilyClosed(cafe.businessHours)) {
    return 'temporarily-closed';
  }
  if (cafe.status === 'verified') {
    return 'verified';
  }
  const count = cafe.verification_count || 1;
  return count === 1 ? 'pending-1' : 'pending-2';
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

