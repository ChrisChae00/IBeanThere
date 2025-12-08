from fastapi import APIRouter, HTTPException, status, Depends, Request, Query
from typing import List, Optional
import json
from app.models.visit import (
    CafeViewCreate,
    CafeViewResponse,
    CafeVisitCreate,
    CafeVisitUpdate,
    CafeVisitResponse,
    TrendingCafeResponse,
    CafeStatsResponse,
    CafeLogPublicResponse,
    CafeLogsResponse
)
from app.api.deps import get_current_user, require_admin_role
from app.models.error import ErrorCode, ErrorDetail, create_error_response
from app.database.supabase import get_supabase_client
from supabase import Client
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
    current_user = Depends(get_current_user)
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
            "user_id": current_user.id,
            "visited_at": datetime.now(timezone.utc).isoformat(),
            "check_in_lat": str(visit_data.check_in_lat) if visit_data.check_in_lat else None,
            "check_in_lng": str(visit_data.check_in_lng) if visit_data.check_in_lng else None,
            "distance_meters": distance_meters or visit_data.distance_meters,
            "duration_minutes": visit_data.duration_minutes,
            "auto_detected": visit_data.auto_detected,
            "confirmed": visit_data.confirmed,
            "has_review": visit_data.rating is not None,
            "has_photos": visit_data.photo_urls is not None and len(visit_data.photo_urls) > 0,
            "rating": visit_data.rating,
            "comment": visit_data.comment,
            "photo_urls": visit_data.photo_urls if visit_data.photo_urls else [],
            "is_public": visit_data.is_public,
            "anonymous": visit_data.anonymous,
            "coffee_type": visit_data.coffee_type,
            "dessert": visit_data.dessert,
            "price": str(visit_data.price) if visit_data.price is not None else None,
            "price_currency": visit_data.price_currency,
            "atmosphere_rating": visit_data.atmosphere_rating,
            "atmosphere_tags": visit_data.atmosphere_tags,
            "parking_info": visit_data.parking_info,
            "acidity_rating": visit_data.acidity_rating,
            "body_rating": visit_data.body_rating,
            "sweetness_rating": visit_data.sweetness_rating,
            "bitterness_rating": visit_data.bitterness_rating,
            "aftertaste_rating": visit_data.aftertaste_rating,
            "bean_origin": visit_data.bean_origin,
            "processing_method": visit_data.processing_method,
            "roast_level": visit_data.roast_level,
            "extraction_method": visit_data.extraction_method,
            "extraction_equipment": visit_data.extraction_equipment,
            "aroma_rating": visit_data.aroma_rating,
            "wifi_quality": visit_data.wifi_quality,
            "wifi_rating": visit_data.wifi_rating,
            "outlet_info": visit_data.outlet_info,
            "furniture_comfort": visit_data.furniture_comfort,
            "noise_level": visit_data.noise_level,
            "noise_rating": visit_data.noise_rating,
            "temperature_lighting": visit_data.temperature_lighting,
            "facilities_info": visit_data.facilities_info
        }
        
        result = supabase.table("cafe_visits").insert(visit_record).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record cafe visit"
            )
        
        visit = result.data[0]
        
        # Format response with all fields
        response_data = {
            "id": visit.get("id"),
            "cafe_id": visit.get("cafe_id"),
            "user_id": visit.get("user_id"),
            "visited_at": visit.get("visited_at"),
            "check_in_lat": visit.get("check_in_lat"),
            "check_in_lng": visit.get("check_in_lng"),
            "distance_meters": visit.get("distance_meters"),
            "duration_minutes": visit.get("duration_minutes"),
            "auto_detected": visit.get("auto_detected", False),
            "confirmed": visit.get("confirmed", True),
            "has_review": visit.get("has_review", False),
            "has_photos": visit.get("has_photos", False),
            "rating": visit.get("rating"),
            "comment": visit.get("comment"),
            "photo_urls": visit.get("photo_urls", []),
            "is_public": visit.get("is_public", True),
            "anonymous": visit.get("anonymous", False),
            "coffee_type": visit.get("coffee_type"),
            "dessert": visit.get("dessert"),
            "price": Decimal(str(visit.get("price"))) if visit.get("price") is not None else None,
            "price_currency": visit.get("price_currency"),
            "atmosphere_rating": visit.get("atmosphere_rating"),
            "atmosphere_tags": visit.get("atmosphere_tags") if visit.get("atmosphere_tags") is None or isinstance(visit.get("atmosphere_tags"), list) else [],
            "parking_info": visit.get("parking_info"),
            "acidity_rating": visit.get("acidity_rating"),
            "body_rating": visit.get("body_rating"),
            "sweetness_rating": visit.get("sweetness_rating"),
            "bitterness_rating": visit.get("bitterness_rating"),
            "aftertaste_rating": visit.get("aftertaste_rating"),
            "bean_origin": visit.get("bean_origin"),
            "processing_method": visit.get("processing_method"),
            "roast_level": visit.get("roast_level"),
            "extraction_method": visit.get("extraction_method"),
            "extraction_equipment": visit.get("extraction_equipment"),
            "aroma_rating": visit.get("aroma_rating"),
            "wifi_quality": visit.get("wifi_quality"),
            "wifi_rating": visit.get("wifi_rating"),
            "outlet_info": visit.get("outlet_info"),
            "furniture_comfort": visit.get("furniture_comfort"),
            "noise_level": visit.get("noise_level"),
            "noise_rating": visit.get("noise_rating"),
            "temperature_lighting": visit.get("temperature_lighting"),
            "facilities_info": visit.get("facilities_info"),
            "updated_at": visit.get("updated_at")
        }
        
        return response_data
        
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
async def update_visit(
    visit_id: str,
    update_data: CafeVisitUpdate,
    current_user = Depends(get_current_user)
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
        
        if visit_check.data["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=create_error_response(
                    error_code=ErrorCode.NOT_RESOURCE_OWNER,
                    message="Not authorized to update this visit",
                    details=[ErrorDetail(
                        field="user_id",
                        message="You do not own this visit",
                        value=current_user.id
                    )]
                )
            )
        
        # Update visit
        update_payload = {}
        
        if update_data.confirmed is not None:
            update_payload["confirmed"] = update_data.confirmed
        
        if update_data.duration_minutes is not None:
            update_payload["duration_minutes"] = update_data.duration_minutes
        
        # Coffee log fields
        if update_data.rating is not None:
            update_payload["rating"] = update_data.rating
            update_payload["has_review"] = True
        
        if update_data.comment is not None:
            update_payload["comment"] = update_data.comment
        
        if update_data.photo_urls is not None:
            update_payload["photo_urls"] = update_data.photo_urls
            update_payload["has_photos"] = len(update_data.photo_urls) > 0
        
        if update_data.is_public is not None:
            update_payload["is_public"] = update_data.is_public
        
        if update_data.anonymous is not None:
            update_payload["anonymous"] = update_data.anonymous
        
        if update_data.coffee_type is not None:
            update_payload["coffee_type"] = update_data.coffee_type
        
        if update_data.dessert is not None:
            update_payload["dessert"] = update_data.dessert
        
        if update_data.price is not None:
            update_payload["price"] = str(update_data.price)
        
        if update_data.price_currency is not None:
            update_payload["price_currency"] = update_data.price_currency
            
        if update_data.atmosphere_rating is not None:
            update_payload["atmosphere_rating"] = update_data.atmosphere_rating
        
        if update_data.atmosphere_tags is not None:
            update_payload["atmosphere_tags"] = update_data.atmosphere_tags
            
        if update_data.parking_info is not None:
            update_payload["parking_info"] = update_data.parking_info
            
        if update_data.sweetness_rating is not None:
            update_payload["sweetness_rating"] = update_data.sweetness_rating
            
        if update_data.bitterness_rating is not None:
            update_payload["bitterness_rating"] = update_data.bitterness_rating
            
        if update_data.aftertaste_rating is not None:
            update_payload["aftertaste_rating"] = update_data.aftertaste_rating
            
        if update_data.acidity_rating is not None:
            update_payload["acidity_rating"] = update_data.acidity_rating
            
        if update_data.body_rating is not None:
            update_payload["body_rating"] = update_data.body_rating
        
        if update_data.bean_origin is not None:
            update_payload["bean_origin"] = update_data.bean_origin
        
        if update_data.processing_method is not None:
            update_payload["processing_method"] = update_data.processing_method
        
        if update_data.roast_level is not None:
            update_payload["roast_level"] = update_data.roast_level
        
        if update_data.extraction_method is not None:
            update_payload["extraction_method"] = update_data.extraction_method
        
        if update_data.extraction_equipment is not None:
            update_payload["extraction_equipment"] = update_data.extraction_equipment
        
        if update_data.aroma_rating is not None:
            update_payload["aroma_rating"] = update_data.aroma_rating
        
        if update_data.wifi_quality is not None:
            update_payload["wifi_quality"] = update_data.wifi_quality
        
        if update_data.wifi_rating is not None:
            update_payload["wifi_rating"] = update_data.wifi_rating
        
        if update_data.outlet_info is not None:
            update_payload["outlet_info"] = update_data.outlet_info
        
        if update_data.furniture_comfort is not None:
            update_payload["furniture_comfort"] = update_data.furniture_comfort
        
        if update_data.noise_level is not None:
            update_payload["noise_level"] = update_data.noise_level
        
        if update_data.noise_rating is not None:
            update_payload["noise_rating"] = update_data.noise_rating
        
        if update_data.temperature_lighting is not None:
            update_payload["temperature_lighting"] = update_data.temperature_lighting
        
        if update_data.facilities_info is not None:
            update_payload["facilities_info"] = update_data.facilities_info
        
        result = supabase.table("cafe_visits").update(update_payload).eq("id", visit_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update visit"
            )
        
        visit = result.data[0]
        
        # Ensure all fields are present
        response_data = {
            "id": visit.get("id"),
            "cafe_id": visit.get("cafe_id"),
            "user_id": visit.get("user_id"),
            "visited_at": visit.get("visited_at"),
            "check_in_lat": visit.get("check_in_lat"),
            "check_in_lng": visit.get("check_in_lng"),
            "distance_meters": visit.get("distance_meters"),
            "duration_minutes": visit.get("duration_minutes"),
            "auto_detected": visit.get("auto_detected", False),
            "confirmed": visit.get("confirmed", True),
            "has_review": visit.get("has_review", False),
            "has_photos": visit.get("has_photos", False),
            "rating": visit.get("rating"),
            "comment": visit.get("comment"),
            "photo_urls": visit.get("photo_urls", []),
            "is_public": visit.get("is_public", True),
            "anonymous": visit.get("anonymous", False),
            "coffee_type": visit.get("coffee_type"),
            "dessert": visit.get("dessert"),
            "price": Decimal(str(visit.get("price"))) if visit.get("price") is not None else None,
            "price_currency": visit.get("price_currency"),
            "atmosphere_rating": visit.get("atmosphere_rating"),
            "atmosphere_tags": visit.get("atmosphere_tags") if visit.get("atmosphere_tags") is None or isinstance(visit.get("atmosphere_tags"), list) else [],
            "parking_info": visit.get("parking_info"),
            "acidity_rating": visit.get("acidity_rating"),
            "body_rating": visit.get("body_rating"),
            "sweetness_rating": visit.get("sweetness_rating"),
            "bitterness_rating": visit.get("bitterness_rating"),
            "aftertaste_rating": visit.get("aftertaste_rating"),
            "bean_origin": visit.get("bean_origin"),
            "processing_method": visit.get("processing_method"),
            "roast_level": visit.get("roast_level"),
            "extraction_method": visit.get("extraction_method"),
            "extraction_equipment": visit.get("extraction_equipment"),
            "aroma_rating": visit.get("aroma_rating"),
            "wifi_quality": visit.get("wifi_quality"),
            "wifi_rating": visit.get("wifi_rating"),
            "outlet_info": visit.get("outlet_info"),
            "furniture_comfort": visit.get("furniture_comfort"),
            "noise_level": visit.get("noise_level"),
            "noise_rating": visit.get("noise_rating"),
            "temperature_lighting": visit.get("temperature_lighting"),
            "facilities_info": visit.get("facilities_info"),
            "updated_at": visit.get("updated_at")
        }
        
        return response_data
        
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
                "slug": cafe.get("slug"),
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
    offset: int = Query(default=0, ge=0),
    current_user = Depends(get_current_user)
):
    """
    Get all visits for a specific cafe.
    
    - Requires authentication
    - Returns paginated list of visits
    - Ordered by visited_at (most recent first)
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
    current_user = Depends(get_current_user)
):
    """
    Check if user has already checked in to this cafe today.
    
    - Requires authentication
    - Returns duplicate status and visit info if exists
    - Used by frontend to prevent duplicate check-ins
    """
    try:
        supabase = get_supabase_client()
        user_id = current_user.id
        
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
async def update_trending_scores(
    current_user = Depends(require_admin_role)
):
    """
    Manually trigger trending score recalculation for all cafes.
    
    - Admin only - requires authentication with admin role
    - Should be run via cron job hourly
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

