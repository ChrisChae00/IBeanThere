"""
Seed script for Waterloo/Kitchener cafe data.
Collects cafe data from Google Places API and stores in database.

Usage:
    python -m app.scripts.seed_waterloo_cafes

Requirements:
    - GOOGLE_MAPS_API_KEY environment variable set
    - Database connection configured
"""

import os
import sys
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.services.google_places_service import GooglePlacesService
from app.services.cafe_cache_service import CafeCacheService

# Waterloo/Kitchener target regions
WATERLOO_REGIONS = [
    {"name": "UW Campus", "lat": 43.4723, "lng": -80.5449, "radius": 2000},
    {"name": "Kitchener Downtown", "lat": 43.4516, "lng": -80.4925, "radius": 1500},
    {"name": "Waterloo Downtown", "lat": 43.4643, "lng": -80.5204, "radius": 1000},
]

async def seed_regions():
    """Seed cafe data for Waterloo/Kitchener regions."""
    google_service = GooglePlacesService()
    cache_service = CafeCacheService()
    
    total_synced = 0
    total_failed = 0
    
    for region in WATERLOO_REGIONS:
        print(f"\n{'='*50}")
        print(f"Seeding: {region['name']}")
        print(f"Location: {region['lat']}, {region['lng']}")
        print(f"Radius: {region['radius']}m")
        print(f"{'='*50}")
        
        try:
            # Search for cafes
            places = await google_service.search_nearby_cafes(
                region['lat'],
                region['lng'],
                region['radius']
            )
            
            print(f"Found {len(places)} cafes")
            
            # Process each cafe
            region_synced = 0
            region_failed = 0
            
            for i, place in enumerate(places, 1):
                try:
                    place_id = place.get("place_id")
                    name = place.get("name", "Unknown")
                    
                    print(f"  [{i}/{len(places)}] Processing: {name}")
                    
                    # Get full details
                    details = await google_service.get_place_details(place_id)
                    cafe_data = google_service.parse_cafe_data(details)
                    
                    # Save to database
                    if cache_service.save_cafes_to_cache([cafe_data]):
                        region_synced += 1
                        total_synced += 1
                        print(f"    ✓ Saved: {name}")
                    else:
                        region_failed += 1
                        total_failed += 1
                        print(f"    ✗ Failed to save: {name}")
                    
                    # Small delay to avoid rate limiting
                    await asyncio.sleep(0.2)
                    
                except Exception as e:
                    region_failed += 1
                    total_failed += 1
                    print(f"    ✗ Error processing cafe: {str(e)}")
            
            print(f"\n{region['name']} Summary:")
            print(f"  Synced: {region_synced}")
            print(f"  Failed: {region_failed}")
            
        except Exception as e:
            print(f"\n✗ Error seeding region {region['name']}: {str(e)}")
            total_failed += len(places) if 'places' in locals() else 1
    
    print(f"\n{'='*50}")
    print("Seed Complete")
    print(f"{'='*50}")
    print(f"Total Synced: {total_synced}")
    print(f"Total Failed: {total_failed}")
    print(f"Success Rate: {(total_synced / (total_synced + total_failed) * 100):.1f}%")

def main():
    """Main entry point."""
    if not os.getenv("GOOGLE_MAPS_API_KEY"):
        print("✗ Error: GOOGLE_MAPS_API_KEY environment variable not set")
        sys.exit(1)
    
    print("Starting cafe data seed...")
    print("Target: Waterloo/Kitchener Region")
    print(f"Regions: {len(WATERLOO_REGIONS)}")
    
    asyncio.run(seed_regions())

if __name__ == "__main__":
    main()

