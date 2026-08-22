"""
One-time script: Fetch opening_hours tags from OpenStreetMap for seeded cafes
and parse them into Supabase `cafes.business_hours` column ($0 API cost).
"""
import os
import sys
import re
import time
import httpx
from urllib.parse import quote
from dotenv import load_dotenv
from supabase import create_client

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

REGIONS = [
    ("Kitchener-Waterloo", 43.35, -80.65, 43.55, -80.35),
    ("Toronto-Downtown", 43.62, -79.45, 43.70, -79.35),
    ("Toronto-Central", 43.65, -79.42, 43.78, -79.25),
    ("Toronto-West/Mississauga", 43.50, -79.75, 43.75, -79.42),
    ("Toronto-East/Markham", 43.65, -79.25, 43.95, -79.05),
    ("Toronto-North/RichmondHill", 43.75, -79.60, 43.95, -79.25),
]

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
                    start_idx = DAY_ABBRS.index(start_d)
                    end_idx = DAY_ABBRS.index(end_d)
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
                open_t = times[0].strip().zfill(5)
                close_t = times[1].strip().zfill(5)
                for d in target_days:
                    result[d] = {'open': open_t, 'close': close_t, 'closed': False}
                    parsed_any = True
                    
    return result if parsed_any else None


def fetch_region(name: str, south: float, west: float, north: float, east: float) -> list[dict]:
    query = f"""
    [out:json][timeout:60];
    (
      node["amenity"="cafe"]({south},{west},{north},{east});
      node["shop"="coffee"]({south},{west},{north},{east});
    );
    out body;
    """
    headers = {"User-Agent": "IBeanThere/1.0 (https://github.com/ChrisChae00/IBeanThere)"}
    
    for endpoint in OVERPASS_ENDPOINTS:
        for attempt in range(2):
            try:
                resp = httpx.post(endpoint, data={"data": query}, headers=headers, timeout=60)
                if resp.status_code == 200:
                    elements = resp.json().get("elements", [])
                    print(f"  {name}: {len(elements)} nodes (via {endpoint})")
                    return elements
            except Exception:
                pass
            time.sleep(2)
    return []


def main():
    print("1. Fetching all app_seed cafes from Supabase...")
    res = supabase.table("cafes").select("id, name, latitude, longitude, business_hours").eq("source_type", "app_seed").execute()
    cafes = res.data or []
    print(f"   Total app_seed cafes in DB: {len(cafes)}")
    
    # Map (round(lat, 4), round(lon, 4)) -> cafe_id
    cafe_coord_map = {}
    for c in cafes:
        lat = round(float(c["latitude"]), 4)
        lon = round(float(c["longitude"]), 4)
        cafe_coord_map[(lat, lon)] = c["id"]
        
    print("\n2. Fetching OpenStreetMap nodes and parsing opening_hours...")
    osm_hours_map = {} # cafe_id -> business_hours dict
    
    for name, south, west, north, east in REGIONS:
        nodes = fetch_region(name, south, west, north, east)
        for node in nodes:
            tags = node.get("tags", {})
            raw_oh = tags.get("opening_hours")
            if not raw_oh:
                continue
            
            parsed_bh = parse_osm_opening_hours(raw_oh)
            if not parsed_bh:
                continue
                
            lat = round(float(node["lat"]), 4)
            lon = round(float(node["lon"]), 4)
            
            cafe_id = cafe_coord_map.get((lat, lon))
            if cafe_id:
                osm_hours_map[cafe_id] = parsed_bh
                
    print(f"\n3. Matched {len(osm_hours_map)} cafes with valid parsed business hours!")
    
    print("4. Updating Supabase cafes table...")
    updated_count = 0
    for cafe_id, bh in osm_hours_map.items():
        supabase.table("cafes").update({"business_hours": bh}).eq("id", cafe_id).execute()
        updated_count += 1
        
    print(f"Done! Successfully updated {updated_count} cafes with opening hours from OpenStreetMap!")

if __name__ == "__main__":
    main()
