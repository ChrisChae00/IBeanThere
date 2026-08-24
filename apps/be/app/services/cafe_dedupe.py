"""
One place for "is this the same cafe as that one".

Registration, both seed scripts and the cleanup script all have to answer that
question the same way. When they each answered it their own way the database
grew pairs like "World Peace" / "World Peace Donuts" at identical coordinates.

Four layers say two rows are the same cafe. They are NOT all enforced here:

  1. same osm_id           — enforced by cafes_osm_id_uidx (migration 014) and by
                             the seed scripts, which hold every known id in memory
  2. same google_place_id  — enforced by cafes_google_place_id_uidx, likewise
  3. same source_url       — enforced by cafes_source_url_uidx
  4. within NEARBY_METERS  — enforced HERE, by find_nearby() / check_nearby_cafes(),
                             and it is the only layer a row with no external id has

So this module implements layer 4 for insertion, and all four for cleanup
(_same_cafe_for_cleanup). The database enforces 1-3 at write time; a caller holding
those ids in memory may check them itself to save a round trip, but must not invent
a fifth rule.

NULL osm_id / google_place_id is normal and allowed: a brand new local cafe is in
neither dataset yet. The partial UNIQUE indexes in migration 014 ignore NULLs.

Cleanup (existing rows) is deliberately stricter than insertion: no PAIR of rows is
ever merged on distance alone, the names have to look alike too. Note that
cluster_cafes() is transitive, so a chain (A~B by name, B~C by a shared id) can pull
A and C into one cluster without ever comparing them — see cluster_cafes.

Known limitation: normalize_name() keeps only ASCII letters and digits, so a purely
non-Latin name (Korean, Chinese, Japanese) normalizes to "" and names_match() is
always False for it. Cleanup therefore never merges two such rows — and never merges
them wrongly either. Insertion is unaffected: layer 4 ignores names.
"""
import logging
import math
import re
import unicodedata
from typing import Optional

logger = logging.getLogger(__name__)

NEARBY_METERS = 25       # insertion guard: same distance registration has always used
CLEANUP_METERS = 50      # cleanup: needs a matching name too, see _same_cafe_for_cleanup

# Below this many characters, one normalized name containing another proves nothing:
# "cafe" sits inside both "cafepamenar" and "cafemercury", two different shops.
MIN_CONTAINMENT_CHARS = 6


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
    """
    Same name, or one name long enough to be distinctive contains the other.

    Containment is what recognises "World Peace" inside "World Peace Donuts". It is
    also what would let a row named "Cafe" swallow every neighbour whose name starts
    with it, so the shorter name has to reach MIN_CONTAINMENT_CHARS first.
    """
    na, nb = normalize_name(a), normalize_name(b)
    if not na or not nb:
        return False
    if na == nb:
        return True
    shorter, longer = (na, nb) if len(na) <= len(nb) else (nb, na)
    return len(shorter) >= MIN_CONTAINMENT_CHARS and shorter in longer


def _coords(row: dict) -> Optional[tuple]:
    """(lat, lng) as floats, or None when the row cannot supply usable ones."""
    try:
        return float(row["latitude"]), float(row["longitude"])
    except (TypeError, ValueError, KeyError):
        return None


def find_nearby(lat: float, lng: float, rows: list[dict],
                threshold_meters: float = NEARBY_METERS) -> Optional[dict]:
    """
    First row within threshold_meters of (lat, lng), name ignored.

    In-memory twin of check_nearby_cafes(), for the seed scripts: they hold every
    existing cafe in a list already, and one DB round trip per OSM node would be
    thousands of queries for the same answer.
    """
    skipped = 0
    for row in rows:
        coords = _coords(row)
        if coords is None:
            skipped += 1
            continue
        if calculate_earth_distance(lat, lng, *coords) < threshold_meters:
            return row
    if skipped:
        # Those rows can never be deduplicated by proximity, and nothing else in the
        # system would ever mention that they exist.
        logger.warning(
            "find_nearby skipped %d row(s) with unusable coordinates near (%s, %s)",
            skipped, lat, lng,
        )
    return None


def check_nearby_cafes(lat: float, lng: float, threshold_meters: int = NEARBY_METERS,
                       supabase=None) -> Optional[dict]:
    """
    Existing cafe within threshold_meters of (lat, lng), or None.

    Bounding box in SQL, exact Haversine in Python.

    Raises on a database failure instead of returning None. None has to mean "I
    looked and there is nothing there"; if it also meant "I could not look", every
    caller would read a transient outage as permission to insert a duplicate.
    """
    if supabase is None:
        from app.database.supabase import get_supabase_client
        supabase = get_supabase_client()

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


# --- cleanup only: grouping existing rows -----------------------------------

def _same_cafe_for_cleanup(a: dict, b: dict) -> bool:
    """Whether two existing rows are the same cafe. Stricter than find_nearby()."""
    for key in ("osm_id", "google_place_id", "source_url"):
        va, vb = a.get(key), b.get(key)
        # str(): osm_id is a BIGINT in the database and an int from Overpass, but a
        # string once it has been through JSON.
        if va and vb and str(va) == str(vb):
            return True

    a_coords, b_coords = _coords(a), _coords(b)
    if a_coords is None or b_coords is None:
        return False  # the rows find_nearby() skips; never delete on missing data

    # Close AND alike. Never distance alone: KW Coffee Collective and Contrabean
    # Roasting Company are stored at byte-identical coordinates and are two real,
    # different shops. Identical coordinates are also how "World Peace" came back as
    # "World Peace Donuts", so names_match() lets one name contain the other.
    if calculate_earth_distance(*a_coords, *b_coords) <= CLEANUP_METERS:
        return names_match(a.get("name"), b.get("name"))

    return False


def cluster_cafes(rows: list[dict]) -> list[list[dict]]:
    """
    Group rows that are the same cafe. Only clusters of 2+ are returned.

    Grouping is transitive: A~B and B~C puts all three together even though A and C
    were never compared. That is what recovers a chain of re-inserts of one shop,
    and it is also the only way two different shops can land in one cluster — so
    _same_cafe_for_cleanup stays strict, and every cluster is printed before
    anything is deleted.

    ponytail: O(n^2) union-find over every pair — a few hundred rows, runs in a
    blink. If this ever has to sweep 100k rows, bucket by a coarse geohash first.
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
    take real users' beans, bean drops and visits with it.
    """
    def sort_key(row):
        return (
            0 if child_counts.get(row["id"], 0) > 0 else 1,
            0 if row.get("main_image") else 1,
            # A row with no created_at is not "the oldest" — sort it last, or it wins
            # the tiebreak and the script prints a reason that is not true.
            row.get("created_at") or "9999",
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

    child_counts has to be complete. A missing count reads as zero, and zero reads
    as "safe to delete" — which is why dedupe_cafes.py refuses to run on a partial
    count rather than warning about it.
    """
    keep, reason = pick_survivor(cluster, child_counts)
    losers = [row for row in cluster if row["id"] != keep["id"]]
    deletable = [row for row in losers if child_counts.get(row["id"], 0) == 0]
    manual = [row for row in losers if child_counts.get(row["id"], 0) > 0]
    return keep, deletable, manual, reason
