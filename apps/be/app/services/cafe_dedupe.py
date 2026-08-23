"""
One place for "is this the same cafe as that one".

Registration, both seed scripts and the cleanup script all have to answer that
question the same way. When they each answered it their own way the database
grew pairs like "World Peace" / "World Peace Donuts" at identical coordinates.

Identity, in order:
  1. same osm_id (both present)          — OSM node id, borrowed
  2. same google_place_id (both present) — Google place id, borrowed
  3. same source_url (both present)      — provenance, catches cid URLs
  4. within NEARBY_METERS               — the only rule available when a row has no
                                          external id at all (new local cafe)

NULL osm_id / google_place_id is normal and allowed: a brand new local cafe is in
neither dataset yet. The partial UNIQUE indexes in migration 014 ignore NULLs.

Cleanup (existing rows) is deliberately stricter than insertion: it also wants the
names to look alike before merging two rows that are merely close, so two different
shops in the same building are never merged into one.
"""
import math
import re
import unicodedata
from typing import Optional

NEARBY_METERS = 25       # insertion guard: same distance registration has always used
CLEANUP_METERS = 50      # cleanup: only with a matching name (see cluster_cafes)


def calculate_earth_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distance between two coordinates in meters (Haversine)."""
    r = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def normalize_name(name: Optional[str]) -> str:
    """Lowercase, drop accents and punctuation, for name comparison ("Café" == "Cafe")."""
    if not name:
        return ""
    folded = unicodedata.normalize("NFKD", name.lower())
    return re.sub(r"[^a-z0-9]", "", folded)


def names_match(a: Optional[str], b: Optional[str]) -> bool:
    """Same name, or one contains the other ("World Peace" / "World Peace Donuts")."""
    na, nb = normalize_name(a), normalize_name(b)
    if not na or not nb:
        return False
    return na in nb or nb in na


def find_nearby(lat: float, lng: float, rows: list[dict],
                threshold_meters: float = NEARBY_METERS) -> Optional[dict]:
    """
    First row within threshold_meters of (lat, lng), name ignored.

    In-memory twin of check_nearby_cafes(), for the seed scripts: they hold every
    existing cafe in a list already, and one DB round trip per OSM node would be
    thousands of queries for the same answer.
    """
    for row in rows:
        try:
            other_lat = float(row["latitude"])
            other_lng = float(row["longitude"])
        except (TypeError, ValueError, KeyError):
            continue
        if calculate_earth_distance(lat, lng, other_lat, other_lng) < threshold_meters:
            return row
    return None


def check_nearby_cafes(lat: float, lng: float, threshold_meters: int = NEARBY_METERS,
                       supabase=None) -> Optional[dict]:
    """
    Existing cafe within threshold_meters of (lat, lng), or None.

    Bounding box in SQL, exact Haversine in Python.
    """
    if supabase is None:
        from app.database.supabase import get_supabase_client
        supabase = get_supabase_client()

    try:
        lat_offset = threshold_meters / 111000
        cos_lat = math.cos(math.radians(abs(lat)))
        lng_offset = threshold_meters / (111000 * cos_lat) if cos_lat else lat_offset

        result = supabase.table("cafes").select("*").gte(
            "latitude", lat - lat_offset
        ).lte(
            "latitude", lat + lat_offset
        ).gte(
            "longitude", lng - lng_offset
        ).lte(
            "longitude", lng + lng_offset
        ).execute()

        return find_nearby(lat, lng, result.data or [], threshold_meters)
    except Exception:
        import logging
        logging.getLogger(__name__).error("Error checking nearby cafes", exc_info=True)
        return None


# --- cleanup only: grouping existing rows -----------------------------------

def _same_cafe_for_cleanup(a: dict, b: dict) -> bool:
    """Whether two existing rows are the same cafe. Stricter than find_nearby()."""
    for key in ("osm_id", "google_place_id", "source_url"):
        va, vb = a.get(key), b.get(key)
        if va and vb and str(va) == str(vb):
            return True

    a_lat, a_lng = float(a["latitude"]), float(a["longitude"])
    b_lat, b_lng = float(b["latitude"]), float(b["longitude"])

    # Close AND alike. Never distance alone: KW Coffee Collective and Contrabean
    # Roasting Company are stored at byte-identical coordinates and are two real,
    # different shops. Identical coordinates are how "World Peace" came back as
    # "World Peace Donuts", so the name test allows one name to contain the other.
    if calculate_earth_distance(a_lat, a_lng, b_lat, b_lng) <= CLEANUP_METERS:
        return names_match(a.get("name"), b.get("name"))

    return False


def cluster_cafes(rows: list[dict]) -> list[list[dict]]:
    """
    Group rows that are the same cafe. Only clusters of 2+ are returned.

    ponytail: O(n^2) union-find over every pair — 332 rows, runs in a blink. If this
    ever has to sweep 100k rows, bucket by a coarse geohash first.
    """
    parent = list(range(len(rows)))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for i in range(len(rows)):
        for j in range(i + 1, len(rows)):
            if find(i) != find(j) and _same_cafe_for_cleanup(rows[i], rows[j]):
                parent[find(j)] = find(i)

    groups: dict[int, list[dict]] = {}
    for i, row in enumerate(rows):
        groups.setdefault(find(i), []).append(row)
    return [g for g in groups.values() if len(g) > 1]


def pick_survivor(cluster: list[dict], child_counts: dict) -> tuple[dict, str]:
    """
    The row to keep, and why.

    Order: rows with dependent data, then rows with a photo, then the oldest, then
    the smallest id. Dependent data outranks everything — deleting that row would
    take somebody's bean drops and reviews with it.
    """
    def sort_key(row):
        return (
            0 if child_counts.get(row["id"], 0) > 0 else 1,
            0 if row.get("main_image") else 1,
            row.get("created_at") or "",
            str(row["id"]),
        )

    ordered = sorted(cluster, key=sort_key)
    keep = ordered[0]
    if child_counts.get(keep["id"], 0) > 0:
        reason = "has dependent rows"
    elif keep.get("main_image"):
        reason = "has an image"
    else:
        reason = "registered first"
    return keep, reason


def safe_to_delete(cluster: list[dict], child_counts: dict) -> tuple[dict, list[dict], list[dict], str]:
    """
    (keep, deletable losers, losers needing a manual merge, keep reason).

    A loser with dependent rows is never deleted automatically: merging its beans
    into the survivor can collide with the cafe_beans (cafe_id, user_id) UNIQUE.
    """
    keep, reason = pick_survivor(cluster, child_counts)
    losers = [row for row in cluster if row["id"] != keep["id"]]
    deletable = [row for row in losers if child_counts.get(row["id"], 0) == 0]
    manual = [row for row in losers if child_counts.get(row["id"], 0) > 0]
    return keep, deletable, manual, reason
