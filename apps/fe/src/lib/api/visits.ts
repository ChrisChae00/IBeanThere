import { CafeMapData, CheckInResult } from '@/types/map';
import { recordVisit as recordVisitUtil, checkDuplicateVisit as checkDuplicateUtil } from '@/lib/utils/checkIn';
import { API_BASE_URL } from './client';

export async function checkIn(
  cafe: CafeMapData,
  userLat: number,
  userLng: number,
  userId: string
): Promise<CheckInResult> {
  return await recordVisitUtil(cafe, userLat, userLng, userId);
}

export async function checkDuplicateVisit(
  cafeId: string,
  userId: string
): Promise<boolean> {
  return await checkDuplicateUtil(cafeId, userId);
}

export interface VisitRecord {
  id: string;
  cafe_id: string;
  user_id: string;
  visited_at: string;
  check_in_lat?: number;
  check_in_lng?: number;
  distance_meters?: number;
  duration_minutes?: number;
  auto_detected: boolean;
  confirmed: boolean;
  has_review: boolean;
  has_photos: boolean;
}

export async function getVisitsByCafe(
  cafeId: string,
  userId?: string,
  date?: string
): Promise<VisitRecord[]> {
  try {
    let url = `${API_BASE_URL}/api/v1/cafes/${cafeId}/visits`;
    
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (date) params.append('date', date);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch visits');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching visits:', error);
    return [];
  }
}

