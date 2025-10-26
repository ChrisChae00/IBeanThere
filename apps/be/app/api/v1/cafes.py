from fastapi import APIRouter, Query, HTTPException, status, Depends
from typing import Optional
from app.models.cafe import CafeSearchParams, CafeSearchResponse, CafeResponse
from app.services.google_places_service import GooglePlacesService
from app.services.cafe_cache_service import CafeCacheService
from app.services.cafe_sync_service import CafeSyncService
from app.database.supabase import get_supabase_client
from datetime import datetime

router = APIRouter()

# Initialize services lazily to avoid import-time issues
_google_service = None
_cache_service = None
_sync_service = None

def get_google_service() -> GooglePlacesService:
    global _google_service
    if _google_service is None:
        _google_service = GooglePlacesService()
    return _google_service

def get_cache_service() -> CafeCacheService:
    global _cache_service
    if _cache_service is None:
        _cache_service = CafeCacheService()
    return _cache_service

def get_sync_service() -> CafeSyncService:
    global _sync_service
    if _sync_service is None:
        _sync_service = CafeSyncService()
    return _sync_service

@router.get("/search", response_model=CafeSearchResponse)
async def search_cafes(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius: int = Query(default=2000, ge=100, le=5000, description="Search radius in meters")
):
    """
    Search for cafes near a location.
    
    - Checks database cache first
    - If cache miss or stale, calls Google Places API
    - Stores results in database for future requests
    - Returns combined data (Google + database)
    """
    try:
        cache_service = get_cache_service()
        google_service = get_google_service()
        
        # Check cache first
        cached_cafes = cache_service.get_cached_cafes(lat, lng, radius)
        
        if cached_cafes:
            # Return cached data
            # Ensure cached data has proper format
            formatted_cached = []
            for cafe in cached_cafes:
                formatted_cached.append({
                    "id": cafe.get("id", ""),
                    "google_place_id": cafe.get("google_place_id", ""),
                    "name": cafe.get("name", ""),
                    "address": cafe.get("address", ""),
                    "phone_number": cafe.get("phone_number"),
                    "website": cafe.get("website"),
                    "google_maps_url": cafe.get("google_maps_url"),
                    "latitude": float(cafe.get("latitude", 0)),
                    "longitude": float(cafe.get("longitude", 0)),
                    "google_rating": float(cafe.get("google_rating", 0)) if cafe.get("google_rating") else None,
                    "google_review_count": int(cafe.get("google_review_count", 0)),
                    "google_types": cafe.get("google_types", []),
                    "opening_hours": cafe.get("opening_hours"),
                    "created_at": cafe.get("created_at", datetime.utcnow().isoformat()),
                    "updated_at": cafe.get("updated_at")
                })
            
            return CafeSearchResponse(
                cafes=formatted_cached,
                cache_hit=True,
                total_count=len(formatted_cached)
            )
        
        # Cache miss - call Google API
        places = await google_service.search_nearby_cafes(lat, lng, radius)
        
        if not places:
            return CafeSearchResponse(
                cafes=[],
                cache_hit=False,
                total_count=0
            )
        
        # Get full details for each place
        cafes_data = []
        for place in places:
            try:
                place_id = place.get("place_id")
                if not place_id:
                    continue
                
                # Get full details
                details = await google_service.get_place_details(place_id)
                cafe_data = google_service.parse_cafe_data(details)
                
                # Add sync timestamp
                cafe_data["last_synced_at"] = datetime.utcnow().isoformat()
                
                cafes_data.append(cafe_data)
            except Exception as e:
                print(f"Error processing place {place.get('name', 'unknown')}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        # Save to database cache
        if cafes_data:
            cache_service.save_cafes_to_cache(cafes_data)
        
        # Convert cafe data to proper format for response
        response_cafes = []
        for cafe in cafes_data:
            # Map Google API data to CafeResponse format
            response_cafes.append({
                "id": cafe.get("google_place_id", ""),
                "google_place_id": cafe.get("google_place_id", ""),
                "name": cafe.get("name", ""),
                "address": cafe.get("address", ""),
                "phone_number": cafe.get("phone_number"),
                "website": cafe.get("website"),
                "google_maps_url": cafe.get("google_maps_url"),
                "latitude": float(cafe.get("latitude", 0)),
                "longitude": float(cafe.get("longitude", 0)),
                "google_rating": float(cafe.get("google_rating", 0)) if cafe.get("google_rating") else None,
                "google_review_count": int(cafe.get("google_review_count", 0)),
                "google_types": cafe.get("google_types", []),
                "opening_hours": cafe.get("opening_hours"),
                "created_at": cafe.get("last_synced_at", datetime.utcnow().isoformat()),
                "updated_at": None
            })
        
        return CafeSearchResponse(
            cafes=response_cafes,
            cache_hit=False,
            total_count=len(response_cafes)
        )
        
    except Exception as e:
        print(f"Error in search_cafes: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search cafes: {str(e)}"
        )

@router.get("/{cafe_id}", response_model=CafeResponse)
async def get_cafe_details(cafe_id: str):
    """
    Get detailed information about a specific cafe.
    
    - Checks database first
    - If not found or stale (>7 days), fetches from Google API
    - Updates database with latest data
    """
    try:
        supabase = get_supabase_client()
        cache_service = get_cache_service()
        sync_service = get_sync_service()
        
        # Get from database
        result = supabase.table("cafes").select("*").eq("id", cafe_id).single().execute()
        
        cafe_data = result.data if result.data else None
        
        # Check if data is stale or missing
        needs_sync = True
        if cafe_data:
            last_synced = cafe_data.get("last_synced_at")
            if cache_service.is_cache_valid(last_synced):
                needs_sync = False
        
        # Sync if needed
        if needs_sync:
            if cafe_data:
                # Update existing cafe
                await sync_service.sync_cafe_data(cafe_id)
                # Re-fetch updated data
                result = supabase.table("cafes").select("*").eq("id", cafe_id).single().execute()
                cafe_data = result.data
            else:
                # Cafe not found - this shouldn't happen if using proper cafe_id
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Cafe not found"
                )
        
        if not cafe_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cafe not found"
            )
        
        return cafe_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cafe details: {str(e)}"
        )

@router.post("/sync/{cafe_id}")
async def sync_cafe(cafe_id: str):
    """
    Manually sync a specific cafe's data from Google Places API.
    (Admin only in production)
    
    - Refreshes cafe data from Google API
    - Updates database with latest information
    """
    try:
        sync_service = get_sync_service()
        success = await sync_service.sync_cafe_data(cafe_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cafe not found or sync failed"
            )
        
        return {
            "message": "Cafe synced successfully",
            "cafe_id": cafe_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync cafe: {str(e)}"
        )

@router.get("/cache/stats")
async def get_cache_stats():
    """
    Get cache statistics for monitoring.
    
    - Total cafes in cache
    - Stale vs fresh cafes
    - Cache hit rate
    """
    try:
        cache_service = get_cache_service()
        stats = cache_service.get_cache_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cache stats: {str(e)}"
        )

