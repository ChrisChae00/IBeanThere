"""
Daily 160-Capped Google Places Cafe Seeding Script with DB Deduplication.

- Pre-loads existing cafes from Supabase to prevent duplicate API calls.
- Fetches candidate real cafes from OpenStreetMap Overpass API (Free).
- Filters out candidates already in DB (name + proximity match).
- Calls Google Places API only for new candidates (strictly capped at max 160 calls).
- Populates rich data: address, phone, website, business_hours, google_maps_url, main_image.
"""

import argparse
import asyncio
import math
import os
import re
import sys
import time
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

import httpx
from supabase import create_client

from app.services.franchise_service import FRANCHISE, classify
from app.services.venue_category import EXCLUDED, classify_venue
from app.services.google_places_service import GooglePlacesService

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
GOOGLE_PLACES_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
places_service = GooglePlacesService(api_key=GOOGLE_PLACES_API_KEY)

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

REGIONS_DEFAULT = [
    ("Kitchener-Waterloo", 43.35, -80.65, 43.55, -80.35),
    ("Toronto-Downtown", 43.62, -79.45, 43.70, -79.35),
    ("Toronto-Central", 43.65, -79.42, 43.78, -79.25),
    ("Toronto-West/Mississauga", 43.50, -79.75, 43.75, -79.42),
    ("Toronto-East/Markham", 43.65, -79.25, 43.95, -79.05),
    ("Toronto-North/RichmondHill", 43.75, -79.60, 43.95, -79.25),
]


def normalize_name(name: str) -> str:
    """Clean cafe name for string comparison."""
    if not name:
        return ""
    cleaned = re.sub(r"[^\w\s]", "", name.lower())
    return " ".join(cleaned.split())


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two lat/lon coordinates."""
    r = 6371000 # earth radius meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def load_existing_db_cafes() -> list[dict]:
    """Fetch all existing cafes from Supabase cafes table."""
    print("1. Pre-loading existing cafes from Supabase DB...", flush=True)
    res = supabase.table("cafes").select("id, name, address, latitude, longitude, source_url").execute()
    existing = res.data or []
    print(f"   Loaded {len(existing)} existing cafes from DB.", flush=True)
    return existing


def is_duplicate_cafe(cand_name: str, cand_lat: float, cand_lon: float, existing_cafes: list[dict]) -> bool:
    """Check if candidate cafe is already in DB by name and spatial proximity."""
    norm_cand_name = normalize_name(cand_name)
    
    for c in existing_cafes:
        c_lat = float(c["latitude"])
        c_lon = float(c["longitude"])
        dist_m = haversine_distance_meters(cand_lat, cand_lon, c_lat, c_lon)
        
        # If within 50 meters and names are similar or identical -> duplicate
        if dist_m <= 50.0:
            norm_db_name = normalize_name(c.get("name") or "")
            if norm_cand_name in norm_db_name or norm_db_name in norm_cand_name or dist_m <= 15.0:
                return True
                
    return False


def fetch_osm_candidates(regions: list[tuple]) -> list[dict]:
    """Fetch candidate nodes from OpenStreetMap (Free, 0 API cost)."""
    print("2. Querying OpenStreetMap Overpass API for candidate cafes (0 API cost)...")
    headers = {"User-Agent": "IBeanThere/1.0 (https://github.com/ChrisChae00/IBeanThere)"}
    candidates = []
    seen_ids = set()
    
    for name, south, west, north, east in regions:
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"="cafe"]({south},{west},{north},{east});
          node["shop"="coffee"]({south},{west},{north},{east});
        );
        out body;
        """
        for endpoint in OVERPASS_ENDPOINTS:
            try:
                resp = httpx.post(endpoint, data={"data": query}, headers=headers, timeout=60)
                if resp.status_code == 200:
                    elements = resp.json().get("elements", [])
                    print(f"   {name}: fetched {len(elements)} candidates")
                    for node in elements:
                        if node["id"] not in seen_ids:
                            seen_ids.add(node["id"])
                            candidates.append(node)
                    break
            except Exception:
                pass
            time.sleep(1)
            
    print(f"   Total unique OSM candidate cafes fetched: {len(candidates)}")
    return candidates


