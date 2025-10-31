"""
OpenStreetMap Nominatim API service for geocoding.

Rate limit: 1 request per second
User-Agent: Required by OSM policy
"""

import httpx
import asyncio
from typing import Optional, Dict, List

class OSMService:
    """OpenStreetMap Nominatim API service."""
    
    BASE_URL = "https://nominatim.openstreetmap.org"
    HEADERS = {
        'User-Agent': 'IBeanThere/1.0'
    }
    RATE_LIMIT = 1.0  # 1 request per second
    
    async def reverse_geocode(self, lat: float, lng: float) -> Optional[Dict]:
        """
        Convert coordinates to address (reverse geocoding).
        
        Args:
            lat: Latitude
            lng: Longitude
            
        Returns:
            Dict with address information or None
        """
        try:
            # Rate limit: Wait 1 second between requests
            await asyncio.sleep(self.RATE_LIMIT)
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.BASE_URL}/reverse",
                    params={
                        'lat': lat,
                        'lon': lng,
                        'format': 'json',
                        'addressdetails': 1
                    },
                    headers=self.HEADERS
                )
                
                if response.status_code == 200:
                    data = response.json()
                    address = data.get('address', {})
                    
                    return {
                        'display_name': data.get('display_name'),
                        'name': address.get('name'),
                        'road': address.get('road'),
                        'city': address.get('city'),
                        'province': address.get('state') or address.get('region'),
                        'country': address.get('country'),
                        'postcode': address.get('postcode')
                    }
                elif response.status_code == 429:
                    # Rate limit exceeded
                    print(f"OSM API rate limit exceeded. Waiting longer...")
                    await asyncio.sleep(2.0)
                    return None
                else:
                    print(f"OSM reverse geocode error: {response.status_code}")
                    return None
                
        except Exception as e:
            print(f"OSM reverse geocode error: {e}")
            return None
    
    async def search(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Search for places by name (forward geocoding).
        
        Args:
            query: Search query
            limit: Maximum number of results
            
        Returns:
            List of matching places
        """
        try:
            await asyncio.sleep(self.RATE_LIMIT)
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.BASE_URL}/search",
                    params={
                        'q': query,
                        'format': 'json',
                        'limit': limit
                    },
                    headers=self.HEADERS
                )
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 429:
                    await asyncio.sleep(2.0)
                    return []
                else:
                    print(f"OSM search error: {response.status_code}")
                    return []
                
        except Exception as e:
            print(f"OSM search error: {e}")
            return []
