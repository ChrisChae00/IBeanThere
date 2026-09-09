"""
One-time seed script: import real cafes from OpenStreetMap (Overpass API,
free, no key) into the `cafes` table for the Waterloo/Kitchener + Toronto
(GTA) area. Only real OSM cafes are inserted — no synthetic/dummy rows.

Seeded cafes are left unverified (status='pending', verification_count=0,
navigator_id=NULL) so the existing bean-drop flow verifies them normally;
the first real user to drop a bean at one becomes its navigator.
`source_type='app_seed'` marks these rows as app-provided so the frontend
can show a short "Added by IBeanThere" label instead of a founding crew.

SUPERSEDED for KW by `seed_kw_reviewed.py`: this script writes OSM straight into the
table with no photo and no traits, which is what the Phase 6 purge deleted 302 rows of.
It also skips every franchise by outlet count, and the current policy judges branches
one at a time. Kept for the Ontario expansion, where a first pass still beats nothing.

Usage:
    cd apps/be
    python scripts/seed_real_cafes.py               # Waterloo/Kitchener + Toronto (GTA)
    python scripts/seed_real_cafes.py --regions ontario  # also cover the rest of Ontario
"""
import argparse
import os
import sys
import time
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

import httpx
from supabase import create_client

from app.services import overpass_service
from app.services.cafe_dedupe import find_nearby
from app.services.franchise_service import FRANCHISE, classify_sync
from app.services.venue_category import EXCLUDED, classify_venue
from osm_fields import build_address, parse_osm_opening_hours, wikimedia_image_url

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# (name, south, west, north, east)
REGIONS_DEFAULT = [
    ("Kitchener-Waterloo", 43.35, -80.65, 43.55, -80.35),
    ("Toronto-Downtown", 43.62, -79.45, 43.70, -79.35),
    ("Toronto-Central", 43.65, -79.42, 43.78, -79.25),
    ("Toronto-West/Mississauga", 43.50, -79.75, 43.75, -79.42),
    ("Toronto-East/Markham", 43.65, -79.25, 43.95, -79.05),
    ("Toronto-North/RichmondHill", 43.75, -79.60, 43.95, -79.25),
]
REGION_ONTARIO = ("Ontario", 41.6, -95.2, 56.9, -74.3)

MAX_PHOTOS = 2  # best-effort only, no paid API — skip if OSM has no image tag


def fetch_region(name: str, south: float, west: float, north: float, east: float) -> list[dict]:
    query = f"""
    [out:json][timeout:60];
    (
      node["amenity"="cafe"]({south},{west},{north},{east});
      node["shop"="coffee"]({south},{west},{north},{east});
    );
    out body;
    """
    print(f"Querying Overpass for {name}...")
    # Throttling, backoff and the on-disk cache all live in overpass_service, so a
    # re-run of this seed costs the public service nothing.
    elements = overpass_service.query(query)
    print(f"  {name}: {len(elements)} nodes")
    return elements


def to_cafe_row(node: dict, photos_used: int) -> tuple[dict, int]:
    tags = node.get("tags", {})
    name = tags.get("name")
    if classify_venue(tags) == EXCLUDED:
        return None, photos_used
    if name and is_franchise_node(tags):
        return None, photos_used
    address = build_address(tags)
    business_hours = parse_osm_opening_hours(tags.get("opening_hours"))
    if not name or not address or not business_hours or "lat" not in node or "lon" not in node:
        return None, photos_used

    main_image = None
    if photos_used < MAX_PHOTOS:
        main_image = wikimedia_image_url(tags)
        if main_image:
            photos_used += 1

    query_str = f"{name}, {address}" if address else f"{name}, {node['lat']},{node['lon']}"
    gmaps_url = f"https://www.google.com/maps/search/?api=1&query={quote(query_str)}"

    row = {
        "name": name,
        "osm_id": node["id"],
        "address": address,
        "latitude": node["lat"],
        "longitude": node["lon"],
        "status": "pending",
        "verification_count": 0,
        "navigator_id": None,
        "source_type": "app_seed",
        "source_url": gmaps_url,
        "website": tags.get("website") or tags.get("contact:website"),
        "main_image": main_image,
        "business_hours": business_hours,
    }
    return row, photos_used


def is_franchise_node(tags: dict) -> bool:
    """Skip chain locations — IBeanThere only lists local, independent cafes."""
    verdict = classify_sync(tags.get("name", ""), tags, supabase)
    if verdict.status == FRANCHISE:
        print(f"  Skipping franchise: {verdict.display_name} ({verdict.outlet_count} outlets)")
        return True
    return False


def seed(regions: list[tuple]) -> None:
    # Every cafe, not just the app-seeded ones: a shop a user registered by hand is
    # the same shop as the OSM node standing on it, and filtering by source_type is
    # exactly how this script used to insert it a second time.
    existing = supabase.table("cafes").select(
        "id, name, latitude, longitude, osm_id, source_url"
    ).limit(10000).execute().data or []
    seen_osm_ids = {row["osm_id"] for row in existing if row.get("osm_id")}
    # source_url here is assembled from the name and address, not an identity, so two
    # OSM nodes further apart than 25 m can still produce the same string. That is a
    # UNIQUE violation now, and a batch insert fails whole — 500 good rows lost to one
    # collision.
    existing_urls = {row["source_url"] for row in existing if row.get("source_url")}

    photos_used = 0
    rows = []
    seen_node_ids = set()
    skipped = 0
    for name, south, west, north, east in regions:
        for node in fetch_region(name, south, west, north, east):
            if node["id"] in seen_node_ids:
                continue
            seen_node_ids.add(node["id"])
            if node["id"] in seen_osm_ids:
                skipped += 1
                continue
            row, photos_used = to_cafe_row(node, photos_used)
            if not row:
                continue
            # Same 25 m rule the registration endpoint uses, against the rows already
            # in the database and the ones queued in this run.
            if find_nearby(row["latitude"], row["longitude"], existing, 25):
                skipped += 1
                continue
            if row["source_url"] in existing_urls:
                skipped += 1
                continue
            rows.append(row)
            existing_urls.add(row["source_url"])
            existing.append(row)
            seen_osm_ids.add(node["id"])
        time.sleep(1)  # be polite to the free public Overpass instance

    from app.services.blacklists import filter_seed_candidates
    rows = filter_seed_candidates(supabase, rows)
    print(f"Skipped {skipped} nodes already covered by an existing cafe.")
    print(f"Inserting {len(rows)} new real cafes...")
    for i in range(0, len(rows), 500):
        batch = rows[i:i + 500]
        supabase.table("cafes").insert(batch).execute()
        print(f"  inserted {i + len(batch)}/{len(rows)}")

    print(f"Done. {len(rows)} cafes inserted, {photos_used} with a real photo.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--regions", choices=["default", "ontario"], default="default")
    args = parser.parse_args()

    regions = REGIONS_DEFAULT + ([REGION_ONTARIO] if args.regions == "ontario" else [])
    seed(regions)
