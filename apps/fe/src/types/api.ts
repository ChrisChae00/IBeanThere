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
    slug?: string;
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
    main_image?: string;
  }>;
  total_count: number;
  cache_hit?: boolean;
}

export interface TrendingCafeResponse {
  id: string;
  slug?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status?: 'pending' | 'verified' | 'disputed';
  view_count_14d: number;
  visit_count_14d: number;
  trending_score: number;
  trending_rank?: number;
  image?: string;
  main_image?: string;
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
  images?: string[];
  main_image_index?: number;
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
  existingCafe?: {
    id: string;
    name: string;
    slug?: string;
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface GooglePlacesLookupData {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  business_hours?: BusinessHoursData;
  google_maps_url?: string;
}

export interface GooglePlacesLookupResult {
  success: boolean;
  data?: GooglePlacesLookupData;
  error?: string;
  message?: string;
}

export interface LocationSearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

export interface CoffeeLog {
  id: string;
  cafe_id: string;
  user_id: string;
  visited_at: string;
  rating?: number;
  comment?: string;
  photo_urls?: string[];
  is_public: boolean;
  anonymous: boolean;
  coffee_type?: string;
  dessert?: string;
  price?: number;
  price_currency?: string;
  atmosphere_rating?: number;
  atmosphere_tags?: string[];
  parking_info?: string;
  acidity_rating?: number;
  body_rating?: number;
  sweetness_rating?: number;
  bitterness_rating?: number;
  aftertaste_rating?: number;
  bean_origin?: string;
  processing_method?: string;
  roast_level?: string;
  extraction_method?: string;
  extraction_equipment?: string;
  aroma_rating?: number;
  wifi_quality?: string;
  wifi_rating?: number;
  outlet_info?: string;
  furniture_comfort?: string;
  noise_level?: string;
  noise_rating?: number;
  temperature_lighting?: string;
  facilities_info?: string;
  author_display_name?: string;
  author_username?: string;
  author_avatar_url?: string;
  updated_at?: string;
}

export interface CafeDetailResponse {
  id: string;
  name: string;
  slug?: string;
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
  average_rating?: number;
  log_count: number;
  recent_logs?: CoffeeLog[];
  total_beans_dropped?: number;
  main_image?: string;
  images?: string[];
}

export interface CafeLogsResponse {
  logs: CoffeeLog[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface LogFormData {
  rating?: number;
  comment?: string;
  photo_urls?: string[];
  is_public: boolean;
  anonymous: boolean;
  coffee_type?: string;
  dessert?: string;
  price?: number;
  price_currency?: string;
  atmosphere_rating?: number;
  atmosphere_tags?: string[];
  parking_info?: string;
  acidity_rating?: number;
  body_rating?: number;
  sweetness_rating?: number;
  bitterness_rating?: number;
  aftertaste_rating?: number;
  bean_origin?: string;
  processing_method?: string;
  roast_level?: string;
  extraction_method?: string;
  extraction_equipment?: string;
  aroma_rating?: number;
  wifi_quality?: string;
  wifi_rating?: number;
  outlet_info?: string;
  furniture_comfort?: string;
  noise_level?: string;
  noise_rating?: number;
  temperature_lighting?: string;
  facilities_info?: string;
}

export interface FoundingStats {
  navigator_count: number;
  vanguard_count: number;
}

export type TasteTag = 
  | 'acidic' 
  | 'full_body' 
  | 'light_roast' 
  | 'dessert_lover'
  | 'work_friendly'
  | 'cozy'
  | 'roastery'
  | 'specialty';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  role?: string;
  founding_stats?: FoundingStats;
  taste_tags?: TasteTag[];
  trust_count?: number;
  is_trusted_by_me?: boolean;
  collections_public?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserPublicResponse {
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  founding_stats?: FoundingStats;
  taste_tags?: TasteTag[];
  trust_count?: number;
  collections_public?: boolean;
  created_at: string;
}

// =========================================================
// Community Types
// =========================================================

export interface TrustedUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  trust_count: number;
  trusted_at: string;
}

export interface CommunityFeedItem {
  id: string;
  cafe_id: string;
  cafe_name: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  visited_at: string;
  rating?: number;
  comment?: string;
  photo_urls?: string[];
  coffee_type?: string;
  like_count: number;
  is_liked_by_me: boolean;
}

export interface CommunityFeedResponse {
  items: CommunityFeedItem[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface BadgeInfo {
  code: string;
  name: string;
  description: string;
  icon_url?: string;
}

export interface UserBadge {
  badge_code: string;
  awarded_at: string;
}

export type BadgeResponse = UserBadge;

// =========================================================
// Collection Types
// =========================================================

export type CollectionIconType = 'favourite' | 'save_later' | 'custom';

export interface CafePreview {
  id: string;
  name: string;
  main_image?: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon_type: CollectionIconType;
  color?: string;
  is_public: boolean;
  share_token?: string;
  position: number;
  item_count: number;
  preview_cafes?: CafePreview[];
  created_at: string;
  updated_at?: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  cafe_id: string;
  cafe_name: string;
  cafe_slug?: string;
  cafe_address?: string;
  cafe_main_image?: string;
  cafe_latitude?: number;
  cafe_longitude?: number;
  note?: string;
  added_at: string;
}

export interface CollectionDetail extends Collection {
  items: CollectionItem[];
}

export interface CollectionCreateRequest {
  name: string;
  description?: string;
  icon_type?: CollectionIconType;
  color?: string;
  is_public?: boolean;
}

export interface CollectionUpdateRequest {
  name?: string;
  description?: string;
  icon_type?: CollectionIconType;
  color?: string;
  is_public?: boolean;
}

export interface CafeSaveStatus {
  is_favourited: boolean;
  is_saved: boolean;
  saved_collection_ids: string[];
}

export interface QuickSaveResponse {
  action: 'added' | 'removed';
  collection_id: string;
}

export interface ShareTokenResponse {
  share_token: string;
  share_url: string;
}


