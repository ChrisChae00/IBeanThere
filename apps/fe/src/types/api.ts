export interface CafeSearchResponse {
  cafes: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    rating?: number;
    address: string;
    phone_number?: string;
    website?: string;
    status?: 'pending' | 'verified' | 'disputed';
    verification_count?: number;
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
  cache_hit?: boolean;
}

