"""
Cafe API endpoints for UGC verification system.

- Search cafes by location (PostGIS earth_distance)
- Register new cafe (with location verification)
- Get cafe details (with Founding Crew info)
"""

from fastapi import APIRouter, Query, HTTPException, status, Depends, Body
from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
import re
from app.models.cafe import (
    CafeSearchParams,
    CafeSearchResponse,
    CafeResponse,
    CafeRegistrationRequest
)
from app.services.osm_service import OSMService
from app.database.supabase import get_supabase_client
from app.api.deps import get_current_user, require_admin_role
from app.core.permissions import Permission, require_permission
from app.core.fraud_detection import check_location_consistency
from supabase import Client
from datetime import datetime, timezone
from dateutil import parser as date_parser
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'-{2,}', '-', slug).strip('-')
    return slug or 'cafe'


def generate_unique_slug(name: str, supabase: Client, exclude_id: Optional[str] = None) -> str:
    base_slug = slugify(name)
    slug_candidate = base_slug
    counter = 1

    while True:
        existing = supabase.table("cafes").select("id").eq("slug", slug_candidate).limit(1).execute()
        rows = existing.data or []

        if not rows:
            return slug_candidate

        existing_id = rows[0].get("id")
        if exclude_id and existing_id == exclude_id:
            return slug_candidate

        slug_candidate = f"{base_slug}-{counter}"
        counter += 1


# Initialize services
_osm_service = None

def get_osm_service() -> OSMService:
    global _osm_service
    if _osm_service is None:
        _osm_service = OSMService()
    return _osm_service

def get_country_code_from_name(country_name: str) -> Optional[str]:
    """
    Convert country name to ISO 3166-1 alpha-2 country code.
    
    Args:
        country_name: Country name from OSM
        
    Returns:
        ISO 3166-1 alpha-2 country code or None
    """
    country_map = {
        'Canada': 'ca',
        'United States': 'us',
        'United States of America': 'us',
        'United Kingdom': 'gb',
        'Australia': 'au',
        'Germany': 'de',
        'France': 'fr',
        'South Korea': 'kr',
        'Korea, Republic of': 'kr',
        'Japan': 'jp',
        'China': 'cn',
        'India': 'in',
        'Brazil': 'br',
        'Mexico': 'mx',
        'Spain': 'es',
        'Italy': 'it',
        'Netherlands': 'nl',
        'Belgium': 'be',
        'Switzerland': 'ch',
        'Austria': 'at',
        'Sweden': 'se',
        'Norway': 'no',
        'Denmark': 'dk',
        'Finland': 'fi',
        'Poland': 'pl',
        'Portugal': 'pt',
        'Greece': 'gr',
        'Ireland': 'ie',
        'New Zealand': 'nz',
        'Singapore': 'sg',
        'Malaysia': 'my',
        'Thailand': 'th',
        'Indonesia': 'id',
        'Philippines': 'ph',
        'Vietnam': 'vn',
        'Taiwan': 'tw',
        'Hong Kong': 'hk'
    }
    
    return country_map.get(country_name)

def detect_country_from_postcode(postcode: str) -> Optional[str]:
    """
    Detect country code from postcode format.
    
    Args:
        postcode: Postcode string
        
    Returns:
        ISO 3166-1 alpha-2 country code or None
    """
    import re
    
    # Remove spaces and convert to uppercase
    clean_postcode = postcode.replace(' ', '').upper()
    
    # Canadian postcode: A1A 1A1 format (e.g., N2H 4B4)
    if re.match(r'^[A-Z]\d[A-Z]\d[A-Z]\d$', clean_postcode):
        return 'ca'
    
    # US ZIP code: 5 digits or 5+4 format (e.g., 12345 or 12345-6789)
    if re.match(r'^\d{5}(-\d{4})?$', postcode):
        return 'us'
    
    # UK postcode: Various formats (e.g., SW1A 1AA, M1 1AA)
    if re.match(r'^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$', postcode.upper()):
        return 'gb'
    
    # Australian postcode: 4 digits (e.g., 2000)
    if re.match(r'^\d{4}$', postcode):
        return 'au'
    
    # German postcode: 5 digits (e.g., 10115)
    if re.match(r'^\d{5}$', postcode):
        return 'de'
    
    # French postcode: 5 digits (e.g., 75001)
    if re.match(r'^\d{5}$', postcode):
        # Could be France or Germany, but France is more common
        # This is a heuristic - may need refinement
        pass
    
    return None

