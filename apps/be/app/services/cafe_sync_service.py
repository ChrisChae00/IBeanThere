from typing import List, Dict
from datetime import datetime
# Imports will be resolved at runtime

class CafeSyncService:
    """Service for syncing cafe data with Google Places API."""
    
    def __init__(self):
        from app.services.google_places_service import GooglePlacesService
        from app.services.cafe_cache_service import CafeCacheService
        from app.database.supabase import get_supabase_client
        
        self.google_service = GooglePlacesService()
        self.cache_service = CafeCacheService()
        self.supabase = get_supabase_client()
    
    async def sync_cafe_data(self, cafe_id: str) -> bool:
        """
        Sync a single cafe's data from Google Places API.
        
        Args:
            cafe_id: Cafe ID to sync
            
        Returns:
            True if successful, False otherwise
        """
        try:
            from app.database.supabase import get_supabase_client
            supabase = get_supabase_client()
            
            # Get cafe from database
            result = supabase.table("cafes").select("*").eq("id", cafe_id).single().execute()
            
            if not result.data:
                return False
            
            cafe = result.data
            google_place_id = cafe.get("google_place_id")
            
            if not google_place_id:
                return False
            
            # Fetch latest data from Google
            place_data = await self.google_service.get_place_details(google_place_id)
            cafe_data = self.google_service.parse_cafe_data(place_data)
            
            # Update last_synced_at
            cafe_data["last_synced_at"] = datetime.utcnow().isoformat()
            
            # Update in database
            self.supabase.table("cafes").update(cafe_data).eq("id", cafe_id).execute()
            
            return True
            
        except Exception as e:
            print(f"Error syncing cafe data: {e}")
            return False
    
    async def batch_sync_popular_cafes(self, limit: int = 100) -> Dict:
        """
        Sync popular cafes that haven't been updated recently.
        
        Args:
            limit: Maximum number of cafes to sync
            
        Returns:
            Dictionary with sync statistics
        """
        try:
            # Get cafes that need syncing (oldest last_synced_at first)
            result = self.supabase.table("cafes")\
                .select("id,google_place_id,last_synced_at")\
                .order("last_synced_at", desc=False)\
                .limit(limit)\
                .execute()
            
            if not result.data:
                return {"synced": 0, "failed": 0}
            
            synced = 0
            failed = 0
            
            for cafe in result.data:
                cafe_id = cafe.get("id")
                if await self.sync_cafe_data(cafe_id):
                    synced += 1
                else:
                    failed += 1
            
            return {
                "synced": synced,
                "failed": failed,
                "total": synced + failed
            }
            
        except Exception as e:
            print(f"Error in batch sync: {e}")
            return {"synced": 0, "failed": 0, "error": str(e)}
    
    async def sync_region_cafes(self, lat: float, lng: float, radius: int = 2000) -> Dict:
        """
        Sync all cafes in a region from Google Places API.
        
        Args:
            lat: Latitude
            lng: Longitude
            radius: Search radius in meters
            
        Returns:
            Dictionary with sync statistics
        """
        try:
            # Search for cafes
            places = await self.google_service.search_nearby_cafes(lat, lng, radius)
            
            synced = 0
            failed = 0
            
            for place in places:
                try:
                    # Get full details
                    details = await self.google_service.get_place_details(place.get("place_id"))
                    cafe_data = self.google_service.parse_cafe_data(details)
                    
                    # Add sync timestamp
                    cafe_data["last_synced_at"] = datetime.utcnow().isoformat()
                    
                    # Save to database
                    self.cache_service.save_cafes_to_cache([cafe_data])
                    
                    synced += 1
                    
                except Exception as e:
                    print(f"Error syncing individual cafe: {e}")
                    failed += 1
            
            return {
                "synced": synced,
                "failed": failed,
                "total": synced + failed
            }
            
        except Exception as e:
            print(f"Error syncing region: {e}")
            return {"synced": 0, "failed": 0, "error": str(e)}

