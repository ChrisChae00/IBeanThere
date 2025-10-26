import os
import httpx
from typing import List, Dict, Optional
from fastapi import HTTPException, status
from app.config import settings

class GooglePlacesService:
    """Service for interacting with Google Places API."""
    
    def __init__(self):
        # Try multiple ways to get the API key
        self.api_key = (
            os.getenv("GOOGLE_MAPS_API_KEY") or 
            os.getenv("GOOGLE_MAP_API_KEY") or 
            ""
        )
        
        # Debug: print what we found
        print(f"DEBUG: GOOGLE_MAPS_API_KEY = {self.api_key[:10]}..." if self.api_key else "DEBUG: GOOGLE_MAPS_API_KEY not found")
        
        if not self.api_key:
            raise ValueError("GOOGLE_MAPS_API_KEY environment variable is not set. Please check your .env file in apps/be/.env")
        
        self.base_url = "https://maps.googleapis.com/maps/api/place"
        self.timeout = httpx.Timeout(10.0)
    
    async def search_nearby_cafes(self, lat: float, lng: float, radius: int = 2000) -> List[Dict]:
        """
        Search for nearby cafes using Google Places Nearby Search API.
        
        Args:
            lat: Latitude
            lng: Longitude
            radius: Search radius in meters
            
        Returns:
            List of cafe place details
        """
        url = f"{self.base_url}/nearbysearch/json"
        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "type": "cafe",
            "key": self.api_key
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if data["status"] != "OK":
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Google Places API error: {data.get('status')}"
                    )
                
                results = data.get("results", [])
                return results
                
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to connect to Google Places API: {str(e)}"
            )
    
    async def get_place_details(self, place_id: str) -> Dict:
        """
        Get detailed information about a place.
        
        Args:
            place_id: Google Places place_id
            
        Returns:
            Place details dictionary
        """
        url = f"{self.base_url}/details/json"
        params = {
            "place_id": place_id,
            "fields": "place_id,name,formatted_address,formatted_phone_number,website,url,geometry,rating,user_ratings_total,types,opening_hours,photos",
            "key": self.api_key
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if data["status"] != "OK":
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Google Places API error: {data.get('status')}"
                    )
                
                return data.get("result", {})
                
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to connect to Google Places API: {str(e)}"
            )
    
    def parse_cafe_data(self, place_data: Dict) -> Dict:
        """
        Parse Google Places API response into cafe data structure.
        
        Args:
            place_data: Raw place data from Google Places API
            
        Returns:
            Parsed cafe data dictionary
        """
        cafe_data = {
            "google_place_id": place_data.get("place_id"),
            "name": place_data.get("name"),
            "address": place_data.get("formatted_address", ""),
            "phone_number": place_data.get("formatted_phone_number"),
            "website": place_data.get("website"),
            "google_maps_url": place_data.get("url", ""),
            "latitude": str(place_data.get("geometry", {}).get("location", {}).get("lat", 0)),
            "longitude": str(place_data.get("geometry", {}).get("location", {}).get("lng", 0)),
            "google_rating": str(place_data.get("rating", 0)) if place_data.get("rating") else None,
            "google_review_count": place_data.get("user_ratings_total", 0),
            "google_types": place_data.get("types", []),
            "opening_hours": {
                "open_now": place_data.get("opening_hours", {}).get("open_now"),
                "weekday_text": place_data.get("opening_hours", {}).get("weekday_text", [])
            } if place_data.get("opening_hours") else None
        }
        
        return cafe_data
    
    def check_api_quota(self) -> Dict:
        """
        Placeholder for API quota checking.
        In production, implement actual quota tracking.
        """
        return {
            "remaining_calls": 28000,
            "estimated_monthly_usage": 0
        }

