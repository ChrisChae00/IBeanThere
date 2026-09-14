"""
Daily 160-Capped Google Places Cafe Seeding Script with DB Deduplication.

- Pre-loads existing cafes from Supabase to prevent duplicate API calls.
- Fetches candidate real cafes from OpenStreetMap Overpass API (Free).
- Filters out candidates already in DB (shared osm_id / place_id / 25 m proximity).
- Calls Google Places API only for new candidates (strictly capped at max 160 calls).
- Populates rich data: address, phone, website, business_hours, google_maps_url, main_image.
"""

import argparse
import asyncio
import os
import sys
import time
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

import httpx
from supabase import create_client

from app.services.cafe_dedupe import find_nearby
from app.services.franchise_service import FRANCHISE, classify
from app.services.venue_category import EXCLUDED, classify_venue
from app.services.google_places_service import GooglePlacesService

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
GOOGLE_PLACES_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
places_service = GooglePlacesService(api_key=GOOGLE_PLACES_API_KEY)

from app.services import overpass_service

# A run of empty lookups means a bad key or an exhausted quota, not a run of
# unknown cafes. Stop instead of inserting hundreds of rows with no Google data.
MAX_CONSECUTIVE_FAILURES = 10

REGIONS_DEFAULT = [
    ("Kitchener-Waterloo", 43.35, -80.65, 43.55, -80.35),
    ("Toronto-Downtown", 43.62, -79.45, 43.70, -79.35),
    ("Toronto-Central", 43.65, -79.42, 43.78, -79.25),
    ("Toronto-West/Mississauga", 43.50, -79.75, 43.75, -79.42),
    ("Toronto-East/Markham", 43.65, -79.25, 43.95, -79.05),
    ("Toronto-North/RichmondHill", 43.75, -79.60, 43.95, -79.25),
]


def load_existing_db_cafes() -> list[dict]:
    """Fetch all existing cafes from Supabase cafes table."""
    print("1. Pre-loading existing cafes from Supabase DB...", flush=True)
    res = supabase.table("cafes").select(
        "id, name, address, latitude, longitude, source_url, osm_id, google_place_id"
    ).limit(10000).execute()
    existing = res.data or []
    print(f"   Loaded {len(existing)} existing cafes from DB.", flush=True)
    return existing


def fetch_osm_candidates(regions: list[tuple]) -> list[dict]:
    """Fetch candidate nodes from OpenStreetMap (Free, 0 API cost)."""
    print("2. Querying OpenStreetMap Overpass API for candidate cafes (0 API cost)...")
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
        # overpass_service raises when every endpoint refuses, which is what keeps a
        # refusal from being read as "this region has no cafes".
        elements = overpass_service.query(query)
        print(f"   {name}: fetched {len(elements)} candidates")
        for node in elements:
            if node["id"] not in seen_ids:
                seen_ids.add(node["id"])
                candidates.append(node)

    print(f"   Total unique OSM candidate cafes fetched: {len(candidates)}")
    return candidates


