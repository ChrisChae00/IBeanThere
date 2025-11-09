import { CafeMapData, CheckInResult } from '@/types/map';

const EARTH_RADIUS_METERS = 6371000;
const MAX_CHECK_IN_DISTANCE = 50; // 50 meters

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function validateInitialDistance(
  userLat: number,
  userLng: number,
  cafeLat: number,
  cafeLng: number,
  maxDistance: number = MAX_CHECK_IN_DISTANCE
): { valid: boolean; distance: number; message?: string } {
  const distance = calculateDistance(userLat, userLng, cafeLat, cafeLng);
  
  if (distance > maxDistance) {
    return {
      valid: false,
      distance,
      message: `You must be within ${maxDistance}m of the cafe to check in. Current distance: ${Math.round(distance)}m`
    };
  }
  
  return {
    valid: true,
    distance
  };
}

export async function checkDuplicateVisit(
  cafeId: string,
  userId: string
): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch(
      `${apiUrl}/api/v1/cafes/${cafeId}/visits?user_id=${userId}&date=${today}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      return false;
    }
    
    const visits = await response.json();
    return visits && visits.length > 0;
  } catch (error) {
    console.error('Error checking duplicate visit:', error);
    return false;
  }
}

export async function recordVisit(
  cafe: CafeMapData,
  userLat: number,
  userLng: number,
  userId: string
): Promise<CheckInResult> {
  try {
    const validation = validateInitialDistance(
      userLat,
      userLng,
      cafe.latitude,
      cafe.longitude
    );
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.message
      };
    }
    
    const isDuplicate = await checkDuplicateVisit(cafe.id, userId);
    
    if (isDuplicate) {
      return {
        success: false,
        error: 'You have already checked in to this cafe today'
      };
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(
      `${apiUrl}/api/v1/cafes/${cafe.id}/visit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cafe_id: cafe.id,
          check_in_lat: userLat,
          check_in_lng: userLng,
          distance_meters: Math.round(validation.distance),
          auto_detected: false,
          confirmed: true
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || 'Failed to record visit'
      };
    }
    
    const visit = await response.json();
    
    return {
      success: true,
      visitId: visit.id,
      message: 'Check-in successful!'
    };
  } catch (error) {
    console.error('Error recording visit:', error);
    return {
      success: false,
      error: 'An error occurred while checking in'
    };
  }
}