@router.get("/cafes/{cafe_id}/logs", response_model=CafeLogsResponse)
async def get_cafe_logs(
    cafe_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get public coffee logs for a cafe.
    
    - No authentication required
    - Returns only public logs with ratings
    - Paginated results
    - Anonymous users show as "Anonymous" if anonymous flag is set
    """
    try:
        offset = (page - 1) * page_size
        
        # Get public logs with ratings
        result = supabase.table("cafe_visits").select(
            "id, cafe_id, visited_at, rating, comment, photo_urls, coffee_type, dessert, price, anonymous, updated_at, user_id, atmosphere_rating, atmosphere_tags, parking_info, acidity_rating, body_rating, sweetness_rating, bitterness_rating, aftertaste_rating, bean_origin, processing_method, roast_level, extraction_method, extraction_equipment, aroma_rating, wifi_quality, wifi_rating, outlet_info, furniture_comfort, noise_level, noise_rating, temperature_lighting, facilities_info"
        ).eq("cafe_id", cafe_id).eq("is_public", True).not_.is_("rating", "null").order(
            "visited_at", desc=True
        ).range(offset, offset + page_size - 1).execute()
        
        if not result.data:
            return CafeLogsResponse(
                logs=[],
                total_count=0,
                page=page,
                page_size=page_size,
                has_more=False
            )
        
        # Get total count
        count_result = supabase.table("cafe_visits").select(
            "id", count="exact"
        ).eq("cafe_id", cafe_id).eq("is_public", True).not_.is_("rating", "null").execute()
        
        total_count = count_result.count if count_result.count else 0
        
        # Format logs with author display names
        logs = []
        for log in result.data:
            author_display_name = None
            if not log.get("anonymous"):
                # Get username from users table
                try:
                    user_result = supabase.table("users").select("username").eq("id", log["user_id"]).single().execute()
                    if user_result.data:
                        author_display_name = user_result.data.get("username") or "User"
                except Exception:
                    author_display_name = "User"
            else:
                author_display_name = "Anonymous"
            
            logs.append(CafeLogPublicResponse(
                id=log["id"],
                cafe_id=log["cafe_id"],
                visited_at=datetime.fromisoformat(log["visited_at"].replace("Z", "+00:00")),
                rating=log.get("rating"),
                comment=log.get("comment"),
                photo_urls=log.get("photo_urls", []),
                coffee_type=log.get("coffee_type"),
                dessert=log.get("dessert"),
                price=Decimal(str(log.get("price"))) if log.get("price") is not None else None,
                price_currency=log.get("price_currency"),
                atmosphere_rating=log.get("atmosphere_rating"),
                atmosphere_tags=(
                    log.get("atmosphere_tags") 
                    if log.get("atmosphere_tags") is None or isinstance(log.get("atmosphere_tags"), list)
                    else (json.loads(log.get("atmosphere_tags")) if isinstance(log.get("atmosphere_tags"), str) else [])
                ),
                parking_info=log.get("parking_info"),
                acidity_rating=log.get("acidity_rating"),
                body_rating=log.get("body_rating"),
                sweetness_rating=log.get("sweetness_rating"),
                bitterness_rating=log.get("bitterness_rating"),
                aftertaste_rating=log.get("aftertaste_rating"),
                bean_origin=log.get("bean_origin"),
                processing_method=log.get("processing_method"),
                roast_level=log.get("roast_level"),
                extraction_method=log.get("extraction_method"),
                extraction_equipment=log.get("extraction_equipment"),
                aroma_rating=log.get("aroma_rating"),
                wifi_quality=log.get("wifi_quality"),
                wifi_rating=log.get("wifi_rating"),
                outlet_info=log.get("outlet_info"),
                furniture_comfort=log.get("furniture_comfort"),
                noise_level=log.get("noise_level"),
                noise_rating=log.get("noise_rating"),
                temperature_lighting=log.get("temperature_lighting"),
                facilities_info=log.get("facilities_info"),
                author_display_name=author_display_name,
                updated_at=datetime.fromisoformat(log["updated_at"].replace("Z", "+00:00")) if log.get("updated_at") else None
            ))
        
        return CafeLogsResponse(
            logs=logs,
            total_count=total_count,
            page=page,
            page_size=page_size,
            has_more=offset + page_size < total_count
        )
        
    except Exception as e:
        print(f"Error getting cafe logs: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cafe logs: {str(e)}"
        )

@router.get("/users/me/logs", response_model=List[CafeVisitResponse])
async def get_my_logs(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get all logs for the current user (public and private).
    
    - Requires authentication
    - Returns all logs regardless of is_public flag
    - Ordered by visited_at (most recent first)
    """
    try:
        result = supabase.table("cafe_visits").select("*").eq(
            "user_id", current_user.id
        ).not_.is_("rating", "null").order(
            "visited_at", desc=True
        ).execute()
        
        if not result.data:
            return []
        
        # Format response with all fields
        formatted_logs = []
        for visit in result.data:
            formatted_logs.append({
                "id": visit.get("id"),
                "cafe_id": visit.get("cafe_id"),
                "user_id": visit.get("user_id"),
                "visited_at": visit.get("visited_at"),
                "check_in_lat": visit.get("check_in_lat"),
                "check_in_lng": visit.get("check_in_lng"),
                "distance_meters": visit.get("distance_meters"),
                "duration_minutes": visit.get("duration_minutes"),
                "auto_detected": visit.get("auto_detected", False),
                "confirmed": visit.get("confirmed", True),
                "has_review": visit.get("has_review", False),
                "has_photos": visit.get("has_photos", False),
                "rating": visit.get("rating"),
                "comment": visit.get("comment"),
                "photo_urls": visit.get("photo_urls", []),
                "is_public": visit.get("is_public", True),
                "anonymous": visit.get("anonymous", False),
                "coffee_type": visit.get("coffee_type"),
                "dessert": visit.get("dessert"),
                "price": Decimal(str(visit.get("price"))) if visit.get("price") is not None else None,
                "price_currency": visit.get("price_currency"),
                "atmosphere_rating": visit.get("atmosphere_rating"),
                "atmosphere_tags": (
                    visit.get("atmosphere_tags") 
                    if visit.get("atmosphere_tags") is None or isinstance(visit.get("atmosphere_tags"), list)
                    else (json.loads(visit.get("atmosphere_tags")) if isinstance(visit.get("atmosphere_tags"), str) else [])
                ),
                "parking_info": visit.get("parking_info"),
                "acidity_rating": visit.get("acidity_rating"),
                "body_rating": visit.get("body_rating"),
                "sweetness_rating": visit.get("sweetness_rating"),
                "bitterness_rating": visit.get("bitterness_rating"),
                "aftertaste_rating": visit.get("aftertaste_rating"),
                "bean_origin": visit.get("bean_origin"),
                "processing_method": visit.get("processing_method"),
                "roast_level": visit.get("roast_level"),
                "extraction_method": visit.get("extraction_method"),
                "extraction_equipment": visit.get("extraction_equipment"),
                "aroma_rating": visit.get("aroma_rating"),
                "wifi_quality": visit.get("wifi_quality"),
                "wifi_rating": visit.get("wifi_rating"),
                "outlet_info": visit.get("outlet_info"),
                "furniture_comfort": visit.get("furniture_comfort"),
                "noise_level": visit.get("noise_level"),
                "noise_rating": visit.get("noise_rating"),
                "temperature_lighting": visit.get("temperature_lighting"),
                "facilities_info": visit.get("facilities_info"),
                "updated_at": visit.get("updated_at")
            })
        
        return formatted_logs
        
    except Exception as e:
        print(f"Error getting my logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get my logs: {str(e)}"
        )

@router.delete("/visits/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_visit(
    visit_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Delete a visit/log.
    
    - Requires authentication
    - Only owner or admin can delete
    """
    try:
        # Check if visit exists and get owner
        visit_check = supabase.table("cafe_visits").select("user_id").eq("id", visit_id).single().execute()
        
        if not visit_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visit not found"
            )
        
        # Check if user is owner or admin
        is_owner = visit_check.data["user_id"] == current_user.id
        is_admin = getattr(current_user, "role", None) == "admin"
        
        if not is_owner and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this visit"
            )
        
        # Delete visit
        supabase.table("cafe_visits").delete().eq("id", visit_id).execute()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting visit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete visit: {str(e)}"
        )

