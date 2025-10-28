from typing import List, Optional, Dict
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from supabase import Client
from app.models.cafe import Cafe
from app.config import settings

class CafeCacheService:
    """Service for managing cafe data caching."""
    
    def __init__(self):
        self.cache_ttl = settings.google_places_cache_ttl
    
    def get_cached_cafes(self, lat: float, lng: float, radius: int = 2000) -> Optional[List[Dict]]:
        """
        Check if cafes exist in database cache for the given location.
        
        Args:
            lat: Latitude
            lng: Longitude
            radius: Search radius in meters
            
        Returns:
            List of cached cafes or None if not found
        """
        from app.database.supabase import get_supabase_client
        supabase = get_supabase_client()
        
        # Search for cafes within the radius
        # Using a simple bounding box approximation for now
        lat_offset = radius / 111000  # approximate meters to degrees
        lng_offset = radius / (111000 * abs(lat))
        
        try:
            result = supabase.table("cafes").select("*").execute()
            
            if not result.data:
                return None
            
            cached_cafes = result.data
            now = datetime.now(timezone.utc)
            
            # Filter by cache validity and return first valid result
            valid_cafes = []
            for cafe in cached_cafes:
                last_synced = cafe.get("last_synced_at")
                if last_synced:
                    last_synced_dt = datetime.fromisoformat(last_synced.replace('Z', '+00:00'))
                    age_seconds = (now - last_synced_dt).total_seconds()
                    
                    # Check if cache is still valid
                    if age_seconds < self.cache_ttl:
                        valid_cafes.append(cafe)
            
            return valid_cafes if valid_cafes else None
            
        except Exception as e:
            print(f"Error getting cached cafes: {e}")
            return None
    
    def save_cafes_to_cache(self, cafes: List[Dict]) -> bool:
        """
        Save cafe data to database cache.
        
        Args:
            cafes: List of cafe data dictionaries
            
        Returns:
            True if successful, False otherwise
        """
        from app.database.supabase import get_supabase_client
        supabase = get_supabase_client()
        
        try:
            for cafe_data in cafes:
                # Check if cafe exists
                existing = supabase.table("cafes").select("id").eq("google_place_id", cafe_data.get("google_place_id")).execute()
                
                # Convert to dict if needed
                if isinstance(cafe_data, dict):
                    data_to_save = cafe_data
                else:
                    data_to_save = dict(cafe_data)
                
                if existing.data and len(existing.data) > 0:
                    # Update existing cafe
                    supabase.table("cafes").update(data_to_save).eq("google_place_id", cafe_data.get("google_place_id")).execute()
                else:
                    # Insert new cafe
                    supabase.table("cafes").insert(data_to_save).execute()
            
            return True
            
        except Exception as e:
            print(f"Error saving cafes to cache: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def is_cache_valid(self, last_synced_at: Optional[str]) -> bool:
        """
        Check if cache entry is still valid.
        
        Args:
            last_synced_at: ISO timestamp string
            
        Returns:
            True if cache is valid, False otherwise
        """
        if not last_synced_at:
            return False
        
        try:
            last_synced = datetime.fromisoformat(last_synced_at.replace('Z', '+00:00'))
            age_seconds = (datetime.now(timezone.utc) - last_synced).total_seconds()
            return age_seconds < self.cache_ttl
        except Exception:
            return False
    
    def invalidate_stale_cache(self) -> int:
        """
        Remove stale cache entries older than cache_ttl.
        
        Returns:
            Number of entries removed
        """
        from app.database.supabase import get_supabase_client
        supabase = get_supabase_client()
        
        try:
            cutoff_date = datetime.now(timezone.utc) - timedelta(seconds=self.cache_ttl)
            
            result = supabase.table("cafes").delete().lt(
                "last_synced_at", 
                cutoff_date.isoformat()
            ).execute()
            
            return len(result.data) if result.data else 0
            
        except Exception as e:
            print(f"Error invalidating stale cache: {e}")
            return 0
    
    def get_cache_statistics(self) -> Dict:
        """
        Get cache statistics for monitoring.
        
        Returns:
            Dictionary with cache statistics
        """
        from app.database.supabase import get_supabase_client
        supabase = get_supabase_client()
        
        try:
            # Get total cafes
            total_result = supabase.table("cafes").select("id", count="exact").execute()
            total_cafes = total_result.count or 0
            
            # Get stale cafes
            cutoff_date = datetime.now(timezone.utc) - timedelta(seconds=self.cache_ttl)
            stale_result = supabase.table("cafes").select("id").lt(
                "last_synced_at",
                cutoff_date.isoformat()
            ).execute()
            stale_cafes = len(stale_result.data) if stale_result.data else 0
            
            return {
                "total_cafes": total_cafes,
                "stale_cafes": stale_cafes,
                "fresh_cafes": total_cafes - stale_cafes,
                "cache_hit_rate": (total_cafes - stale_cafes) / total_cafes if total_cafes > 0 else 0
            }
            
        except Exception as e:
            print(f"Error getting cache statistics: {e}")
            return {}