def calculate_earth_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula.
    
    Args:
        lat1, lng1: First coordinate
        lat2, lng2: Second coordinate
        
    Returns:
        Distance in meters
    """
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371000  # Earth radius in meters
    
    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lng = radians(lng2 - lng1)
    
    a = (
        sin(delta_lat / 2) ** 2 +
        cos(lat1_rad) * cos(lat2_rad) * sin(delta_lng / 2) ** 2
    )
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    return R * c

async def check_nearby_cafes(
    lat: float,
    lng: float,
    threshold_meters: int = 25,
    supabase: Client = None
) -> Optional[dict]:
    """
    Check if cafe exists within threshold using PostGIS earth_distance.
    
    Args:
        lat: Latitude
        lng: Longitude
        threshold_meters: Distance threshold in meters (default 25m)
        supabase: Supabase client
        
    Returns:
        Existing cafe dict or None
    """
    if not supabase:
        supabase = get_supabase_client()
    
    try:
        # Use bounding box for optimization, then exact Haversine distance
        # Calculate bounding box
        lat_offset = threshold_meters / 111000
        lng_offset = threshold_meters / (111000 * abs(lat)) if lat != 0 else threshold_meters / 111000
        
        result = supabase.table("cafes").select("*").gte(
            "latitude", lat - lat_offset
        ).lte(
            "latitude", lat + lat_offset
        ).gte(
            "longitude", lng - lng_offset
        ).lte(
            "longitude", lng + lng_offset
        ).execute()
        
        if result.data:
            # Filter by exact distance using Haversine
            for cafe in result.data:
                distance = calculate_earth_distance(
                    lat, lng,
                    float(cafe.get("latitude", 0)),
                    float(cafe.get("longitude", 0))
                )
                if distance < threshold_meters:
                    return cafe
        
        return None
        
    except Exception as e:
        print(f"Error checking nearby cafes: {e}")
        return None

@router.get("/search", response_model=CafeSearchResponse)
async def search_cafes(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius: int = Query(default=2000, ge=100, le=20000, description="Search radius in meters"),
    status_filter: Optional[str] = Query(None, description="Filter by status: 'pending' | 'verified'"),
    sort_by: str = Query(default="distance", description="Sort by: distance | trending | rating | newest"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating filter")
):
    """
    Search for cafes near a location using PostGIS.
    
    - Uses earth_distance() for accurate distance calculation
    - Returns cafes within radius
    - Optional status filter
    - Sort by distance, trending score, rating, or creation date
    - Optional minimum rating filter
    """
    try:
        supabase = get_supabase_client()
        
        # Calculate bounding box for optimization
        # 1 degree latitude = ~111km everywhere
        lat_offset = radius / 111000
        
        # 1 degree longitude = ~111km * cos(latitude)
        # At latitude 43°, 1 degree longitude ≈ 81km
        import math
        lng_offset = radius / (111000 * math.cos(math.radians(abs(lat)))) if lat != 0 else radius / 111000
        
        lat_min = lat - lat_offset
        lat_max = lat + lat_offset
        lng_min = lng - lng_offset
        lng_max = lng + lng_offset
        
        # Query with bounding box (optimization)
        query = supabase.table("cafes").select("*").gte(
            "latitude", lat_min
        ).lte(
            "latitude", lat_max
        ).gte(
            "longitude", lng_min
        ).lte(
            "longitude", lng_max
        )
        
        if status_filter:
            query = query.eq("status", status_filter)
        
        result = query.execute()
        
        if not result.data:
            return CafeSearchResponse(cafes=[], total_count=0)
        
        # Filter by exact distance and calculate distances
        valid_cafes = []
        for cafe in result.data:
            distance = calculate_earth_distance(
                lat, lng,
                float(cafe.get("latitude", 0)),
                float(cafe.get("longitude", 0))
            )
            if distance <= radius:
                # Filter by minimum rating if specified
                cafe_rating = cafe.get("google_rating") or cafe.get("average_rating") or 0
                if min_rating is not None and float(cafe_rating) < min_rating:
                    continue
                
                # Store distance for sorting
                cafe["_distance"] = distance
                valid_cafes.append(cafe)
        
        # Sort cafes based on sort_by parameter
        if sort_by == "distance":
            valid_cafes.sort(key=lambda c: c.get("_distance", float("inf")))
        elif sort_by == "trending":
            valid_cafes.sort(key=lambda c: float(c.get("trending_score", 0) or 0), reverse=True)
        elif sort_by == "rating":
            valid_cafes.sort(key=lambda c: float(c.get("google_rating", 0) or c.get("average_rating", 0) or 0), reverse=True)
        elif sort_by == "newest":
            valid_cafes.sort(key=lambda c: c.get("created_at", ""), reverse=True)
        
        # Format response
        formatted_cafes = []
        for cafe in valid_cafes:
            formatted_cafes.append({
                "id": cafe.get("id", ""),
                "name": cafe.get("name", ""),
                "slug": cafe.get("slug"),
                "address": cafe.get("address"),
                "latitude": Decimal(str(cafe.get("latitude", 0))),
                "longitude": Decimal(str(cafe.get("longitude", 0))),
                "phone": cafe.get("phone"),
                "website": cafe.get("website"),
                "description": cafe.get("description"),
                "source_url": cafe.get("source_url"),
                "business_hours": cafe.get("business_hours"),
                "status": cafe.get("status", "pending"),
                "verification_count": cafe.get("verification_count", 1),
                "verified_at": cafe.get("verified_at"),
                "admin_verified": cafe.get("admin_verified", False),
                "navigator_id": cafe.get("navigator_id"),
                "vanguard_ids": cafe.get("vanguard_ids", []),
                "created_at": cafe.get("created_at", datetime.now(timezone.utc)),
                "updated_at": cafe.get("updated_at")
            })
        
        return CafeSearchResponse(
            cafes=formatted_cafes,
            total_count=len(formatted_cafes)
        )
        
    except Exception as e:
        print(f"Error in search_cafes: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search cafes: {str(e)}"
        )

@router.get("/pending", response_model=CafeSearchResponse)
async def get_pending_cafes_public(
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get all pending cafes (Public endpoint).
    
    Returns:
        List of pending cafes ordered by creation date
    """
    try:
        logger.info("======== FETCHING PENDING CAFES ========")
        result = supabase.table("cafes").select("*").eq("status", "pending").execute()
        logger.info(f"Query result count: {len(result.data) if result.data else 0}")
        
        if not result.data:
            logger.info("No pending cafes found")
            return CafeSearchResponse(cafes=[], total_count=0)
        
        logger.info(f"Found {len(result.data)} pending cafes")
        logger.info(f"First cafe raw data: {result.data[0] if result.data else 'None'}")
        
        # Sort by created_at descending (most recent first)
        # Handle None values by using a default date
        sorted_data = sorted(
            result.data, 
            key=lambda x: x.get("created_at") or "1970-01-01T00:00:00Z", 
            reverse=True
        )
        
        cafes = []
        for i, cafe in enumerate(sorted_data):
            try:
                logger.info(f"Processing cafe {i+1}/{len(sorted_data)}: {cafe.get('name')}")
                
                # Parse datetime fields
                created_at_str = cafe.get("created_at")
                logger.info(f"  created_at_str: {created_at_str}, type: {type(created_at_str)}")
                created_at = date_parser.parse(created_at_str) if created_at_str else datetime.now(timezone.utc)
                
                updated_at_str = cafe.get("updated_at")
                updated_at = date_parser.parse(updated_at_str) if updated_at_str else None
                
                verified_at_str = cafe.get("verified_at")
                verified_at = date_parser.parse(verified_at_str) if verified_at_str else None
                
                logger.info(f"  Creating CafeResponse object...")
                logger.info(f"  latitude: {cafe.get('latitude')}, type: {type(cafe.get('latitude'))}")
                logger.info(f"  longitude: {cafe.get('longitude')}, type: {type(cafe.get('longitude'))}")
                
                cafe_response = CafeResponse(
                    id=str(cafe.get("id")),
                    name=cafe.get("name"),
                    slug=cafe.get("slug"),
                    address=cafe.get("address"),
                    latitude=Decimal(str(cafe.get("latitude"))),
                    longitude=Decimal(str(cafe.get("longitude"))),
                    phone=cafe.get("phone"),
                    website=cafe.get("website"),
                    description=cafe.get("description"),
                    source_url=cafe.get("source_url"),
                    business_hours=cafe.get("business_hours"),
                    status=cafe.get("status", "pending"),
                    verification_count=cafe.get("verification_count", 1),
                    verified_at=verified_at,
                    admin_verified=cafe.get("admin_verified", False),
                    navigator_id=str(cafe.get("navigator_id")) if cafe.get("navigator_id") else None,
                    vanguard_ids=cafe.get("vanguard_ids", []),
                    created_at=created_at,
                    updated_at=updated_at
                )
                cafes.append(cafe_response)
                logger.info(f"  Successfully processed cafe: {cafe.get('name')}")
            except Exception as e:
                logger.error(f"Error processing cafe {cafe.get('name')}: {e}")
                import traceback
                logger.error(traceback.format_exc())
                raise
        
        logger.info(f"Returning {len(cafes)} cafes")
        return CafeSearchResponse(cafes=cafes, total_count=len(cafes))
        
    except Exception as e:
        logger.error(f"======== ERROR GETTING PENDING CAFES ========")
        logger.error(f"Error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        error_detail = f"Failed to get pending cafes: {str(e)}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail
        )

