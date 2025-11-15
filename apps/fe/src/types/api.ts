export interface BusinessHoursData {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface CafeSearchResponse {
  cafes: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    rating?: number;
    address: string;
    phone?: string;
    website?: string;
    description?: string;
    source_url?: string;
    business_hours?: BusinessHoursData;
    status: 'pending' | 'verified' | 'disputed';
    verification_count: number;
    verified_at?: string;
    admin_verified?: boolean;
    navigator_id?: string;
    vanguard_ids?: string[];
    created_at: string;
    updated_at?: string;
    founding_crew?: {
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
  }>;
  total_count: number;
  cache_hit?: boolean;
}

export interface TrendingCafeResponse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  view_count_14d: number;
  visit_count_14d: number;
  trending_score: number;
  trending_rank?: number;
}

export interface CafeRegistrationRequest {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  postcode?: string;
  source_url?: string;
  business_hours?: BusinessHoursData;
  user_location?: {
    lat: number;
    lng: number;
  };
  source_type?: 'google_url' | 'map_click' | 'manual' | 'postcode';
}

export interface CafeRegistrationResponse {
  success: boolean;
  cafe?: {
    id: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    status: string;
    verification_count: number;
  };
  check_in?: {
    cafe_id: string;
    user_id: string;
    checkin_order: number;
    founding_role: string;
    triggered_verification: boolean;
  };
  message?: string;
  error?: string;
  existingCafe?: any;
}

export interface LocationSearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

