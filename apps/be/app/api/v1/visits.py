from fastapi import APIRouter, HTTPException, status, Depends, Request
from typing import List, Optional
from app.models.visit import (
    CafeViewCreate,
    CafeViewResponse,
    CafeVisitCreate,
    CafeVisitUpdate,
    CafeVisitResponse,
    TrendingCafeResponse,
    CafeStatsResponse
)
from app.database.supabase import get_supabase_client
from datetime import datetime, timezone
from decimal import Decimal

router = APIRouter()

@router.post("/cafes/{cafe_id}/view", status_code=status.HTTP_201_CREATED)
async def record_cafe_view(
    cafe_id: str,
    request: Request,
    user_id: Optional[str] = None
):
    """
    Record a cafe view (when user clicks on cafe marker or views details).
    Accepts both UUID and Google Place ID.
    
    - Anonymous users supported
    - Tracks IP and user agent for spam prevention
    """
    try:
        supabase = get_supabase_client()
        
        # Check if cafe_id is Google Place ID or UUID
        # Google Place IDs start with "ChIJ"
        actual_cafe_id = cafe_id
        
        if cafe_id.startswith("ChIJ"):
            # It's a Google Place ID, look up the actual UUID
            cafe_result = supabase.table("cafes").select("id").eq("google_place_id", cafe_id).execute()
            
            if not cafe_result.data or len(cafe_result.data) == 0:
                # Cafe not in database yet, skip view recording
                return {
                    "message": "Cafe not yet in database, view not recorded",
                    "cafe_id": cafe_id
                }
            
            actual_cafe_id = cafe_result.data[0]["id"]
        
        view_data = {
            "cafe_id": actual_cafe_id,
            "user_id": user_id,
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "viewed_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table("cafe_views").insert(view_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record cafe view"
            )
        
        return {
            "message": "View recorded successfully",
            "cafe_id": actual_cafe_id
        }
        
    except Exception as e:
        print(f"Error recording cafe view: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record view: {str(e)}"
        )

@router.post("/cafes/{cafe_id}/visit", response_model=CafeVisitResponse, status_code=status.HTTP_201_CREATED)
async def record_cafe_visit(
    cafe_id: str,
    visit_data: CafeVisitCreate,
    user_id: str  # TODO: Replace with Depends(get_current_user) when auth is ready
):
    """
    Record a cafe visit (physical presence).
    Accepts both UUID and Google Place ID.
    
    - Requires authentication
    - Can be auto-detected or manual check-in
    - Validates distance if coordinates provided
    """
    try:
        supabase = get_supabase_client()
        
        # Check if cafe_id is Google Place ID or UUID
        actual_cafe_id = cafe_id
        
        if cafe_id.startswith("ChIJ"):
            # It's a Google Place ID, look up the actual UUID
            cafe_lookup = supabase.table("cafes").select("id").eq("google_place_id", cafe_id).execute()
            
            if not cafe_lookup.data or len(cafe_lookup.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Cafe not found in database"
                )
            
            actual_cafe_id = cafe_lookup.data[0]["id"]
        
        # Get cafe location for distance validation
        cafe_result = supabase.table("cafes").select("latitude, longitude").eq("id", actual_cafe_id).single().execute()
        
        if not cafe_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cafe not found"
            )
        
        cafe_lat = float(cafe_result.data["latitude"])
        cafe_lng = float(cafe_result.data["longitude"])
        
        # Calculate distance if check-in coordinates provided
        distance_meters = None
        if visit_data.check_in_lat and visit_data.check_in_lng:
            from math import radians, cos, sin, asin, sqrt
            
            check_in_lat = float(visit_data.check_in_lat)
            check_in_lng = float(visit_data.check_in_lng)
            
            # Haversine formula
            lon1, lat1, lon2, lat2 = map(radians, [cafe_lng, cafe_lat, check_in_lng, check_in_lat])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            distance_meters = int(c * 6371000)  # Radius of earth in meters
            
            # Validate distance (should be within 200 meters)
            if distance_meters > 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Check-in location too far from cafe ({distance_meters}m). Must be within 200m."
                )
        
        # Create visit record
        visit_record = {
            "cafe_id": actual_cafe_id,
            "user_id": user_id,
            "visited_at": datetime.now(timezone.utc).isoformat(),
            "check_in_lat": str(visit_data.check_in_lat) if visit_data.check_in_lat else None,
            "check_in_lng": str(visit_data.check_in_lng) if visit_data.check_in_lng else None,
            "distance_meters": distance_meters or visit_data.distance_meters,
            "duration_minutes": visit_data.duration_minutes,
            "auto_detected": visit_data.auto_detected,
            "confirmed": visit_data.confirmed,
            "has_review": False,
            "has_photos": False
        }
        
        result = supabase.table("cafe_visits").insert(visit_record).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record cafe visit"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error recording cafe visit: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record visit: {str(e)}"
        )