async def seed_with_google_places(max_api_calls: int = 160, dry_run: bool = False):
    existing_cafes = load_existing_db_cafes()
    candidates = fetch_osm_candidates(REGIONS_DEFAULT)
    
    print(f"\n3. Filtering candidates against DB and performing Google Places enrichment (Max API Cap: {max_api_calls})...")
    
    skipped_count = 0
    api_calls_made = 0
    rows_to_insert = []
    
    for node in candidates:
        if api_calls_made >= max_api_calls:
            print(f"   ⚠️ Daily max API call limit reached ({max_api_calls}). Stopping further API calls.")
            break
            
        tags = node.get("tags", {})
        cand_name = tags.get("name")
        if not cand_name or "lat" not in node or "lon" not in node:
            continue
            
        cand_lat = float(node["lat"])
        cand_lon = float(node["lon"])
        
        # DEDUPLICATION CHECK (0 API CALLS)
        if is_duplicate_cafe(cand_name, cand_lat, cand_lon, existing_cafes):
            skipped_count += 1
            continue
            
        # COFFEE CHECK (0 API calls) - bubble tea, tea houses and juice bars are out
        if classify_venue(tags) == EXCLUDED:
            print(f"   Skipping non-coffee venue: {cand_name}")
            skipped_count += 1
            continue

        # FRANCHISE CHECK (0 Google calls) - only local, independent cafes are listed
        verdict = await classify(cand_name, tags, supabase, timeout=60.0)
        if verdict.status == FRANCHISE:
            print(f"   Skipping franchise: {verdict.display_name} ({verdict.outlet_count} outlets)")
            skipped_count += 1
            continue

        # NEW CAFE -> Call Google Places API for rich details
        print(f"   [{api_calls_made + 1}/{max_api_calls}] Fetching Google Places details for: {cand_name}")
        
        # Build search query for Google Places
        street = tags.get("addr:street")
        city = tags.get("addr:city")
        location_hint = f"{street}, {city}" if street and city else f"{cand_lat},{cand_lon}"
        gmaps_search_url = f"https://www.google.com/maps/search/?api=1&query={quote(f'{cand_name}, {location_hint}')}"
        
        place_details = None
        if not dry_run:
            try:
                # Search using name and coords via Google Places Service
                place_id = await places_service._search_place(cand_name, cand_lat, cand_lon)
                api_calls_made += 1
                
                if place_id:
                    place_details = await places_service._get_place_details(place_id)
                    api_calls_made += 1 # Details call
            except Exception as e:
                print(f"     Warning: Google Places lookup failed for {cand_name}: {e}")
                
        # Build final row
        name = place_details.get("name") if place_details and place_details.get("name") else cand_name
        address = place_details.get("address") if place_details and place_details.get("address") else tags.get("addr:street")
        latitude = place_details.get("latitude") if place_details and place_details.get("latitude") else cand_lat
        longitude = place_details.get("longitude") if place_details and place_details.get("longitude") else cand_lon
        phone = place_details.get("phone") if place_details else tags.get("phone")
        website = place_details.get("website") if place_details else (tags.get("website") or tags.get("contact:website"))
        google_maps_url = place_details.get("google_maps_url") if place_details and place_details.get("google_maps_url") else gmaps_search_url
        business_hours = place_details.get("business_hours") if place_details else None
        
        # Skip if address or name missing
        if not name or not address:
            continue
            
        row = {
            "name": name,
            "address": address,
            "latitude": latitude,
            "longitude": longitude,
            "status": "pending",
            "verification_count": 0,
            "navigator_id": None,
            "source_type": "app_seed",
            "source_url": google_maps_url,
            "phone": phone,
            "website": website,
            "business_hours": business_hours,
        }
        
        rows_to_insert.append(row)
        # Add to existing_cafes list in memory to prevent duplicates within same batch
        existing_cafes.append({"name": name, "latitude": latitude, "longitude": longitude})

    print(f"\n4. Summary:")
    print(f"   - OSM Candidates Checked: {len(candidates)}")
    print(f"   - Already in DB (Skipped, 0 API Calls): {skipped_count}")
    print(f"   - Google Places API Calls Made: {api_calls_made} / {max_api_calls}")
    print(f"   - New Cafes Prepared for Insert: {len(rows_to_insert)}")
    
    if rows_to_insert and not dry_run:
        print("\n5. Inserting new cafes into Supabase DB...")
        for i in range(0, len(rows_to_insert), 100):
            batch = rows_to_insert[i:i + 100]
            supabase.table("cafes").insert(batch).execute()
            print(f"   Inserted {i + len(batch)}/{len(rows_to_insert)}")
        print("   ✅ DB Insertion Completed Successfully!")
    elif dry_run:
        print("   [Dry Run Mode] No DB changes or Google API calls were executed.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-api-calls", type=int, default=160, help="Maximum Google Places API calls to make")
    parser.add_argument("--dry-run", action="store_true", help="Perform deduplication check without making API calls or DB edits")
    args = parser.parse_args()
    
    asyncio.run(seed_with_google_places(max_api_calls=args.max_api_calls, dry_run=args.dry_run))
