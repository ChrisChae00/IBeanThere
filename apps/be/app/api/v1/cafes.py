"""
Cafe API endpoints for UGC verification system.

- Search cafes by location (PostGIS earth_distance)
- Register new cafe (with location verification)
- Get cafe details (with Founding Crew info)
"""

from fastapi import APIRouter, Query, HTTPException, status, Depends, Body
from typing import Optional, List
from decimal import Decimal
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
from supabase import Client
from datetime import datetime, timezone

router = APIRouter()

# Initialize services
_osm_service = None

def get_osm_service() -> OSMService:
    global _osm_service
    if _osm_service is None:
        _osm_service = OSMService()
    return _osm_service

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
    radius: int = Query(default=2000, ge=100, le=5000, description="Search radius in meters"),
    status_filter: Optional[str] = Query(None, description="Filter by status: 'pending' | 'verified'")
):
    """
    Search for cafes near a location using PostGIS.
    
    - Uses earth_distance() for accurate distance calculation
    - Returns cafes within radius
    - Optional status filter
    """
    try:
        supabase = get_supabase_client()
        
        # Calculate bounding box for optimization
        lat_offset = radius / 111000
        lng_offset = radius / (111000 * abs(lat)) if lat != 0 else radius / 111000
        
        # Query with bounding box (optimization)
        query = supabase.table("cafes").select("*").gte(
            "latitude", lat - lat_offset
        ).lte(
            "latitude", lat + lat_offset
        ).gte(
            "longitude", lng - lng_offset
        ).lte(
            "longitude", lng + lng_offset
        )
        
        if status_filter:
            query = query.eq("status", status_filter)
        
        result = query.execute()
        
        if not result.data:
            return CafeSearchResponse(cafes=[], total_count=0)
        
        # Filter by exact distance
        valid_cafes = []
        for cafe in result.data:
            distance = calculate_earth_distance(
                lat, lng,
                float(cafe.get("latitude", 0)),
                float(cafe.get("longitude", 0))
            )
            if distance <= radius:
                valid_cafes.append(cafe)
        
        # Format response
        formatted_cafes = []
        for cafe in valid_cafes:
            formatted_cafes.append({
                "id": cafe.get("id", ""),
                "name": cafe.get("name", ""),
                "address": cafe.get("address"),
                "latitude": Decimal(str(cafe.get("latitude", 0))),
                "longitude": Decimal(str(cafe.get("longitude", 0))),
                "phone": cafe.get("phone"),
                "website": cafe.get("website"),
                "description": cafe.get("description"),
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

@router.get("/{cafe_id}", response_model=CafeResponse)
async def get_cafe_details(cafe_id: str):
    """
    Get detailed information about a specific cafe.
    
    - Includes verification status
    - Includes Founding Crew info
    """
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("cafes").select("*").eq("id", cafe_id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cafe not found"
            )
        
        cafe = result.data
        
        return {
            "id": cafe.get("id", ""),
            "name": cafe.get("name", ""),
            "address": cafe.get("address"),
            "latitude": Decimal(str(cafe.get("latitude", 0))),
            "longitude": Decimal(str(cafe.get("longitude", 0))),
            "phone": cafe.get("phone"),
            "website": cafe.get("website"),
            "description": cafe.get("description"),
            "status": cafe.get("status", "pending"),
            "verification_count": cafe.get("verification_count", 1),
            "verified_at": cafe.get("verified_at"),
            "admin_verified": cafe.get("admin_verified", False),
            "navigator_id": cafe.get("navigator_id"),
            "vanguard_ids": cafe.get("vanguard_ids", []),
            "created_at": cafe.get("created_at", datetime.now(timezone.utc)),
            "updated_at": cafe.get("updated_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cafe details: {str(e)}"
        )

@router.post("/register")
async def register_cafe(
    request: CafeRegistrationRequest = Body(...),
    current_user = Depends(get_current_user),
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
        if request.user_location:
            user_lat = request.user_location.get("lat")
            user_lng = request.user_location.get("lng")
            
            if user_lat and user_lng:
                distance = calculate_earth_distance(
                    user_lat, user_lng,
                    float(request.latitude),
                    float(request.longitude)
                )
                
                if distance > 50:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"You must be within 50m of the cafe to register. Current distance: {distance:.0f}m"
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
            
            cafe_data = {
                "name": request.name,
                "address": request.address,
                "latitude": float(request.latitude),
                "longitude": float(request.longitude),
                "phone": request.phone,
                "website": request.website,
                "description": request.description,
                "status": "pending",
                "verification_count": 1,
                "navigator_id": current_user.id,
                "vanguard_ids": [],
                "source_type": request.source_type,
                "source_url": request.source_url,
                "normalized_name": normalized_name,
                "normalized_address": normalized_address
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
            
            return {
                "message": "Cafe registered successfully",
                "cafe": new_cafe,
                "check_in": checkin_data,
                "triggered_verification": False
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
        result = supabase.table("cafes").select("*").eq("status", "pending").order("created_at", desc=True).execute()
        
        if not result.data:
            return CafeSearchResponse(cafes=[], total_count=0)
        
        cafes = []
        for cafe in result.data:
            cafes.append(CafeResponse(
                id=str(cafe.get("id")),
                name=cafe.get("name"),
                address=cafe.get("address"),
                latitude=cafe.get("latitude"),
                longitude=cafe.get("longitude"),
                phone=cafe.get("phone"),
                website=cafe.get("website"),
                description=cafe.get("description"),
                status=cafe.get("status", "pending"),
                verification_count=cafe.get("verification_count", 1),
                verified_at=cafe.get("verified_at"),
                admin_verified=cafe.get("admin_verified", False),
                navigator_id=str(cafe.get("navigator_id")) if cafe.get("navigator_id") else None,
                vanguard_ids=cafe.get("vanguard_ids", []),
                created_at=cafe.get("created_at"),
                updated_at=cafe.get("updated_at")
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
        result = supabase.table("cafes").select("*").eq("status", "pending").order("created_at", desc=True).execute()
        
        if not result.data:
            return CafeSearchResponse(cafes=[], total_count=0)
        
        cafes = []
        for cafe in result.data:
            cafes.append(CafeResponse(
                id=str(cafe.get("id")),
                name=cafe.get("name"),
                address=cafe.get("address"),
                latitude=cafe.get("latitude"),
                longitude=cafe.get("longitude"),
                phone=cafe.get("phone"),
                website=cafe.get("website"),
                description=cafe.get("description"),
                status=cafe.get("status", "pending"),
                verification_count=cafe.get("verification_count", 1),
                verified_at=cafe.get("verified_at"),
                admin_verified=cafe.get("admin_verified", False),
                navigator_id=str(cafe.get("navigator_id")) if cafe.get("navigator_id") else None,
                vanguard_ids=cafe.get("vanguard_ids", []),
                created_at=cafe.get("created_at"),
                updated_at=cafe.get("updated_at")
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
