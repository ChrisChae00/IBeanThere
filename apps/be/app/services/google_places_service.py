"""
Google Places API (New) service for extracting cafe information from Google Maps URLs.

Supports:
- Standard Google Maps place URLs
- Short links (maps.app.goo.gl)
- CID-based URLs

Uses field masks to minimize API cost.
"""

import httpx
import re
import logging
from typing import Optional, Dict, Any
from urllib.parse import urlparse, unquote

logger = logging.getLogger(__name__)


class GooglePlacesService:
    """Service for looking up place details from Google Maps URLs."""
    
    PLACES_API_BASE = "https://places.googleapis.com/v1/places"
    
    # Field mask for Place Details — request only what we need to minimize cost
    # Basic fields (no charge): displayName, location
    # Contact fields ($3/1000): nationalPhoneNumber, websiteUri
    # Atmosphere fields ($5/1000): regularOpeningHours
    FIELD_MASK = ",".join([
        "displayName",
        "formattedAddress",
        "location",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
        "websiteUri",
        "regularOpeningHours",
        "googleMapsUri",
    ])
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def lookup_from_url(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Extract cafe information from a Google Maps URL.
        
        1. Parse the URL to extract place name / coordinates / place ID
        2. Search for the place using the extracted info
        3. Return standardized place details
        
        Args:
            url: Google Maps URL
            
        Returns:
            Dict with cafe details or None if lookup fails
        """
        try:
            # Step 1: Resolve short links
            resolved_url = await self._resolve_short_link(url)
            
            # Step 2: Try to extract place ID from URL
            place_id = self._extract_place_id(resolved_url)
            
            if place_id:
                return await self._get_place_details(place_id)
            
            # Step 3: Try to extract name and coordinates for text search
            name, lat, lng = self._extract_name_and_coords(resolved_url)
            
            if name or (lat and lng):
                place_id = await self._search_place(name, lat, lng)
                if place_id:
                    return await self._get_place_details(place_id)
            
            logger.warning(f"Could not extract place info from URL: {url}")
            return None
            
        except Exception as e:
            logger.error(f"Google Places lookup error: {e}")
            return None
    
    async def _resolve_short_link(self, url: str) -> str:
        """Follow redirects for short URLs like maps.app.goo.gl or goo.gl/maps."""
        parsed = urlparse(url)
        
        if parsed.hostname in ("maps.app.goo.gl", "goo.gl"):
            try:
                async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
                    response = await client.head(url)
                    return str(response.url)
            except Exception as e:
                logger.warning(f"Failed to resolve short link: {e}")
                return url
        
        return url
    
    def _extract_place_id(self, url: str) -> Optional[str]:
        """Extract Google Place ID from URL if present."""
        # Pattern: /place/.../data=...!1s<place_id>
        # Place IDs start with "ChIJ"
        match = re.search(r'!1s(ChIJ[A-Za-z0-9_-]+)', url)
        if match:
            return match.group(1)
        
        # Pattern: place_id=<id>
        match = re.search(r'place_id=([A-Za-z0-9_-]+)', url)
        if match:
            return match.group(1)
        
        # Pattern: ftid=0x...:0x...
        match = re.search(r'ftid=(0x[a-f0-9]+:0x[a-f0-9]+)', url)
        if match:
            return match.group(1)
        
        return None
    
    def _extract_name_and_coords(self, url: str) -> tuple:
        """Extract place name and coordinates from Google Maps URL."""
        name = None
        lat = None
        lng = None
        
        # Extract name from /place/Name+Here/ pattern
        place_match = re.search(r'/place/([^/@]+)', url)
        if place_match:
            name = unquote(place_match.group(1)).replace('+', ' ')
        
        # Extract coordinates from /@lat,lng pattern
        coords_match = re.search(r'@(-?\d+\.?\d*),(-?\d+\.?\d*)', url)
        if coords_match:
            lat = float(coords_match.group(1))
            lng = float(coords_match.group(2))
        
        # Also try ?q=lat,lng pattern
        if not (lat and lng):
            q_match = re.search(r'[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)', url)
            if q_match:
                lat = float(q_match.group(1))
                lng = float(q_match.group(2))
        
        return name, lat, lng
    
    async def _search_place(
        self, name: Optional[str], lat: Optional[float], lng: Optional[float]
    ) -> Optional[str]:
        """Search for a place by name and/or coordinates, return place ID."""
        if not name and not (lat and lng):
            return None
        
        try:
            search_body: Dict[str, Any] = {}
            
            if name:
                search_body["textQuery"] = name
            elif lat and lng:
                search_body["textQuery"] = f"{lat},{lng}"
            
            if lat and lng:
                search_body["locationBias"] = {
                    "circle": {
                        "center": {"latitude": lat, "longitude": lng},
                        "radius": 200.0  # 200m radius
                    }
                }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.PLACES_API_BASE}:searchText",
                    headers={
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": self.api_key,
                        "X-Goog-FieldMask": "places.id",
                    },
                    json=search_body,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    places = data.get("places", [])
                    if places:
                        return places[0]["id"]
                else:
                    logger.warning(f"Places text search failed: {response.status_code} - {response.text}")
            
            return None
            
        except Exception as e:
            logger.error(f"Places text search error: {e}")
            return None
    
    async def _get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """Get place details from Google Places API and return standardized format."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.PLACES_API_BASE}/{place_id}",
                    headers={
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": self.api_key,
                        "X-Goog-FieldMask": self.FIELD_MASK,
                    },
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._format_response(data)
                else:
                    logger.warning(f"Place details failed: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Place details error: {e}")
            return None
    
    def _format_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Google Places API response to our standard format."""
        result: Dict[str, Any] = {}
        
        # Name
        display_name = data.get("displayName", {})
        if isinstance(display_name, dict):
            result["name"] = display_name.get("text", "")
        elif isinstance(display_name, str):
            result["name"] = display_name
        
        # Address
        result["address"] = data.get("formattedAddress", "")
        
        # Coordinates
        location = data.get("location", {})
        result["latitude"] = location.get("latitude")
        result["longitude"] = location.get("longitude")
        
        # Phone
        result["phone"] = (
            data.get("internationalPhoneNumber")
            or data.get("nationalPhoneNumber")
        )
        
        # Website
        result["website"] = data.get("websiteUri")
        
        # Google Maps URL
        result["google_maps_url"] = data.get("googleMapsUri")
        
        # Business hours
        opening_hours = data.get("regularOpeningHours", {})
        if opening_hours and opening_hours.get("periods"):
            result["business_hours"] = self._format_business_hours(opening_hours)
        
        return result
    
    def _format_business_hours(self, opening_hours: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Google Places opening hours to our BusinessHours format."""
        day_names = [
            "sunday", "monday", "tuesday", "wednesday",
            "thursday", "friday", "saturday"
        ]
        
        # Initialize all days as closed
        hours: Dict[str, Any] = {}
        for day in day_names:
            hours[day] = {"open": "", "close": "", "closed": True}
        
        periods = opening_hours.get("periods", [])
        for period in periods:
            open_info = period.get("open", {})
            close_info = period.get("close", {})
            
            day_index = open_info.get("day")
            if day_index is None or day_index >= len(day_names):
                continue
            
            day_name = day_names[day_index]
            
            open_hour = open_info.get("hour", 0)
            open_minute = open_info.get("minute", 0)
            
            close_hour = close_info.get("hour", 0)
            close_minute = close_info.get("minute", 0)
            
            hours[day_name] = {
                "open": f"{open_hour:02d}:{open_minute:02d}",
                "close": f"{close_hour:02d}:{close_minute:02d}",
                "closed": False,
            }
        
        return hours
