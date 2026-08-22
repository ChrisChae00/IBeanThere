"""
Classify every cafe already in the DB and remove the ones that do not belong.

Two independent rules, both from OpenStreetMap, nothing hardcoded:
  - franchise: the brand has at least FRANCHISE_OUTLET_THRESHOLD locations worldwide
  - not coffee: the venue is a bubble tea shop, tea house or juice bar

Survivors get their descriptive traits (roastery, bakery, sells beans...) recorded.
No filter reads those yet; this sweep is the only cheap chance to collect them.

Dry run by default — prints what would happen and changes nothing.

Usage:
    cd apps/be
    python scripts/purge_franchise_cafes.py            # dry run
    python scripts/purge_franchise_cafes.py --apply    # write verdicts + delete franchises

WARNING: --apply hard-deletes the rejected cafes. Their reviews, check-ins, bean drops
and collection entries go with them via ON DELETE CASCADE.
"""
import argparse
import asyncio
import json
import math
import os
import sys
import time
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

from app.services.venue_category import EXCLUDED, classify_venue, derive_traits
from app.services.franchise_service import (
    FRANCHISE,
    FRANCHISE_OUTLET_THRESHOLD,
    LOCAL,
    UNKNOWN,
    brand_key,
    count_outlets,
    is_franchise_count,
    overpass_query,
)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# (name, south, west, north, east) — same coverage as the seed scripts
REGIONS = [
    ("Kitchener-Waterloo", 43.35, -80.65, 43.55, -80.35),
    ("Toronto-Downtown", 43.62, -79.45, 43.70, -79.35),
    ("Toronto-Central", 43.65, -79.42, 43.78, -79.25),
    # Split: the combined West/Mississauga bbox is large enough that Overpass times out.
    ("Toronto-West", 43.60, -79.60, 43.75, -79.42),
    ("Mississauga", 43.50, -79.75, 43.65, -79.55),
    ("Toronto-East/Markham", 43.65, -79.25, 43.95, -79.05),
    ("Toronto-North/RichmondHill", 43.75, -79.60, 43.95, -79.25),
]

# Counts survive between runs here, so a re-run only retries what failed. Overpass
# rate-limits hard, and re-asking for 50 brands every attempt is what triggers it.
COUNT_CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                ".brand_counts.json")
REGION_CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                 ".region_tags.json")

NODE_MATCH_METERS = 60  # how far the matching OSM node may sit from our stored coords

REGION_TIMEOUT = 120.0
COUNT_TIMEOUT = 120.0
POLITE_DELAY = 2.0  # Overpass answers 429 when hit harder than this
MAX_REGION_SPLITS = 2  # a failing bbox is quartered this many times before giving up
NAME_MATCH_METERS = 400  # radius for the by-name fallback lookup
NAME_LOOKUP_TIMEOUT = 45.0


def haversine_meters(lat1, lon1, lat2, lon2):
    r = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


async def fetch_region_nodes(name, south, west, north, east, depth=0):
    """
    Every cafe node in the bbox, with all its tags.

    Dense bboxes time out on Overpass, and which ones fail varies with server load, so
    a failure splits the box into quadrants and retries rather than giving up — an
    unswept area silently leaves its chains in the database.
    """
    # Nodes only: the seeded rows come from OSM nodes, and adding ways/relations
    # makes Overpass time out on these bboxes.
    query = f"""
    [out:json][timeout:90];
    (
      node["amenity"="cafe"]({south},{west},{north},{east});
      node["shop"="coffee"]({south},{west},{north},{east});
    );
    out body;
    """
    print(f"  {'  ' * depth}Querying Overpass for {name}...")
    data = await overpass_query(query, REGION_TIMEOUT)
    if data:
        return data.get("elements", [])

    if depth >= MAX_REGION_SPLITS:
        print(f"  {'  ' * depth}WARNING: {name} failed and is too small to split further")
        return []

    mid_lat, mid_lon = (south + north) / 2, (west + east) / 2
    quadrants = [
        (f"{name}/SW", south, west, mid_lat, mid_lon),
        (f"{name}/SE", south, mid_lon, mid_lat, east),
        (f"{name}/NW", mid_lat, west, north, mid_lon),
        (f"{name}/NE", mid_lat, mid_lon, north, east),
    ]
    print(f"  {'  ' * depth}{name} failed — splitting into 4")

    elements = []
    for quadrant in quadrants:
        await asyncio.sleep(POLITE_DELAY)
        part = await fetch_region_nodes(*quadrant, depth=depth + 1)
        if not part:
            return []  # a hole anywhere makes the whole region untrustworthy
        elements.extend(part)
    return elements