@router.patch("/visits/{visit_id}", response_model=CafeVisitResponse)
async def confirm_visit(
    visit_id: str,
    update_data: CafeVisitUpdate,
    user_id: str  # TODO: Replace with Depends(get_current_user)
):
    """
    Confirm or update an auto-detected visit.
    
    - Used to confirm visits detected by location tracking
    - Can update duration and confirmation status
    """
    try:
        supabase = get_supabase_client()
        
        # Verify visit belongs to user
        visit_check = supabase.table("cafe_visits").select("user_id").eq("id", visit_id).single().execute()
        
        if not visit_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visit not found"
            )
        
        if visit_check.data["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this visit"
            )
        
        # Update visit
        update_payload = {
            "confirmed": update_data.confirmed,
        }
        
        if update_data.duration_minutes is not None:
            update_payload["duration_minutes"] = update_data.duration_minutes
        
        result = supabase.table("cafe_visits").update(update_payload).eq("id", visit_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update visit"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating visit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update visit: {str(e)}"
        )

@router.get("/cafes/trending", response_model=List[TrendingCafeResponse])
async def get_trending_cafes(
    limit: int = 10,
    offset: int = 0
):
    """
    Get trending cafes based on recent activity (14 days).
    
    - Sorted by trending score (views, visits, reviews, rating)
    - Cached and updated hourly
    """
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("cafes").select(
            "id, google_place_id, name, address, latitude, longitude, "
            "google_rating, google_review_count, view_count_14d, visit_count_14d, "
            "trending_score, trending_rank"
        ).order("trending_score", desc=True).range(offset, offset + limit - 1).execute()
        
        if not result.data:
            return []
        
        return result.data
        
    except Exception as e:
        print(f"Error getting trending cafes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get trending cafes: {str(e)}"
        )

@router.get("/cafes/{cafe_id}/stats", response_model=CafeStatsResponse)
async def get_cafe_stats(cafe_id: str):
    """
    Get detailed statistics for a specific cafe.
    
    - View and visit counts (total and 14-day)
    - Trending score and rank
    """
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("cafes").select(
            "id, view_count_total, view_count_14d, visit_count_total, "
            "visit_count_14d, trending_score, trending_rank, trending_updated_at"
        ).eq("id", cafe_id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cafe not found"
            )
        
        return {
            "cafe_id": cafe_id,
            **result.data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting cafe stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cafe stats: {str(e)}"
        )

@router.post("/admin/update-trending-scores")
async def update_trending_scores():
    """
    Manually trigger trending score recalculation for all cafes.
    
    - Should be run via cron job hourly
    - Admin only in production
    """
    try:
        supabase = get_supabase_client()
        
        result = supabase.rpc("update_all_trending_scores").execute()
        
        updated_count = result.data if result.data else 0
        
        return {
            "message": "Trending scores updated successfully",
            "updated_count": updated_count
        }
        
    except Exception as e:
        print(f"Error updating trending scores: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update trending scores: {str(e)}"
        )

