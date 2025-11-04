from fastapi import APIRouter, HTTPException, status, Depends, Request, Query
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
from app.models.error import ErrorCode, ErrorDetail, create_error_response
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
    
    - Anonymous users supported
    - Tracks IP and user agent for spam prevention
    """
    try:
        supabase = get_supabase_client()
        
        view_data = {
            "cafe_id": cafe_id,
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
            "cafe_id": cafe_id
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
    
    - Requires authentication
    - Can be auto-detected or manual check-in
    - Validates distance if coordinates provided
    """
    try:
        supabase = get_supabase_client()
        
        # Get cafe location for distance validation
        cafe_result = supabase.table("cafes").select("latitude, longitude").eq("id", cafe_id).single().execute()
        
        if not cafe_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=create_error_response(
                    error_code=ErrorCode.CAFE_NOT_FOUND,
                    message="Cafe not found",
                    details=[ErrorDetail(
                        field="cafe_id",
                        message=f"Cafe with ID {cafe_id} does not exist",
                        value=cafe_id
                    )]
                )
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
            
            # Validate distance (should be within 50 meters)
            if distance_meters > 50:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=create_error_response(
                        error_code=ErrorCode.DISTANCE_TOO_FAR,
                        message=f"Check-in location too far from cafe",
                        details=[ErrorDetail(
                            field="distance",
                            message=f"Distance is {distance_meters}m, must be within 50m",
                            value=distance_meters
                        )]
                    )
                )
        
        # Create visit record
        visit_record = {
            "cafe_id": cafe_id,
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
                detail=create_error_response(
                    error_code=ErrorCode.VISIT_NOT_FOUND,
                    message="Visit not found",
                    details=[ErrorDetail(
                        field="visit_id",
                        message=f"Visit with ID {visit_id} does not exist",
                        value=visit_id
                    )]
                )
            )
        
        if visit_check.data["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=create_error_response(
                    error_code=ErrorCode.NOT_RESOURCE_OWNER,
                    message="Not authorized to update this visit",
                    details=[ErrorDetail(
                        field="user_id",
                        message="You do not own this visit",
                        value=user_id
                    )]
                )
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
        
        # Select all columns to avoid missing column errors
        result = supabase.table("cafes").select("*").order(
            "trending_score", desc=True
        ).range(offset, offset + limit - 1).execute()
        
        if not result.data:
            return []
        
        # Format response with default values for missing fields
        formatted_cafes = []
        for cafe in result.data:
            formatted_cafes.append({
                "id": cafe.get("id"),
                "name": cafe.get("name"),
                "address": cafe.get("address"),
                "latitude": cafe.get("latitude"),
                "longitude": cafe.get("longitude"),
                "view_count_14d": cafe.get("view_count_14d", 0),
                "visit_count_14d": cafe.get("visit_count_14d", 0),
                "trending_score": cafe.get("trending_score", 0.0),
                "trending_rank": cafe.get("trending_rank")
            })
        
        return formatted_cafes
        
    except Exception as e:
        print(f"Error getting trending cafes: {e}")
        import traceback
        traceback.print_exc()
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

@router.get("/cafes/{cafe_id}/visits", response_model=List[CafeVisitResponse])
async def get_cafe_visits(
    cafe_id: str,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):
    """
    Get all visits for a specific cafe.
    
    - Returns paginated list of visits
    - Ordered by visited_at (most recent first)
    - Used for duplicate check-in detection
    """
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("cafe_visits").select("*").eq(
            "cafe_id", cafe_id
        ).order(
            "visited_at", desc=True
        ).range(offset, offset + limit - 1).execute()
        
        if not result.data:
            return []
        
        return result.data
        
    except Exception as e:
        print(f"Error getting cafe visits: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cafe visits: {str(e)}"
        )

@router.get("/cafes/{cafe_id}/visits/check-duplicate")
async def check_duplicate_visit(
    cafe_id: str,
    user_id: str = Query(..., description="User ID to check")
):
    """
    Check if user has already checked in to this cafe today.
    
    - Returns duplicate status and visit info if exists
    - Used by frontend to prevent duplicate check-ins
    """
    try:
        supabase = get_supabase_client()
        
        from datetime import datetime, timezone, timedelta
        
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        result = supabase.table("cafe_visits").select("*").eq(
            "cafe_id", cafe_id
        ).eq(
            "user_id", user_id
        ).gte(
            "visited_at", today_start.isoformat()
        ).execute()
        
        if result.data and len(result.data) > 0:
            return {
                "is_duplicate": True,
                "visit": result.data[0],
                "message": "You have already checked in to this cafe today"
            }
        else:
            return {
                "is_duplicate": False,
                "visit": None,
                "message": "No duplicate visit found"
            }
        
    except Exception as e:
        print(f"Error checking duplicate visit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check duplicate visit: {str(e)}"
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