async def fetch_node_by_name(name, lat, lon):
    """Last-resort lookup for a row the bbox sweep did not match: search by name nearby."""
    escaped = name.replace("\\", "\\\\").replace('"', '\\"')
    query = (f'[out:json][timeout:30];'
             f'nwr(around:{NAME_MATCH_METERS},{lat},{lon})["name"="{escaped}"];out tags 1;')
    data = await overpass_query(query, NAME_LOOKUP_TIMEOUT)
    if not data:
        return None
    for element in data.get("elements", []):
        return element.get("tags", {})
    return None


async def main(apply: bool):
    print("1. Loading cafes...")
    cafes = supabase.table("cafes").select(
        "id, name, latitude, longitude"
    ).limit(10000).execute().data or []
    print(f"   {len(cafes)} cafes\n")


    print("2. Matching cafes to OSM nodes by region...")
    # cafe id -> OSM tag dict. Cached to disk: these bbox queries are the first thing
    # Overpass refuses when it decides we have asked enough.
    matched = {}
    if os.path.exists(REGION_CACHE_PATH):
        with open(REGION_CACHE_PATH) as f:
            matched = json.load(f)
        print(f"   {len(matched)} matches reused from {REGION_CACHE_PATH}")
    else:
        complete = True
        nodes = []  # (lat, lon, tags)
        for region in REGIONS:
            elements = await fetch_region_nodes(*region)
            if not elements:
                complete = False
            for element in elements:
                nodes.append((
                    float(element["lat"]),
                    float(element["lon"]),
                    element.get("tags", {}),
                ))
            await asyncio.sleep(POLITE_DELAY)

        # Match by proximity, not exact coordinates: rows seeded from Google sit a few
        # metres off the OSM node, and an exact match silently leaves them unmatched —
        # which is how "Starbucks Coffee Company" survives a purge of "Starbucks".
        #
        # Downtown blocks hold several cafes inside the match radius, so distance alone
        # picks the neighbour as often as the shop itself. A node whose name matches
        # wins over a closer one that does not.
        for cafe in cafes:
            lat, lon = float(cafe["latitude"]), float(cafe["longitude"])
            our_name = brand_key(cafe["name"])
            best, best_distance = None, NODE_MATCH_METERS
            best_named, best_named_distance = None, NODE_MATCH_METERS
            for n_lat, n_lon, tags in nodes:
                distance = haversine_meters(lat, lon, n_lat, n_lon)
                if distance >= NODE_MATCH_METERS:
                    continue
                if distance < best_distance:
                    best, best_distance = tags, distance
                node_names = {brand_key(tags.get("name") or ""),
                              brand_key(tags.get("brand") or "")}
                if our_name and our_name in node_names and distance < best_named_distance:
                    best_named, best_named_distance = tags, distance
            chosen = best_named if best_named is not None else best
            if chosen is not None:
                matched[cafe["id"]] = chosen

        # Only cache a complete sweep — a partial one would silently hide chains.
        if complete:
            with open(REGION_CACHE_PATH, "w") as f:
                json.dump(matched, f, indent=1)
        else:
            print("   WARNING: some regions failed, not caching this sweep")
    print(f"   {len(matched)} cafes matched an OSM node\n")

    # Rows the sweep could not place — a moved node, a coordinate off by more than the
    # match radius, or a venue absent from OSM. One name lookup each is cheap and turns
    # most of them from "unclassifiable" into a real verdict.
    unmatched = [cafe for cafe in cafes if cafe["id"] not in matched]
    if unmatched:
        print(f"   {len(unmatched)} unmatched — looking each up by name...")
        found = 0
        for cafe in unmatched:
            tags = await fetch_node_by_name(
                cafe["name"], float(cafe["latitude"]), float(cafe["longitude"])
            )
            if tags:
                matched[cafe["id"]] = tags
                found += 1
                print(f"     {cafe['name'][:40]:<40} cuisine={tags.get('cuisine', '-')}")
            await asyncio.sleep(POLITE_DELAY)
        print(f"   {found} of {len(unmatched)} resolved by name\n")
        # Fold them into the cache so the next run does not re-ask Overpass.
        if found and os.path.exists(REGION_CACHE_PATH):
            with open(REGION_CACHE_PATH, "w") as f:
                json.dump(matched, f, indent=1)

    resolved = {
        cafe_id: (tags.get("brand"), tags.get("brand:wikidata"))
        for cafe_id, tags in matched.items()
        if tags.get("brand")
    }
    print(f"   {len(resolved)} of them carry a brand tag\n")

    # Group every cafe under a brand key; unmatched ones fall back to their own name.
    brands = {}  # brand_key -> {display_name, wikidata_id, cafes: [...]}
    for cafe in cafes:
        display_name, wikidata_id = resolved.get(cafe["id"], (None, None))
        display_name = display_name or cafe["name"]
        key = brand_key(display_name)
        if not key:
            continue
        entry = brands.setdefault(key, {
            "display_name": display_name,
            "wikidata_id": wikidata_id,
            "cafes": [],
        })
        entry["wikidata_id"] = entry["wikidata_id"] or wikidata_id
        entry["cafes"].append(cafe)

    # Only brands that could plausibly be chains get counted. A cafe whose OSM node
    # carries no brand tag and whose name appears once in the whole DB is a local shop;
    # asking Overpass 300 more times to confirm that gets the caller rate-limited, and
    # name-only counts are unreliable for generic names anyway ("Inside", "The Link").
    candidates = {
        key: entry for key, entry in brands.items()
        if entry["wikidata_id"] or len(entry["cafes"]) > 1
    }

    print(f"3. Counting outlets for {len(candidates)} candidate brands "
          f"of {len(brands)} (~{POLITE_DELAY}s each)...")
    verdicts = {}  # brand_key -> (status, outlet_count, lookup_source)
    for key, entry in brands.items():
        if key not in candidates:
            verdicts[key] = (LOCAL, None, "single-location")

    cached_counts = {}
    if os.path.exists(COUNT_CACHE_PATH):
        with open(COUNT_CACHE_PATH) as f:
            cached_counts = json.load(f)
        print(f"   {len(cached_counts)} counts reused from {COUNT_CACHE_PATH}")

    async def count_and_record(i, total, key, entry):
        outlet_count, lookup_source = await count_outlets(
            entry["wikidata_id"], entry["display_name"], COUNT_TIMEOUT
        )
        franchise = is_franchise_count(outlet_count)
        status = UNKNOWN if franchise is None else (FRANCHISE if franchise else LOCAL)
        verdicts[key] = (status, outlet_count, lookup_source)
        if outlet_count is not None:
            cached_counts[key] = [outlet_count, lookup_source]
            with open(COUNT_CACHE_PATH, "w") as f:
                json.dump(cached_counts, f, indent=1, sort_keys=True)
        print(f"   [{i}/{total}] {entry['display_name']}: {outlet_count} -> {status}")
        await asyncio.sleep(POLITE_DELAY)

    todo = []
    for key, entry in sorted(candidates.items()):
        if key in cached_counts:
            outlet_count, lookup_source = cached_counts[key]
            verdicts[key] = (
                FRANCHISE if is_franchise_count(outlet_count) else LOCAL,
                outlet_count,
                lookup_source,
            )
        else:
            todo.append((key, entry))

    for i, (key, entry) in enumerate(todo, 1):
        await count_and_record(i, len(todo), key, entry)

    # Overpass fails intermittently under load; give every gap one more chance.
    retry = [(k, candidates[k]) for k, v in verdicts.items()
             if v[0] == UNKNOWN and k in candidates]
    if retry:
        print(f"\n   retrying {len(retry)} brands Overpass would not answer...")
        for i, (key, entry) in enumerate(retry, 1):
            await asyncio.sleep(POLITE_DELAY * 5)
            await count_and_record(i, len(retry), key, entry)

    print("\n4. Verdicts")
    doomed = []          # (cafe, reason)
    survivors = []
    by_status = defaultdict(int)
    franchise_keys = {k for k, v in verdicts.items() if v[0] == FRANCHISE}

    for key, entry in sorted(brands.items(), key=lambda kv: -len(kv[1]["cafes"])):
        status, outlet_count, _ = verdicts[key]
        if status == FRANCHISE:
            doomed.extend((cafe, "franchise") for cafe in entry["cafes"])
            by_status[FRANCHISE] += len(entry["cafes"])
            print(f"   DELETE franchise  {entry['display_name']:<32} "
                  f"{outlet_count:>6} outlets  {len(entry['cafes']):>3} rows")

    # Name variants of a brand already judged a franchise: "Tim Hortons Brookfield
    # Place", "Kung Fu Tea on King St.". They are single rows with no OSM match, so
    # brand grouping leaves them looking local. The prefix must end on a word boundary
    # so that "Coffee Timeless" is not swallowed by "Coffee Time".
    franchise_names = sorted(
        (brands[k]["display_name"].strip().lower() for k in franchise_keys),
        key=len, reverse=True,
    )
    already_doomed = {cafe["id"] for cafe, _ in doomed}

    def franchise_prefix(name):
        lowered = name.strip().lower()
        for brand in franchise_names:
            if lowered == brand:
                return brand
            if lowered.startswith(brand) and not lowered[len(brand)].isalnum():
                return brand
        return None

    for cafe in cafes:
        if cafe["id"] in already_doomed:
            continue
        brand = franchise_prefix(cafe["name"])
        if brand:
            doomed.append((cafe, "franchise"))
            already_doomed.add(cafe["id"])
            by_status[FRANCHISE] += 1
            print(f"   DELETE franchise  {cafe['name'][:32]:<32} name variant of '{brand}'")

    # Coffee rule, applied per cafe: a brand can be local and still not sell coffee.
    not_coffee = []
    for cafe in cafes:
        if cafe["id"] in already_doomed:
            continue
        tags = matched.get(cafe["id"])
        if classify_venue(tags) == EXCLUDED:
            not_coffee.append(cafe)
            doomed.append((cafe, "not coffee"))
        else:
            survivors.append(cafe)

    for cafe in sorted(not_coffee, key=lambda c: c["name"]):
        cuisine = (matched.get(cafe["id"]) or {}).get("cuisine", "?")
        print(f"   DELETE not-coffee {cafe['name'][:32]:<32} cuisine={cuisine}")

    trait_counts = defaultdict(int)
    for cafe in survivors:
        for trait in derive_traits(matched.get(cafe["id"])):
            trait_counts[trait] += 1

    print(f"\n   franchise rows:  {by_status[FRANCHISE]}")
    print(f"   not-coffee rows: {len(not_coffee)}")
    print(f"   surviving rows:  {len(survivors)}")
    print(f"   threshold:       {FRANCHISE_OUTLET_THRESHOLD} outlets")

    print("\n   traits collected for survivors:")
    if trait_counts:
        for trait, count in sorted(trait_counts.items(), key=lambda kv: -kv[1]):
            print(f"     {trait:<14} {count}")
    else:
        print("     (none)")

    if doomed:
        child_rows = 0
        for cafe, _ in doomed:
            try:
                child_rows += supabase.rpc(
                    "cafe_child_rows", {"p_cafe_id": cafe["id"]}
                ).execute().data or 0
            except Exception:
                child_rows = -1
                break
        if child_rows >= 0:
            print(f"\n   cascade will also delete {child_rows} dependent rows")
        else:
            print("\n   (cafe_child_rows() not available — run dedupe_nearby_cafes.sql "
                  "first to see cascade impact)")

    if not apply:
        print("\nDry run. Re-run with --apply to write verdicts and delete the rejects.")
        return

    print("\n5. Writing brand cache...")
    rows = [{
        "brand_key": key,
        "display_name": entry["display_name"],
        "wikidata_id": entry["wikidata_id"],
        "outlet_count": verdicts[key][1],
        "lookup_source": verdicts[key][2],
    } for key, entry in brands.items()]
    for i in range(0, len(rows), 100):
        supabase.table("cafe_brands").upsert(rows[i:i + 100]).execute()
    print(f"   {len(rows)} brands cached")

    print("6. Tagging surviving cafes...")
    brand_of = {}
    for key, entry in brands.items():
        if verdicts[key][0] == FRANCHISE:
            continue
        for cafe in entry["cafes"]:
            brand_of[cafe["id"]] = (key, verdicts[key][0])

    tagged = 0
    for cafe in survivors:
        key, status = brand_of.get(cafe["id"], (None, UNKNOWN))
        tags = matched.get(cafe["id"])
        supabase.table("cafes").update({
            "brand_key": key,
            "brand_status": status,
            "venue_traits": derive_traits(tags),
            "osm_tags": tags,
            "category_source": "osm" if tags else "unverified",
        }).eq("id", cafe["id"]).execute()
        tagged += 1
    print(f"   {tagged} cafes tagged")

    print("7. Deleting rejected cafes...")
    doomed_ids = [cafe["id"] for cafe, _ in doomed]
    for i in range(0, len(doomed_ids), 100):
        supabase.table("cafes").delete().in_("id", doomed_ids[i:i + 100]).execute()
    print(f"   {len(doomed_ids)} cafes deleted")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true",
                        help="write verdicts and hard-delete the rejected cafes")
    args = parser.parse_args()
    started = time.time()
    asyncio.run(main(args.apply))
    print(f"\nDone in {time.time() - started:.0f}s")
