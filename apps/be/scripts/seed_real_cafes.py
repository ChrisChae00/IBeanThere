"""
One-time seed script: import real cafes from OpenStreetMap (Overpass API,
free, no key) into the `cafes` table for the Waterloo/Kitchener + Toronto
(GTA) area. Only real OSM cafes are inserted — no synthetic/dummy rows.

Seeded cafes are left unverified (status='pending', verification_count=0,
navigator_id=NULL) so the existing bean-drop flow verifies them normally;
the first real user to drop a bean at one becomes its navigator.
`source_type='app_seed'` marks these rows as app-provided so the frontend
can show a short "Added by IBeanThere" label instead of a founding crew.

Usage:
    cd apps/be
    python scripts/seed_real_cafes.py               # Waterloo/Kitchener + Toronto (GTA)
    python scripts/seed_real_cafes.py --regions ontario  # also cover the rest of Ontario
"""
import argparse
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

from app.services.franchise_service import FRANCHISE, classify_sync
from app.services.venue_category import EXCLUDED, classify_venue

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

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
    headers = {"User-Agent": "IBeanThere/1.0 (https://github.com/ChrisChae00/IBeanThere)"}
    
    last_error = None
    for endpoint in OVERPASS_ENDPOINTS:
        for attempt in range(2):
            try:
                resp = httpx.post(endpoint, data={"data": query}, headers=headers, timeout=60)
                if resp.status_code == 200:
                    elements = resp.json().get("elements", [])
                    print(f"  {name}: {len(elements)} nodes (via {endpoint})")
                    return elements
                print(f"  Warning: {endpoint} status {resp.status_code} (attempt {attempt + 1})")
            except Exception as e:
                print(f"  Warning: {endpoint} failed ({e}) (attempt {attempt + 1})")
                last_error = e
            time.sleep(2)

    raise RuntimeError(f"All Overpass endpoints failed for region {name}. Last error: {last_error}")


def wikimedia_image_url(tags: dict) -> str | None:
    image = tags.get("image")
    if image and image.startswith("http"):
        return image
    commons = tags.get("wikimedia_commons")
    if commons:
        filename = commons.split(":", 1)[-1]
        return f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(filename)}"
    return None


def build_address(tags: dict) -> str | None:
    parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:city"),
        tags.get("addr:province"),
        tags.get("addr:postcode"),
    ]
    parts = [p for p in parts if p]
    return ", ".join(parts) if parts else None


DAY_MAP = {
    'mo': 'monday', 'tu': 'tuesday', 'we': 'wednesday', 'th': 'thursday',
    'fr': 'friday', 'sa': 'saturday', 'su': 'sunday'
}
DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
DAY_ABBRS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']


def parse_osm_opening_hours(raw_hours: str) -> dict | None:
    if not raw_hours or not isinstance(raw_hours, str):
        return None
    s = raw_hours.strip()
    if s == '24/7':
        return {d: {'open': '00:00', 'close': '24:00', 'closed': False} for d in DAYS_ORDER}
    result = {d: {'open': '', 'close': '', 'closed': True} for d in DAYS_ORDER}
    parts = [p.strip() for p in s.replace(';', ',').split(',') if p.strip()]
    parsed_any = False
    for part in parts:
        m = re.match(r'^([A-Za-z\s,-]+)\s+(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}|off|closed)$', part, re.IGNORECASE)
        if not m:
            continue
        days_part, time_part = m.group(1).lower().strip(), m.group(2).lower().strip()
        target_days = []
        for day_token in days_part.split():
            day_token = day_token.strip(',')
            if '-' in day_token:
                parts_d = day_token.split('-', 1)
                start_d, end_d = parts_d[0], parts_d[1]
                if start_d in DAY_ABBRS and end_d in DAY_ABBRS:
                    start_idx, end_idx = DAY_ABBRS.index(start_d), DAY_ABBRS.index(end_d)
                    if start_idx <= end_idx:
                        target_days.extend([DAYS_ORDER[i] for i in range(start_idx, end_idx + 1)])
                    else:
                        target_days.extend([DAYS_ORDER[i] for i in range(start_idx, 7)])
                        target_days.extend([DAYS_ORDER[i] for i in range(0, end_idx + 1)])
            elif day_token in DAY_MAP:
                target_days.append(DAY_MAP[day_token])
        if not target_days:
            continue
        if time_part in ('off', 'closed'):
            for d in target_days:
                result[d] = {'open': '', 'close': '', 'closed': True}
                parsed_any = True
        else:
            times = time_part.split('-')
            if len(times) == 2:
                open_t, close_t = times[0].strip().zfill(5), times[1].strip().zfill(5)
                for d in target_days:
                    result[d] = {'open': open_t, 'close': close_t, 'closed': False}
                    parsed_any = True
    return result if parsed_any else None


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
    existing = supabase.table("cafes").select("source_url").eq("source_type", "app_seed").execute()
    seen_urls = {r["source_url"] for r in (existing.data or []) if r.get("source_url")}

    photos_used = 0
    rows = []
    seen_node_ids = set()
    for name, south, west, north, east in regions:
        for node in fetch_region(name, south, west, north, east):
            if node["id"] in seen_node_ids:
                continue
            seen_node_ids.add(node["id"])
            row, photos_used = to_cafe_row(node, photos_used)
            if row and row["source_url"] not in seen_urls:
                rows.append(row)
        time.sleep(1)  # be polite to the free public Overpass instance

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