@router.get("/{cafe_identifier}", response_model=CafeResponse)
async def get_cafe_details(cafe_identifier: str):
    """
    Get detailed information about a specific cafe.
    
    - Can be accessed by ID (UUID) or slug (e.g., 'midnight-run-cafe')
    - Includes verification status
    - Includes Founding Crew info
    - Includes average rating and log count (computed from public logs)
    """
    try:
        supabase = get_supabase_client()
        
        slug_query = supabase.table("cafes").select("*").eq("slug", cafe_identifier).limit(1).execute()
        slug_rows = slug_query.data or []

        if slug_rows:
            cafe = slug_rows[0]
        else:
            id_query = supabase.table("cafes").select("*").eq("id", cafe_identifier).limit(1).execute()
            id_rows = id_query.data or []
            if not id_rows:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Cafe not found"
                )
            cafe = id_rows[0]
        
        cafe_id = cafe.get("id")
        
        if not cafe.get("slug") and cafe.get("name"):
            new_slug = generate_unique_slug(cafe.get("name", "cafe"), supabase, cafe_id)
            supabase.table("cafes").update({"slug": new_slug}).eq("id", cafe_id).execute()
            cafe["slug"] = new_slug
        
        # Parse datetime fields
        created_at_str = cafe.get("created_at")
        created_at = date_parser.parse(created_at_str) if created_at_str else datetime.now(timezone.utc)
        
        updated_at_str = cafe.get("updated_at")
        updated_at = date_parser.parse(updated_at_str) if updated_at_str else None
        
        verified_at_str = cafe.get("verified_at")
        verified_at = date_parser.parse(verified_at_str) if verified_at_str else None
        
        # Get total count and calculate average rating from all public logs
        all_logs_result = supabase.table("cafe_visits").select(
            "id, rating, visited_at, user_id, anonymous, comment, photo_urls, coffee_type"
        ).eq("cafe_id", cafe_id).eq("is_public", True).not_.is_("rating", "null").order(
            "visited_at", desc=True
        ).execute()
        
        average_rating = None
        log_count = 0
        recent_logs = []
        
        if all_logs_result.data:
            # Calculate average rating from all logs
            ratings = [log["rating"] for log in all_logs_result.data if log.get("rating")]
            if ratings:
                average_rating = sum(ratings) / len(ratings)
            
            log_count = len(all_logs_result.data)
            
            # Get recent logs (first 3)
            recent_logs_data = all_logs_result.data[:3]
            
            # Format recent logs
            for log in recent_logs_data:
                author_display_name = None
                author_username = None
                author_avatar_url = None
                
                if not log.get("anonymous"):
                    try:
                        user_result = supabase.table("users").select("username, display_name, avatar_url").eq("id", log["user_id"]).single().execute()
                        if user_result.data:
                            author_display_name = user_result.data.get("display_name") or user_result.data.get("username") or "User"
                            author_username = user_result.data.get("username")
                            author_avatar_url = user_result.data.get("avatar_url")
                    except Exception:
                        author_display_name = "User"
                else:
                    author_display_name = "Anonymous"
                
                recent_logs.append({
                    "id": log.get("id"),
                    "cafe_id": cafe_id,
                    "user_id": log.get("user_id"),
                    "visited_at": log.get("visited_at"),
                    "rating": log.get("rating"),
                    "comment": log.get("comment"),
                    "photo_urls": log.get("photo_urls", []),
                    "coffee_type": log.get("coffee_type"),
                    "is_public": True,
                    "anonymous": log.get("anonymous", False),
                    "author_display_name": author_display_name,
                    "author_username": author_username,
                    "author_avatar_url": author_avatar_url
                })
        
        # Get total beans dropped at this cafe
        total_beans_dropped = 0
        try:
            beans_result = supabase.table("cafe_beans").select("drop_count").eq("cafe_id", cafe_id).execute()
            if beans_result.data:
                total_beans_dropped = sum(bean.get("drop_count", 0) for bean in beans_result.data)
        except Exception:
            pass  # Silently handle if table doesn't exist or query fails
        
        # Collect all images from logs (sorted by oldest first for main_image selection)
        all_images = []
        main_image = cafe.get("main_image")  # First priority: Navigator's image set during registration
        
        try:
            # Get all logs with photos, ordered by oldest first (for main_image selection)
            logs_with_photos = supabase.table("cafe_visits").select(
                "photo_urls, visited_at"
            ).eq("cafe_id", cafe_id).eq("is_public", True).not_.is_("photo_urls", "null").order(
                "visited_at", desc=False  # Oldest first
            ).execute()
            
            if logs_with_photos.data:
                for log in logs_with_photos.data:
                    photo_urls = log.get("photo_urls", [])
                    if photo_urls:
                        all_images.extend(photo_urls)
                
                # If no main_image from registration, use first image from oldest log
                if not main_image and all_images:
                    main_image = all_images[0]
        except Exception as img_err:
            print(f"Error collecting images: {img_err}")
            pass
        
        response = {
            "id": cafe.get("id", ""),
            "name": cafe.get("name", ""),
            "slug": cafe.get("slug"),
            "address": cafe.get("address"),
            "latitude": Decimal(str(cafe.get("latitude", 0))),
            "longitude": Decimal(str(cafe.get("longitude", 0))),
            "phone": cafe.get("phone"),
            "website": cafe.get("website"),
            "description": cafe.get("description"),
            "source_url": cafe.get("source_url"),
            "business_hours": cafe.get("business_hours"),
            "status": cafe.get("status", "pending"),
            "verification_count": cafe.get("verification_count", 1),
            "verified_at": verified_at,
            "admin_verified": cafe.get("admin_verified", False),
            "navigator_id": cafe.get("navigator_id"),
            "vanguard_ids": cafe.get("vanguard_ids", []),
            "created_at": created_at,
            "updated_at": updated_at,
            "average_rating": float(average_rating) if average_rating else None,
            "log_count": log_count,
            "recent_logs": recent_logs,
            "total_beans_dropped": total_beans_dropped,
            "main_image": main_image,
            "images": all_images if all_images else None
        }
        
        # Populate Founding Crew details
        founding_crew = {}
        
        # 1. Navigator
        if cafe.get("navigator_id"):
            try:
                nav_user = supabase.table("users").select("id, username, display_name, avatar_url").eq("id", cafe["navigator_id"]).single().execute()
                if nav_user.data:
                    founding_crew["navigator"] = nav_user.data
            except Exception:
                pass
                
        # 2. Vanguards
        if cafe.get("vanguard_ids"):
            vanguards = []
            for vanguard in cafe["vanguard_ids"]:
                try:
                    van_user = supabase.table("users").select("id, username, display_name, avatar_url").eq("id", vanguard["user_id"]).single().execute()
                    if van_user.data:
                        vanguard_data = van_user.data
                        vanguard_data["role"] = vanguard.get("role")
                        vanguards.append(vanguard_data)
                except Exception:
                    continue
            if vanguards:
                founding_crew["vanguard"] = vanguards
                
        if founding_crew:
            response["founding_crew"] = founding_crew
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cafe details: {str(e)}"
        )