async def seed_with_google_places(max_api_calls: int = 160, dry_run: bool = False):
    if not dry_run and not GOOGLE_PLACES_API_KEY:
        raise SystemExit("GOOGLE_PLACES_API_KEY is not set. Without it every lookup "
                         "returns nothing and the rows would be inserted with no "
                         "Google identity, address or hours.")

    existing_cafes = load_existing_db_cafes()
    candidates = fetch_osm_candidates(REGIONS_DEFAULT)
    
    print(f"\n3. Filtering candidates against DB and performing Google Places enrichment (Max API Cap: {max_api_calls})...")
    
    existing_osm_ids = {row["osm_id"] for row in existing_cafes if row.get("osm_id")}
    existing_place_ids = {row["google_place_id"] for row in existing_cafes
                          if row.get("google_place_id")}
    # source_url is UNIQUE now, and the fallback URL below is assembled from the name
    # and address — two nodes can produce the same string, which would fail the whole
    # batch insert rather than the one row.
    existing_urls = {row["source_url"] for row in existing_cafes if row.get("source_url")}

    skipped_count = 0
    api_calls_made = 0
    consecutive_failures = 0
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
        
        # DEDUPLICATION, PART 1 (0 API CALLS): this exact OSM node, or something
        # already standing within 25 m of it. Both checks run before any paid call.
        if node["id"] in existing_osm_ids:
            skipped_count += 1
            continue
        if find_nearby(cand_lat, cand_lon, existing_cafes, 25):
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
        place_id = None
        if not dry_run:
            try:
                # Search using name and coords via Google Places Service
                # Count the attempt, not the success: a call that raises still costs
                # a request, and counting returns only would let a failing key run
                # through the entire candidate list past the cap.
                api_calls_made += 1
                place_id = await places_service._search_place(cand_name, cand_lat, cand_lon)

                if place_id:
                    api_calls_made += 1  # Details call
                    place_details = await places_service._get_place_details(place_id)
                if place_details:
                    consecutive_failures = 0
                else:
                    consecutive_failures += 1
            except Exception as e:
                consecutive_failures += 1
                print(f"     Warning: Google Places lookup failed for {cand_name}: {e}")

            if consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
                raise RuntimeError(
                    f"{consecutive_failures} Google Places lookups in a row returned "
                    f"nothing. Check GOOGLE_PLACES_API_KEY and the quota before "
                    f"re-running; continuing would insert rows with no Google data."
                )
                
        # Build final row
        name = place_details.get("name") if place_details and place_details.get("name") else cand_name
        address = place_details.get("address") if place_details and place_details.get("address") else tags.get("addr:street")
        latitude = place_details.get("latitude") if place_details and place_details.get("latitude") else cand_lat
        longitude = place_details.get("longitude") if place_details and place_details.get("longitude") else cand_lon
        phone = place_details.get("phone") if place_details else tags.get("phone")
        website = place_details.get("website") if place_details else (tags.get("website") or tags.get("contact:website"))
        google_maps_url = place_details.get("google_maps_url") if place_details and place_details.get("google_maps_url") else gmaps_search_url
        business_hours = place_details.get("business_hours") if place_details else None
        # Keep the id the search already paid for: the details call fails on its own
        # (quota, timeout) and returns None, and dropping the id then stores the row
        # with no Google identity at all.
        place_id = (place_details or {}).get("place_id") or place_id

        # Skip if address or name missing
        if not name or not address:
            continue

        # DEDUPLICATION, PART 2: Google snaps the pin to its own idea of where the
        # shop is, several metres from the OSM node. Re-check at the snapped
        # coordinates — checking only the OSM ones is how a row already seeded from
        # Google got inserted a second time.
        if place_id and place_id in existing_place_ids:
            skipped_count += 1
            continue
        if (latitude, longitude) != (cand_lat, cand_lon) and find_nearby(
            float(latitude), float(longitude), existing_cafes, 25
        ):
            skipped_count += 1
            continue
        if google_maps_url in existing_urls:
            skipped_count += 1
            continue

            
        row = {
            "name": name,
            "osm_id": node["id"],
            "google_place_id": place_id,
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
        # Track the row in memory — at its snapped coordinates and with both ids — so
        # the rest of this same batch cannot queue it again.
        existing_cafes.append(row)
        existing_osm_ids.add(node["id"])
        existing_urls.add(google_maps_url)
        if place_id:
            existing_place_ids.add(place_id)

    print(f"\n4. Summary:")
    print(f"   - OSM Candidates Checked: {len(candidates)}")
    print(f"   - Already in DB (Skipped, 0 API Calls): {skipped_count}")
    print(f"   - Google Places API Calls Made: {api_calls_made} / {max_api_calls}")
    print(f"   - New Cafes Prepared for Insert: {len(rows_to_insert)}")
    
    from app.services.blacklists import filter_seed_candidates
    rows_to_insert = filter_seed_candidates(supabase, rows_to_insert)
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