@router.post("/register")
async def register_cafe(
    request: CafeRegistrationRequest = Body(...),
    current_user = Depends(require_permission(Permission.CREATE_CAFE)),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Register a new cafe (UGC).
    
    - Location verification (50m distance check)
    - Duplicate detection (25m threshold)
    - Founding Crew recording
    - OSM reverse geocoding for address
    """
    try:
        # 1. Location verification (50m limit)
        max_distance = 50
        
        if request.user_location:
            user_lat = request.user_location.get("lat")
            user_lng = request.user_location.get("lng")
            
            if user_lat and user_lng:
                distance = calculate_earth_distance(
                    user_lat, user_lng,
                    float(request.latitude),
                    float(request.longitude)
                )
                
                if distance > max_distance:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"You must be within {max_distance}m of the cafe to register. Current distance: {distance:.0f}m"
                    )
        
        # 2. OSM Cross Check - verify location exists
        osm_service = get_osm_service()
        osm_data = await osm_service.reverse_geocode(
            float(request.latitude),
            float(request.longitude)
        )
        
        if not osm_data or not osm_data.get('road'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid location: This location does not exist on the map"
            )
        
        # Auto-complete address from OSM if not provided
        if not request.address and osm_data:
            request.address = osm_data.get('display_name', '')
        
        # 3. Check for duplicates (25m threshold)
        existing_cafe = await check_nearby_cafes(
            float(request.latitude),
            float(request.longitude),
            threshold_meters=25,
            supabase=supabase
        )
        
        if existing_cafe:
            # Existing cafe found - add check-in instead
            cafe_id = existing_cafe.get("id")
            
            # Check if user already checked in
            checkin_result = supabase.table("cafe_checkins").select("*").eq(
                "cafe_id", cafe_id
            ).eq(
                "user_id", current_user.id
            ).execute()
            
            if checkin_result.data and len(checkin_result.data) > 0:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="You have already checked in to this cafe"
                )
            
            # Get current check-in count
            current_count = existing_cafe.get("verification_count", 1)
            new_count = current_count + 1
            checkin_order = new_count
            
            # Determine role
            if checkin_order == 1:
                role = "navigator"
            else:
                role = "vanguard"
            
            # Add check-in
            checkin_data = {
                "cafe_id": cafe_id,
                "user_id": current_user.id,
                "checkin_order": checkin_order,
                "founding_role": role,
                "triggered_verification": False
            }
            
            # Update cafe verification count
            update_data = {
                "verification_count": new_count
            }
            
            # If 3rd check-in, trigger verification
            if new_count == 3:
                update_data["status"] = "verified"
                update_data["verified_at"] = datetime.now(timezone.utc).isoformat()
                checkin_data["triggered_verification"] = True
                
                # Record Founding Crew
                if checkin_order == 1:
                    update_data["navigator_id"] = current_user.id
                else:
                    # Add to vanguard_ids
                    vanguard_ids = existing_cafe.get("vanguard_ids", [])
                    vanguard_ids.append({
                        "user_id": current_user.id,
                        "role": f"vanguard_{checkin_order}",
                        "verified_at": datetime.now(timezone.utc).isoformat()
                    })
                    update_data["vanguard_ids"] = vanguard_ids
            
            # Transaction: Update cafe + add check-in
            supabase.table("cafes").update(update_data).eq("id", cafe_id).execute()
            supabase.table("cafe_checkins").insert(checkin_data).execute()
            
            # Fetch updated cafe
            result = supabase.table("cafes").select("*").eq("id", cafe_id).single().execute()
            
            return {
                "message": "Check-in recorded",
                "cafe": result.data,
                "check_in": checkin_data,
                "triggered_verification": checkin_data["triggered_verification"]
            }
        
        else:
            # New cafe - create it
            normalized_name = request.name.lower().strip()
            normalized_address = request.address.lower().strip() if request.address else ""
            slug = generate_unique_slug(request.name, supabase)
            
            cafe_data = {
                "name": request.name,
                "address": request.address,
                "latitude": float(request.latitude),
                "longitude": float(request.longitude),
                "phone": request.phone,
                "website": request.website,
                "description": request.description,
                "business_hours": request.business_hours,
                "status": "pending",
                "verification_count": 1,
                "navigator_id": current_user.id,
                "vanguard_ids": [],
                "source_type": request.source_type,
                "source_url": request.source_url,
                "normalized_name": normalized_name,
                "normalized_address": normalized_address,
                "slug": slug
            }
            
            # Insert cafe
            result = supabase.table("cafes").insert(cafe_data).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create cafe"
                )
            
            new_cafe = result.data[0]
            cafe_id = new_cafe.get("id")
            
            # Add first check-in (Navigator)
            checkin_data = {
                "cafe_id": cafe_id,
                "user_id": current_user.id,
                "checkin_order": 1,
                "founding_role": "navigator",
                "triggered_verification": False
            }
            
            supabase.table("cafe_checkins").insert(checkin_data).execute()
            
            # Auto-create first Drop Bean for Navigator (founding member)
            first_bean = supabase.table("cafe_beans").insert({
                "cafe_id": cafe_id,
                "user_id": current_user.id,
                "drop_count": 1,
                "growth_level": 1,
                "last_latitude": float(request.latitude),
                "last_longitude": float(request.longitude),
                "first_dropped_at": datetime.now(timezone.utc).isoformat(),
                "last_dropped_at": datetime.now(timezone.utc).isoformat()
            }).execute()
            
            if first_bean.data:
                # Record the drop event
                supabase.table("cafe_bean_drops").insert({
                    "bean_id": first_bean.data[0]["id"],
                    "user_id": current_user.id,
                    "cafe_id": cafe_id,
                    "latitude": float(request.latitude),
                    "longitude": float(request.longitude),
                    "dropped_at": datetime.now(timezone.utc).isoformat()
                }).execute()
            
            return {
                "message": "Cafe registered successfully",
                "cafe": new_cafe,
                "check_in": checkin_data,
                "triggered_verification": False,
                "auto_bean_dropped": True
            }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error registering cafe: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register cafe: {str(e)}"
        )

@router.get("/osm/search")
async def search_osm_location(
    q: str = Query(..., description="Postcode or address to search"),
    lat: Optional[float] = Query(None, description="User's latitude for location-based filtering"),
    lng: Optional[float] = Query(None, description="User's longitude for location-based filtering"),
    countrycode: Optional[str] = Query(None, description="ISO 3166-1 alpha-2 country code (e.g., 'ca', 'us')"),
    osm_service: OSMService = Depends(get_osm_service)
):
    """
    Search for location by postcode or address using OSM Nominatim.
    Returns coordinates for postcode lookup.
    If user location is provided, prioritizes results near the user.
    If countrycode is provided or detected from postcode, filters by country.
    """
    try:
        # Try to detect country from postcode format if not provided
        detected_country = None
        if not countrycode:
            detected_country = detect_country_from_postcode(q)
        
        countrycodes = countrycode or detected_country
        
        # Normalize postcode (remove spaces for better search)
        normalized_query = q.replace(' ', '').upper()
        
        # Enhance query with country name if countrycode is provided
        search_query = q
        if countrycodes:
            # Map country code to country name for better search results
            country_names = {
                'ca': 'Canada',
                'us': 'United States',
                'gb': 'United Kingdom',
                'au': 'Australia',
                'kr': 'South Korea',
                'jp': 'Japan',
                'de': 'Germany',
                'fr': 'France',
                'es': 'Spain',
                'it': 'Italy',
                'nl': 'Netherlands',
                'be': 'Belgium',
                'ch': 'Switzerland',
                'at': 'Austria',
                'se': 'Sweden',
                'no': 'Norway',
                'dk': 'Denmark',
                'fi': 'Finland',
                'pl': 'Poland',
                'pt': 'Portugal',
                'ie': 'Ireland',
                'nz': 'New Zealand',
                'sg': 'Singapore',
                'my': 'Malaysia',
                'th': 'Thailand',
                'id': 'Indonesia',
                'ph': 'Philippines',
                'vn': 'Vietnam',
                'tw': 'Taiwan',
                'hk': 'Hong Kong',
                'cn': 'China',
                'in': 'India',
                'br': 'Brazil',
                'mx': 'Mexico'
            }
            country_name = country_names.get(countrycodes.lower())
            if country_name:
                # Try multiple query formats for better results
                # Format 1: Original with country
                # Format 2: Normalized (no spaces) with country
                # Format 3: Original postcode only (fallback)
                search_queries = [
                    f"{q}, {country_name}",
                    f"{normalized_query}, {country_name}",
                    q
                ]
            else:
                search_queries = [q, normalized_query]
        else:
            search_queries = [q, normalized_query]
        
        # If user location is provided, use viewbox to prioritize nearby results
        viewbox = None
        if lat is not None and lng is not None:
            # Create a viewbox around user location (±5 degrees = ~500km radius)
            viewbox = {
                'west': lng - 5.0,
                'south': lat - 5.0,
                'east': lng + 5.0,
                'north': lat + 5.0
            }
        
        # Try multiple query formats
        results = []
        for query in search_queries:
            # Try search with country filter first
            temp_results = await osm_service.search(query, limit=10, countrycodes=countrycodes, viewbox=viewbox)
            
            if temp_results and len(temp_results) > 0:
                results = temp_results
                break
            
            # If no results with country filter, try without country filter
            if countrycodes:
                temp_results = await osm_service.search(query, limit=10, countrycodes=None, viewbox=viewbox)
                if temp_results and len(temp_results) > 0:
                    results = temp_results
                    break
        
        if not results or len(results) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )
        
        # Filter results by country if countrycode is provided
        if countrycodes:
            filtered_results = []
            country_names_map = {
                'ca': ['canada'],
                'us': ['united states', 'united states of america'],
                'gb': ['united kingdom', 'great britain'],
                'au': ['australia'],
                'kr': ['south korea', 'korea, republic of', 'korea'],
                'jp': ['japan'],
                'de': ['germany'],
                'fr': ['france'],
                'es': ['spain'],
                'it': ['italy'],
                'nl': ['netherlands'],
                'be': ['belgium'],
                'ch': ['switzerland'],
                'at': ['austria'],
                'se': ['sweden'],
                'no': ['norway'],
                'dk': ['denmark'],
                'fi': ['finland'],
                'pl': ['poland'],
                'pt': ['portugal'],
                'ie': ['ireland'],
                'nz': ['new zealand'],
                'sg': ['singapore'],
                'my': ['malaysia'],
                'th': ['thailand'],
                'id': ['indonesia'],
                'ph': ['philippines'],
                'vn': ['vietnam'],
                'tw': ['taiwan'],
                'hk': ['hong kong'],
                'cn': ['china'],
                'in': ['india'],
                'br': ['brazil'],
                'mx': ['mexico']
            }
            valid_country_names = country_names_map.get(countrycodes.lower(), [])
            
            for result in results:
                result_address = result.get("address", {})
                result_country = result_address.get("country", "").lower()
                if valid_country_names and any(name in result_country for name in valid_country_names):
                    filtered_results.append(result)
            
            if filtered_results:
                results = filtered_results
        
        # If user location is provided, find the closest result
        if lat is not None and lng is not None:
            best_result = results[0]
            min_distance = float('inf')
            
            for result in results:
                result_lat = float(result.get("lat", 0))
                result_lng = float(result.get("lon", 0))
                distance = calculate_earth_distance(lat, lng, result_lat, result_lng)
                
                if distance < min_distance:
                    min_distance = distance
                    best_result = result
            
            first_result = best_result
        else:
            first_result = results[0]
        
        return {
            "lat": float(first_result.get("lat", 0)),
            "lng": float(first_result.get("lon", 0)),
            "display_name": first_result.get("display_name", "")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error searching location: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search location: {str(e)}"
        )

@router.get("/osm/reverse")
async def reverse_geocode_location(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    osm_service: OSMService = Depends(get_osm_service)
):
    """
    Reverse geocode coordinates to address using OSM Nominatim.
    Returns address information for given coordinates.
    """
    try:
        osm_data = await osm_service.reverse_geocode(lat, lng)
        
        if not osm_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found for this location"
            )
        
        # Map country name to ISO 3166-1 alpha-2 code
        country_name = osm_data.get("country", "")
        country_code = get_country_code_from_name(country_name) if country_name else None
        
        return {
            "display_name": osm_data.get("display_name", ""),
            "road": osm_data.get("road"),
            "city": osm_data.get("city"),
            "province": osm_data.get("province"),
            "country": country_name,
            "country_code": country_code,
            "postcode": osm_data.get("postcode")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error reverse geocoding location: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reverse geocode location: {str(e)}"
        )

@router.get("/admin/pending", response_model=CafeSearchResponse)
async def get_pending_cafes(
    current_user = Depends(require_admin_role),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get all pending cafes (Admin only).
    
    Returns:
        List of pending cafes with verification info
    """
    try:
        result = supabase.table("cafes").select("*").eq("status", "pending").execute()
        
        if not result.data:
            return CafeSearchResponse(cafes=[], total_count=0)
        
        # Sort by created_at descending (most recent first)
        # Handle None values by using a default date
        sorted_data = sorted(
            result.data, 
            key=lambda x: x.get("created_at") or "1970-01-01T00:00:00Z", 
            reverse=True
        )
        
        cafes = []
        for cafe in sorted_data:
            # Parse datetime fields
            created_at_str = cafe.get("created_at")
            created_at = date_parser.parse(created_at_str) if created_at_str else datetime.now(timezone.utc)
            
            updated_at_str = cafe.get("updated_at")
            updated_at = date_parser.parse(updated_at_str) if updated_at_str else None
            
            verified_at_str = cafe.get("verified_at")
            verified_at = date_parser.parse(verified_at_str) if verified_at_str else None
            
            cafes.append(CafeResponse(
                id=str(cafe.get("id")),
                name=cafe.get("name"),
                address=cafe.get("address"),
                latitude=Decimal(str(cafe.get("latitude"))),
                longitude=Decimal(str(cafe.get("longitude"))),
                phone=cafe.get("phone"),
                website=cafe.get("website"),
                description=cafe.get("description"),
                status=cafe.get("status", "pending"),
                verification_count=cafe.get("verification_count", 1),
                verified_at=verified_at,
                admin_verified=cafe.get("admin_verified", False),
                navigator_id=str(cafe.get("navigator_id")) if cafe.get("navigator_id") else None,
                vanguard_ids=cafe.get("vanguard_ids", []),
                created_at=created_at,
                updated_at=updated_at
            ))
        
        return CafeSearchResponse(cafes=cafes, total_count=len(cafes))
        
    except Exception as e:
        print(f"Error getting pending cafes: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pending cafes: {str(e)}"
        )

@router.post("/admin/{cafe_id}/verify")
async def admin_verify_cafe(
    cafe_id: str,
    current_user = Depends(require_admin_role),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Admin verify a cafe (Admin only).
    Sets status to 'verified' and admin_verified to True.
    Founding Crew information is preserved (1 or 2 users).
    
    Args:
        cafe_id: ID of the cafe to verify
        
    Returns:
        Updated cafe information
    """
    try:
        # Get cafe
        cafe_result = supabase.table("cafes").select("*").eq("id", cafe_id).single().execute()
        
        if not cafe_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cafe not found"
            )
        
        cafe = cafe_result.data
        
        # Update cafe: set status to verified, admin_verified to True
        update_data = {
            "status": "verified",
            "admin_verified": True,
            "verified_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Verify count remains as is (1 or 2)
        # Founding Crew info is preserved
        
        result = supabase.table("cafes").update(update_data).eq("id", cafe_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to verify cafe"
            )
        
        updated_cafe = result.data[0]
        
        return {
            "message": "Cafe verified by admin",
            "cafe": CafeResponse(
                id=str(updated_cafe.get("id")),
                name=updated_cafe.get("name"),
                address=updated_cafe.get("address"),
                latitude=updated_cafe.get("latitude"),
                longitude=updated_cafe.get("longitude"),
                phone=updated_cafe.get("phone"),
                website=updated_cafe.get("website"),
                description=updated_cafe.get("description"),
                status=updated_cafe.get("status"),
                verification_count=updated_cafe.get("verification_count"),
                verified_at=updated_cafe.get("verified_at"),
                admin_verified=updated_cafe.get("admin_verified", False),
                navigator_id=str(updated_cafe.get("navigator_id")) if updated_cafe.get("navigator_id") else None,
                vanguard_ids=updated_cafe.get("vanguard_ids", []),
                created_at=updated_cafe.get("created_at"),
                updated_at=updated_cafe.get("updated_at")
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verifying cafe: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify cafe: {str(e)}"
        )

@router.delete("/admin/{cafe_id}")
async def admin_delete_cafe(
    cafe_id: str,
    current_user = Depends(require_admin_role),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Delete a cafe (Admin only).
    Hard delete - removes cafe and related data (cascade).
    
    Args:
        cafe_id: ID of the cafe to delete
        
    Returns:
        Success message
    """
    try:
        # Check if cafe exists
        cafe_result = supabase.table("cafes").select("id").eq("id", cafe_id).single().execute()
        
        if not cafe_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cafe not found"
            )
        
        # Delete cafe (cascade deletes checkins and visits)
        result = supabase.table("cafes").delete().eq("id", cafe_id).execute()
        
        return {
            "message": "Cafe deleted successfully",
            "cafe_id": cafe_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting cafe: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete cafe: {str(e)}"
        )


# =========================================================
# Admin Update Cafe
# =========================================================

class AdminCafeUpdateRequest(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    business_hours: Optional[dict] = None  # JSON object with day-by-day hours

@router.patch("/admin/{cafe_id}")
async def admin_update_cafe(
    cafe_id: str,
    request: AdminCafeUpdateRequest = Body(...),
    current_user = Depends(require_admin_role),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Update a cafe's information (Admin only).
    Only non-null fields will be updated.
    
    Args:
        cafe_id: ID of the cafe to update
        request: Fields to update
        
    Returns:
        Updated cafe data
    """
    try:
        # Check if cafe exists
        cafe_result = supabase.table("cafes").select("*").eq("id", cafe_id).single().execute()
        
        if not cafe_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cafe not found"
            )
        
        # Build update data (only include non-null fields)
        update_data = {}
        if request.name is not None:
            update_data["name"] = request.name
        if request.address is not None:
            update_data["address"] = request.address
        if request.phone is not None:
            update_data["phone"] = request.phone
        if request.website is not None:
            update_data["website"] = request.website
        if request.description is not None:
            update_data["description"] = request.description
        if request.business_hours is not None:
            update_data["business_hours"] = request.business_hours
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Add updated_at timestamp
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Update the cafe
        result = supabase.table("cafes").update(update_data).eq("id", cafe_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update cafe"
            )
        
        return {
            "message": "Cafe updated successfully",
            "cafe": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating cafe: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update cafe: {str(e)}"
        )


# =========================================================
# Drop Bean Feature
# =========================================================

def calculate_growth_level(drop_count: int) -> int:
    """Calculate growth level based on drop count."""
    if drop_count >= 15:
        return 5  # Fruiting Tree
    elif drop_count >= 10:
        return 4  # Sapling
    elif drop_count >= 5:
        return 3  # Growing
    elif drop_count >= 3:
        return 2  # Sprouting
    return 1  # Sleeping Bean


GROWTH_LEVEL_NAMES = {
    1: "Sleeping Bean",
    2: "Sprouting",
    3: "Growing",
    4: "Sapling",
    5: "Fruiting Tree"
}


@router.post("/{cafe_id}/drop-bean")
async def drop_bean(
    cafe_id: str,
    user_lat: float = Query(..., ge=-90, le=90, description="User's current latitude"),
    user_lng: float = Query(..., ge=-180, le=180, description="User's current longitude"),
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Drop a bean at a cafe.
    
    - Requires user to be within 50m of the cafe
    - Limited to once per day per cafe
    - Updates growth level based on total drops
    
    Growth Levels:
    - Lv 1: Sleeping Bean (1 drop)
    - Lv 2: Sprouting (3 drops)
    - Lv 3: Growing (5 drops)
    - Lv 4: Sapling (10 drops)
    - Lv 5: Fruiting Tree (15 drops)
    """
    try:
        # 1. Check if cafe exists
        cafe_result = supabase.table("cafes").select("id, name, latitude, longitude").eq("id", cafe_id).single().execute()
        
        if not cafe_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cafe not found"
            )
        
        cafe = cafe_result.data
        cafe_lat = float(cafe.get("latitude", 0))
        cafe_lng = float(cafe.get("longitude", 0))
        
        # 2. Distance verification (50m limit)
        distance = calculate_earth_distance(user_lat, user_lng, cafe_lat, cafe_lng)
        max_distance = 50  # meters
        
        if distance > max_distance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You must be within {max_distance}m of the cafe to drop a bean. Current distance: {distance:.0f}m"
            )
        
        # 2.5 Fraud detection - check location consistency (Option A: log only)
        check_location_consistency(
            supabase=supabase,
            user_id=current_user.id,
            current_lat=user_lat,
            current_lng=user_lng,
            action_type="drop_bean"
        )
        
        # 3. Check for existing bean record (user + cafe)
        bean_result = supabase.table("cafe_beans").select("*").eq(
            "cafe_id", cafe_id
        ).eq(
            "user_id", current_user.id
        ).execute()
        
        existing_bean = bean_result.data[0] if bean_result.data else None
        
        # 4. Check daily limit - already dropped today?
        today = datetime.now(timezone.utc).date().isoformat()
        
        if existing_bean:
            # Check if dropped today
            last_dropped = existing_bean.get("last_dropped_at")
            if last_dropped:
                last_dropped_date = date_parser.parse(last_dropped).date().isoformat()
                if last_dropped_date == today:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="You have already dropped a bean here today. Come back tomorrow!"
                    )
        
        # 5. Create or update bean record
        if existing_bean:
            # Update existing bean
            new_drop_count = existing_bean.get("drop_count", 1) + 1
            new_growth_level = calculate_growth_level(new_drop_count)
            
            supabase.table("cafe_beans").update({
                "drop_count": new_drop_count,
                "growth_level": new_growth_level,
                "last_latitude": user_lat,
                "last_longitude": user_lng,
                "last_dropped_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", existing_bean["id"]).execute()
            
            bean_id = existing_bean["id"]
            drop_count = new_drop_count
            growth_level = new_growth_level
            
        else:
            # Create new bean
            new_bean = supabase.table("cafe_beans").insert({
                "cafe_id": cafe_id,
                "user_id": current_user.id,
                "drop_count": 1,
                "growth_level": 1,
                "last_latitude": user_lat,
                "last_longitude": user_lng,
                "first_dropped_at": datetime.now(timezone.utc).isoformat(),
                "last_dropped_at": datetime.now(timezone.utc).isoformat()
            }).execute()
            
            bean_id = new_bean.data[0]["id"]
            drop_count = 1
            growth_level = 1
        
        # 6. Record the drop in cafe_bean_drops
        supabase.table("cafe_bean_drops").insert({
            "bean_id": bean_id,
            "user_id": current_user.id,
            "cafe_id": cafe_id,
            "latitude": user_lat,
            "longitude": user_lng,
            "dropped_at": datetime.now(timezone.utc).isoformat()
        }).execute()
        
        # 7. Check for level up
        old_level = existing_bean.get("growth_level", 0) if existing_bean else 0
        leveled_up = growth_level > old_level
        
        # 8. Calculate and update streak
        streak_info = await calculate_user_streak(supabase, current_user.id)
        
        # 9. Auto-verification: Check if 3 unique users have dropped beans
        triggered_verification = False
        cafe_status_result = supabase.table("cafes").select("status, navigator_id, vanguard_ids").eq("id", cafe_id).single().execute()
        cafe_status = cafe_status_result.data.get("status") if cafe_status_result.data else "pending"
        
        if cafe_status == "pending":
            # Count unique users who dropped beans at this cafe
            unique_users_result = supabase.table("cafe_beans").select("user_id").eq("cafe_id", cafe_id).execute()
            unique_user_ids = list(set([bean["user_id"] for bean in unique_users_result.data])) if unique_users_result.data else []
            unique_user_count = len(unique_user_ids)
            
            if unique_user_count >= 3:
                # Get the order of bean drops to determine founding crew
                drops_result = supabase.table("cafe_beans").select(
                    "user_id, first_dropped_at"
                ).eq("cafe_id", cafe_id).order("first_dropped_at", desc=False).limit(3).execute()
                
                founding_drops = drops_result.data if drops_result.data else []
                navigator_id = cafe_status_result.data.get("navigator_id")
                
                # Build vanguard_ids (2nd and 3rd droppers)
                vanguard_ids = []
                for idx, drop in enumerate(founding_drops):
                    if drop["user_id"] != navigator_id:
                        role = f"vanguard_{idx + 1}"
                        vanguard_ids.append({
                            "user_id": drop["user_id"],
                            "role": role,
                            "verified_at": datetime.now(timezone.utc).isoformat()
                        })
                
                # Update cafe to verified
                supabase.table("cafes").update({
                    "status": "verified",
                    "verified_at": datetime.now(timezone.utc).isoformat(),
                    "vanguard_ids": vanguard_ids
                }).eq("id", cafe_id).execute()
                
                triggered_verification = True
                logger.info(f"Cafe {cafe_id} auto-verified by 3 unique bean droppers")
        
        return {
            "message": "Bean dropped successfully!",
            "cafe_id": cafe_id,
            "cafe_name": cafe.get("name"),
            "drop_count": drop_count,
            "growth_level": growth_level,
            "growth_level_name": GROWTH_LEVEL_NAMES.get(growth_level, "Unknown"),
            "leveled_up": leveled_up,
            "next_level_at": get_next_level_threshold(drop_count),
            "streak": streak_info,
            "triggered_verification": triggered_verification
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error dropping bean: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to drop bean: {str(e)}"
        )


async def calculate_user_streak(supabase: Client, user_id: str) -> dict:
    """
    Calculate user's drop streak based on their drop history.
    
    A streak is maintained if the user drops a bean within 7 days of their last drop.
    The streak increases by 1 for each consecutive "active period" (days with at least one drop).
    
    Returns:
        dict with current_streak, max_streak, last_drop_date
    """
    try:
        from datetime import timedelta
        
        # Get user's last 30 drops ordered by date
        drops_result = supabase.table("cafe_bean_drops").select(
            "dropped_at"
        ).eq(
            "user_id", user_id
        ).order(
            "dropped_at", desc=True
        ).limit(100).execute()
        
        if not drops_result.data:
            return {
                "current_streak": 1,  # This is their first drop
                "max_streak": 1,
                "last_drop_date": datetime.now(timezone.utc).date().isoformat(),
                "streak_active": True
            }
        
        # Parse dates and get unique drop dates
        drop_dates = set()
        for drop in drops_result.data:
            dropped_at = drop.get("dropped_at")
            if dropped_at:
                drop_date = date_parser.parse(dropped_at).date()
                drop_dates.add(drop_date)
        
        sorted_dates = sorted(drop_dates, reverse=True)
        today = datetime.now(timezone.utc).date()
        
        # Add today since we just dropped
        if today not in drop_dates:
            sorted_dates.insert(0, today)
        
        # Calculate current streak (consecutive days with drops within 7-day gaps)
        current_streak = 1
        if len(sorted_dates) > 1:
            for i in range(len(sorted_dates) - 1):
                gap = (sorted_dates[i] - sorted_dates[i + 1]).days
                if gap <= 7:  # Within 7-day window
                    current_streak += 1
                else:
                    break
        
        # Get or update max streak from user profile
        user_result = supabase.table("users").select(
            "max_streak, current_streak"
        ).eq("id", user_id).single().execute()
        
        stored_max_streak = 1
        if user_result.data:
            stored_max_streak = user_result.data.get("max_streak") or 1
        
        new_max_streak = max(current_streak, stored_max_streak)
        
        # Update user's streak in database
        supabase.table("users").update({
            "current_streak": current_streak,
            "max_streak": new_max_streak,
            "last_drop_date": today.isoformat()
        }).eq("id", user_id).execute()
        
        return {
            "current_streak": current_streak,
            "max_streak": new_max_streak,
            "last_drop_date": today.isoformat(),
            "streak_active": True
        }
        
    except Exception as e:
        print(f"Error calculating streak: {e}")
        # Return default if error
        return {
            "current_streak": 1,
            "max_streak": 1,
            "last_drop_date": datetime.now(timezone.utc).date().isoformat(),
            "streak_active": True
        }


def get_next_level_threshold(current_drops: int) -> Optional[int]:
    """Get the drop count needed for next level."""
    thresholds = [3, 5, 10, 15]
    for threshold in thresholds:
        if current_drops < threshold:
            return threshold
    return None  # Already max level


@router.get("/{cafe_id}/my-bean")
async def get_my_bean(
    cafe_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get user's bean status for a specific cafe.
    Returns drop count, growth level, and whether they can drop today.
    """
    try:
        # Get bean record
        bean_result = supabase.table("cafe_beans").select("*").eq(
            "cafe_id", cafe_id
        ).eq(
            "user_id", current_user.id
        ).execute()
        
        if not bean_result.data:
            return {
                "has_bean": False,
                "drop_count": 0,
                "growth_level": 0,
                "growth_level_name": None,
                "can_drop_today": True,
                "next_level_at": 1
            }
        
        bean = bean_result.data[0]
        
        # Check if can drop today
        today = datetime.now(timezone.utc).date().isoformat()
        last_dropped = bean.get("last_dropped_at")
        can_drop_today = True
        
        if last_dropped:
            last_dropped_date = date_parser.parse(last_dropped).date().isoformat()
            can_drop_today = last_dropped_date != today
        
        growth_level = bean.get("growth_level", 1)
        drop_count = bean.get("drop_count", 1)
        
        return {
            "has_bean": True,
            "drop_count": drop_count,
            "growth_level": growth_level,
            "growth_level_name": GROWTH_LEVEL_NAMES.get(growth_level, "Unknown"),
            "can_drop_today": can_drop_today,
            "first_dropped_at": bean.get("first_dropped_at"),
            "last_dropped_at": bean.get("last_dropped_at"),
            "next_level_at": get_next_level_threshold(drop_count)
        }
        
    except Exception as e:
        print(f"Error getting bean: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get bean status: {str(e)}"
        )


@router.get("/user/beans")
async def get_user_beans(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):
    """
    Get all beans for current user (for My Beans page / heatmap).
    Includes cafe info and growth status.
    """
    try:
        # Get user's beans with cafe info
        beans_result = supabase.table("cafe_beans").select(
            "*, cafes(id, name, slug, address, latitude, longitude)"
        ).eq(
            "user_id", current_user.id
        ).order(
            "last_dropped_at", desc=True
        ).range(offset, offset + limit - 1).execute()
        
        beans = []
        for bean in (beans_result.data or []):
            cafe = bean.get("cafes", {})
            growth_level = bean.get("growth_level", 1)
            
            beans.append({
                "id": bean.get("id"),
                "cafe_id": bean.get("cafe_id"),
                "cafe_name": cafe.get("name"),
                "cafe_slug": cafe.get("slug"),
                "cafe_address": cafe.get("address"),
                "latitude": cafe.get("latitude"),
                "longitude": cafe.get("longitude"),
                "drop_count": bean.get("drop_count"),
                "growth_level": growth_level,
                "growth_level_name": GROWTH_LEVEL_NAMES.get(growth_level, "Unknown"),
                "first_dropped_at": bean.get("first_dropped_at"),
                "last_dropped_at": bean.get("last_dropped_at")
            })
        
        return {
            "beans": beans,
            "total_count": len(beans),
            "offset": offset,
            "limit": limit
        }
        
    except Exception as e:
        print(f"Error getting user beans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user beans: {str(e)}"
        )
