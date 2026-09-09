"""
Phase 6, step 2: the KW seed, as a reviewed CSV round trip.

The old seeder (`seed_real_cafes.py`) wrote OpenStreetMap straight into `cafes`, which
is how the table ended up with 302 rows carrying a name, an address and nothing anyone
came to the app for. This script splits that into two halves with a person in the
middle:

    export  ->  Overpass for the KW bbox, one CSV row per candidate cafe
    (human)     open it, delete the rows that do not belong, paste a photo URL,
                answer the three trait questions, fix the hours string
    import  ->  the reviewed CSV becomes cafes plus dated `seed` trait observations

Why a person and not more code:

- **A photo is wanted, not required.** `main_image` is the first rung of a fixed
  priority: our own photo, then the newest public log photo, then a Google Place
  Photo on the explore cards, then the placeholder. Once a cafe has any first-party
  image the Google call stops being made at all. So a reviewed cafe with no photo yet
  is not the thing the purge deleted -- that was an unreviewed row with no photo and
  no traits either. The import warns and continues. Until the Google fallback is
  switched on (it has its own gates: migration 015, the Place ID backfill, legal and
  pricing review) a photoless seeded cafe shows the coffee-logo placeholder.
- **Franchise is a per-branch judgement now, not a name match.** A Starbucks Reserve
  that sells its beans belongs on this map and a regular branch does not, and no
  outlet count can tell those apart. `brand_hint` carries whatever count is already
  cached in `cafe_brands` so the reviewer has something to disagree with; the export
  never counts a brand itself, because every independent cafe is its own brand and
  that would be one Overpass query per shop. Non-coffee venues (bubble tea, juice)
  are still dropped automatically -- that rule never needed judgement.
- **OSM tags are not observations.** `venue_traits` saying "roastery" does not mean
  the shop roasts on site, so the three trait columns start empty and only a person
  fills them. A blank cell writes no observation at all: unknown is a real answer and
  the map filter treats it as "not this one" rather than "no".

Seeded trait rows are `source='seed'`, `user_id=NULL`, `status='pending'`, and carry an
`evidence` string an approver can check (migration 021 allows the pending seed row that
019 forbade -- the review that used to happen before the CSV was written now happens
after it, in the admin queue). Once approved they lose to any user observation, however
old, so the first person who says otherwise is right.

Usage:
    cd apps/be
    python scripts/seed_kw_reviewed.py export --out kw_review.csv
    python scripts/seed_kw_reviewed.py import kw_review.csv              # dry run
    python scripts/seed_kw_reviewed.py import kw_review.csv --apply
    python scripts/seed_kw_reviewed.py self-check                        # no DB, no network

Run order for the whole operation: `purge_photoless_seed_cafes.sql`, then this import,
then migration 018, then deploy.
"""
import argparse
import csv
import os
import sys
from datetime import date
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.services import traits as traits_service
from app.services.cafe_dedupe import find_nearby, names_match
from app.services.venue_category import EXCLUDED, classify_venue

# The hours grammar and the address shape are already written and already fixed once
# against real OSM data. `osm_fields` holds no client, so `self-check` runs with no
# credentials in the environment.
from osm_fields import build_address, parse_osm_opening_hours, wikimedia_image_url

# Kitchener-Waterloo, the same box every other script in here uses.
KW_BBOX = (43.35, -80.65, 43.55, -80.35)

# Reading order for someone editing this in a spreadsheet: the decision first, then the
# two things only a person can supply, then the answers, then the reference material.
COLUMNS = [
    "keep",
    "name",
    "main_image",
    "sells_beans",
    "sells_beans_note",
    "sells_beans_evidence",
    "filter_coffee",
    "filter_coffee_note",
    "filter_coffee_evidence",
    "roasts_on_site",
    "roasts_on_site_evidence",
    "address",
    "opening_hours",
    "website",
    "latitude",
    "longitude",
    "osm_id",
    "brand_hint",
    "maps_url",
]

YES = {"y", "yes", "true", "1"}
NO = {"n", "no", "false", "0"}


def cell_to_bool(raw):
    """
    A reviewed trait cell: yes, no, or nothing said.

    Anything unrecognised is *unknown*, not False. A typo must not publish a negative
    observation that drops a cafe out of the bean filter.
    """
    value = (raw or "").strip().lower()
    if value in YES:
        return True
    if value in NO:
        return False
    return None


def kept(row) -> bool:
    return (row.get("keep") or "").strip().lower() in YES


# ---------------------------------------------------------------------------
# export
# ---------------------------------------------------------------------------

def fetch_kw() -> list:
    """Every named cafe node in the KW box. Throttling and caching live in the service."""
    from app.services import overpass_service

    south, west, north, east = KW_BBOX
    return overpass_service.query(f"""
    [out:json][timeout:60];
    (
      node["amenity"="cafe"]({south},{west},{north},{east});
      node["shop"="coffee"]({south},{west},{north},{east});
    );
    out body;
    """)


def brand_hints(supabase) -> dict:
    """
    The brand counts already cached in `cafe_brands`, keyed by both brand key and
    wikidata id.

    Read, never count. Every independent cafe is its own "brand", so classifying on
    demand would fire one Overpass count per shop in the box -- which is how this IP
    got rate-limited once already. An uncounted brand shows as `not counted`, and the
    reviewer judges the branch anyway.
    """
    rows = supabase.table("cafe_brands").select("*").limit(5000).execute().data or []
    cached = {}
    for row in rows:
        cached[row["brand_key"]] = row
        if row.get("wikidata_id"):
            cached[row["wikidata_id"]] = row
    print(f"{len(rows)} brands already counted in cafe_brands.")
    return cached


def export(out_path: str, supabase) -> None:
    from app.services.franchise_service import _verdict_from_row, resolve_brand

    nodes = fetch_kw()
    print(f"Overpass returned {len(nodes)} nodes for Kitchener-Waterloo.")
    cached = brand_hints(supabase)

    rows, dropped = [], 0
    for node in nodes:
        tags = node.get("tags", {})
        name = tags.get("name")
        if not name or "lat" not in node or "lon" not in node:
            dropped += 1
            continue
        # The one rule that still runs without a person: a juice bar is not a cafe
        # whoever looks at it.
        if classify_venue(tags) == EXCLUDED:
            dropped += 1
            continue

        # A hint, never a verdict.
        key, _display, wikidata_id = resolve_brand(tags, name)
        row = cached.get(wikidata_id) or cached.get(key)
        if row is None:
            brand_hint = "not counted"
        else:
            verdict = _verdict_from_row(row)
            brand_hint = verdict.status
            if verdict.outlet_count is not None:
                brand_hint += f" ({verdict.outlet_count} outlets)"

        rows.append({
            "keep": "",
            "name": name,
            "main_image": wikimedia_image_url(tags) or "",
            "sells_beans": "",
            "sells_beans_note": "",
            "sells_beans_evidence": "",
            "filter_coffee": "",
            "filter_coffee_note": "",
            "filter_coffee_evidence": "",
            "roasts_on_site": "",
            "roasts_on_site_evidence": "",
            "address": build_address(tags) or "",
            "opening_hours": tags.get("opening_hours") or "",
            "website": tags.get("website") or tags.get("contact:website") or "",
            "latitude": node["lat"],
            "longitude": node["lon"],
            "osm_id": node["id"],
            "brand_hint": brand_hint,
            "maps_url": maps_url(name, build_address(tags) or "", node["lat"], node["lon"]),
        })

    rows.sort(key=lambda r: r["name"].lower())
    with open(out_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"{len(rows)} candidates written to {out_path} ({dropped} dropped: unnamed or not coffee).")
    print("Fill `keep`, `main_image` and the trait columns, then run the import.")


# ---------------------------------------------------------------------------
# import
# ---------------------------------------------------------------------------

def cafe_row(row, geocode=None) -> dict:
    """
    One reviewed CSV row as a `cafes` insert. Raises ValueError on anything missing.

    Name, coordinates and an address are required -- but a missing address is filled by
    reverse geocoding the coordinates before the row is refused (`geocode` is the
    lookup, injectable so the self-check stays offline). A photo is not: the card falls back to
    a public log photo, then to a Google Place Photo, then to the placeholder, and any
    first-party image stops the Google call for good. Hours are not required either --
    a shop with no posted hours is a real shop, and OSM's grammar is not worth losing a
    reviewed cafe over.
    """
    name = (row.get("name") or "").strip()
    address = (row.get("address") or "").strip() or (geocode or fill_address)(row)
    image = (row.get("main_image") or "").strip()

    if not name:
        raise ValueError("name is empty")
    if not address:
        raise ValueError("address is empty and could not be reverse geocoded")
    if image and not image.startswith("http"):
        raise ValueError("main_image is not a URL")

    try:
        latitude = float(row["latitude"])
        longitude = float(row["longitude"])
    except (KeyError, TypeError, ValueError):
        raise ValueError("latitude/longitude missing or not numeric")

    osm_id = (row.get("osm_id") or "").strip()
    website = (row.get("website") or "").strip()

    return {
        "name": name,
        "osm_id": int(osm_id) if osm_id else None,
        "address": address,
        "latitude": latitude,
        "longitude": longitude,
        # Unverified like every other seeded cafe: three separate people dropping beans
        # is still what verifies one, and the first of them becomes its navigator.
        "status": "pending",
        "verification_count": 0,
        "navigator_id": None,
        "source_type": "app_seed",
        # Name and address, not coordinates. A coordinate query resolves to a bare pin
        # -- Google shows 43°27'09.5"N 80°29'53.0"W and an "Add a missing place" button,
        # not the shop -- and `CafeMapActions` prefers a stored `source_url` over the
        # link it would have built, so this string is what every "open in Google Maps"
        # in the app ends up using. `seed_real_cafes.py` always did it this way.
        "source_url": maps_url(name, address, latitude, longitude),
        "website": website or None,
        "main_image": image or None,
        "business_hours": parse_osm_opening_hours(row.get("opening_hours") or ""),
    }


def maps_url(name: str, address: str, latitude: float, longitude: float) -> str:
    """A Google Maps link that lands on the business, falling back to the pin."""
    where = address or f"{latitude},{longitude}"
    # A reverse-geocoded address already opens with the place name; joining them would
    # search for "Rose Cafe, Rose Cafe, 185 King St".
    label = where if where.lower().startswith(name.lower()) else f"{name}, {where}"
    return f"https://www.google.com/maps/search/?api=1&query={quote(label)}"


def fill_address(row) -> str:
    """
    An address for a row OSM never gave one, from its coordinates.

    Six of the KW candidates -- including two of the three roasters -- carry a name, a
    website and a location but no `addr:*` tags, and refusing those loses exactly the
    cafes the seed exists to add. Nominatim is the same service registration already
    reverse geocodes with, through the same client, so the cache and the rate gate are
    shared. Returns "" when it cannot answer; the caller then refuses the row rather
    than storing a cafe nobody can find.
    """
    import asyncio

    from app.services.osm_service import OSMService

    try:
        latitude, longitude = float(row["latitude"]), float(row["longitude"])
    except (KeyError, TypeError, ValueError):
        return ""

    try:
        data = asyncio.run(OSMService().reverse_geocode(latitude, longitude))
    except Exception:
        return ""
    if not data:
        return ""
    # `display_name` is the field registration itself falls back to when a registrant
    # gives no address, and it is the only one here carrying the street number --
    # `reverse_geocode` returns a flattened dict whose `road` has none.
    return (data.get("display_name") or "").strip()


def observation_rows(row, cafe_id: str, observed_at: date) -> list:
    """
    The reviewed answers as `cafe_trait_observations` inserts, all `pending`.

    A blank cell produces nothing. `clean_note` and `clean_evidence` are the service's
    own functions, so both can only survive where the database's CHECKs allow them: a
    note attached to a yes on one of the two traits that take one, evidence within 500
    characters.

    Pending, not approved, and that is the whole point of migration 021. These answers
    were researched from a website, not seen from inside the shop, so they are a
    suggestion with its working attached. Nothing they claim reaches a count, a flag or
    a map filter until a person approves it in the admin queue.
    """
    out = []
    for trait in traits_service.TRAITS:
        value = cell_to_bool(row.get(trait))
        if value is None:
            continue
        out.append({
            "cafe_id": cafe_id,
            "trait": trait,
            "value": value,
            "source": "seed",
            "user_id": None,
            "observed_at": observed_at.isoformat(),
            "status": traits_service.PENDING,
            "note": traits_service.clean_note(trait, value, row.get(f"{trait}_note")),
            "evidence": traits_service.clean_evidence(row.get(f"{trait}_evidence")),
        })
    return out


def run_import(csv_path: str, observed_at: date, apply: bool, supabase) -> dict:
    """Returns the tally, so the self-check can assert on it instead of on stdout."""
    with open(csv_path, newline="", encoding="utf-8") as handle:
        rows = [r for r in csv.DictReader(handle) if kept(r)]

    print(f"{len(rows)} rows marked keep in {csv_path}.")

    existing = supabase.table("cafes").select(
        "id, name, latitude, longitude, osm_id, main_image"
    ).limit(10000).execute().data or []
    by_osm_id = {str(r["osm_id"]): r for r in existing if r.get("osm_id")}

    # What this seed has already said, so a second run of the same CSV does not stack a
    # duplicate pending row on every cafe it already answered for. A claim the reviewer
    # rejected in the admin queue is gone from this set, so re-running is also how a
    # rejected answer gets resubmitted with better evidence.
    already = {
        (r["cafe_id"], r["trait"])
        for r in (supabase.table("cafe_trait_observations")
                  .select("cafe_id, trait").eq("source", "seed").limit(5000).execute().data or [])
    }

    inserted = enriched = refused = observations = photoless = 0

    for row in rows:
        name = (row.get("name") or "?").strip()
        try:
            payload = cafe_row(row)
        except ValueError as error:
            print(f"  REFUSED  {name}: {error}")
            refused += 1
            continue

        from app.services.blacklists import is_blacklisted
        if is_blacklisted(supabase, payload):
            print(f"  REFUSED  {name}: admin deletion history")
            refused += 1
            continue

        traits_said = [
            t for t in traits_service.TRAITS if cell_to_bool(row.get(t)) is not None
        ]

        # A cafe already in the table is not skipped, it is *enriched*: the review's
        # answers attach to the existing row, and a photo fills an empty `main_image`.
        # Same 25m rule the registration endpoint uses, against the rows already stored
        # and the ones inserted earlier in this run. This is what makes the seed useful
        # for a row that survived the purge or was registered by hand -- the point of
        # reviewing is to tell the cafes apart, and that needs the answers on the row
        # people already find, not on a duplicate beside it.
        target = by_osm_id.get(str(payload["osm_id"])) if payload["osm_id"] else None
        if target is None:
            # 25m is the registration guard, and it ignores names on purpose: a person
            # standing in the shop knows what they are registering. A bulk import does
            # not, and downtown Kitchener has cafes 20m apart -- name-blind matching
            # filed Lucero's review under Adventurer's Guild. An `osm_id` hit above is
            # an identity and still needs no name; proximity alone does.
            near = find_nearby(payload["latitude"], payload["longitude"], existing, 25)
            if near is not None and names_match(near.get("name"), payload["name"]):
                target = near
        if target is not None and "id" in target:
            fill_photo = bool(payload["main_image"]) and not target.get("main_image")
            rows_to_write = [o for o in observation_rows(row, target["id"], observed_at)
                             if (target["id"], o["trait"]) not in already]
            what = f"{len(rows_to_write)} new traits" + (", photo" if fill_photo else "")
            if not apply:
                print(f"  would enrich  {name} -> {target.get('name')} ({what})")
                already.update((target["id"], o["trait"]) for o in rows_to_write)
            else:
                if rows_to_write:
                    supabase.table("cafe_trait_observations").insert(rows_to_write).execute()
                if fill_photo:
                    supabase.table("cafes").update(
                        {"main_image": payload["main_image"]}
                    ).eq("id", target["id"]).execute()
                    target["main_image"] = payload["main_image"]
                already.update((target["id"], o["trait"]) for o in rows_to_write)
                print(f"  enriched {name} -> {target.get('name')} ({what})")
            enriched += 1
            observations += len(rows_to_write)
            continue
        if target is not None:
            # Matched a row queued earlier in this run: a duplicate inside the CSV.
            print(f"  skip     {name}: same cafe as {target.get('name')} earlier in this file")
            continue

        if not payload["main_image"]:
            photoless += 1

        if not apply:
            print(f"  would insert  {name} — traits: {', '.join(traits_said) or 'none answered'}")
            inserted += 1
            observations += len(traits_said)
            existing.append(payload)
            continue

        cafe_id = supabase.table("cafes").insert(payload).execute().data[0]["id"]
        rows_to_write = observation_rows(row, cafe_id, observed_at)
        if rows_to_write:
            supabase.table("cafe_trait_observations").insert(rows_to_write).execute()
        print(f"  inserted {name} ({len(rows_to_write)} observations)")
        inserted += 1
        observations += len(rows_to_write)
        stored = {**payload, "id": cafe_id}
        existing.append(stored)
        if payload["osm_id"]:
            by_osm_id[str(payload["osm_id"])] = stored

    verb = "inserted" if apply else "would insert"
    print(f"\n{verb} {inserted} cafes, enriched {enriched} already in the table, "
          f"{observations} seed observations; {refused} refused.")
    if photoless:
        print(f"{photoless} of them have no photo yet — their cards fall back to a "
              f"public log photo, then Google, then the placeholder.")
    if not apply:
        print("Dry run. Re-run with --apply to write.")

    return {"inserted": inserted, "enriched": enriched, "refused": refused,
            "observations": observations, "photoless": photoless}


# ---------------------------------------------------------------------------
# self-check
# ---------------------------------------------------------------------------

def self_check() -> None:
    """Asserts over the row-shaping, which is where a bad seed would come from."""
    assert cell_to_bool("y") is True
    assert cell_to_bool("NO") is False
    # Unknown, not False: a typo must never publish a negative observation.
    for unknown in ("", None, "?", "maybe", "unknown"):
        assert cell_to_bool(unknown) is None, unknown

    good = {
        "keep": "y", "name": "Settlement", "address": "89 Kent Ave, Kitchener",
        "main_image": "https://example.org/a.jpg", "latitude": "43.45", "longitude": "-80.49",
        "osm_id": "123", "opening_hours": "Mo-Fr 08:00-17:00",
        "sells_beans": "y", "sells_beans_note": "  Detour,  rotating   single origin ",
        "sells_beans_evidence": "  https://example.org/menu  says   retail bags ",
        "filter_coffee": "n", "filter_coffee_note": "should be dropped",
        "filter_coffee_evidence": "menu lists espresso only",
        "roasts_on_site": "",
    }
    payload = cafe_row(good)
    assert payload["main_image"].startswith("http")
    assert payload["source_type"] == "app_seed" and payload["navigator_id"] is None
    assert payload["business_hours"]["monday"]["open"] == "08:00"
    assert payload["business_hours"]["sunday"]["closed"] is True

    assert_refused({**good, "name": ""}, "name")
    assert_refused({**good, "latitude": "north a bit"}, "latitude")
    # A missing address is filled from the coordinates; it is refused only when the
    # lookup has no answer either. Both lookups are stubs -- this runs offline.
    assert_refused({**good, "address": ""}, "address", geocode=lambda _row: "")
    filled = cafe_row({**good, "address": ""}, geocode=lambda _row: "8 King St E, Kitchener")
    assert filled["address"] == "8 King St E, Kitchener"
    # A photo is wanted, not required: the card has three fallbacks behind it. But a
    # cell somebody typed a note into instead of a URL is a mistake, not a photo.
    assert cafe_row({**good, "main_image": ""})["main_image"] is None
    assert_refused({**good, "main_image": "ask Sam for the photo"}, "main_image")

    obs = observation_rows(good, "cafe-1", date(2026, 9, 9))
    by_trait = {o["trait"]: o for o in obs}
    assert set(by_trait) == {"sells_beans", "filter_coffee"}, "a blank cell writes nothing"
    assert by_trait["sells_beans"]["value"] is True
    assert by_trait["sells_beans"]["note"] == "Detour, rotating single origin"
    # A note on a "no" is not a sentence, and the database CHECK refuses it.
    assert by_trait["filter_coffee"]["note"] is None
    # Evidence survives on the "no" that has no note: it is the approver's only handle.
    assert by_trait["sells_beans"]["evidence"] == "https://example.org/menu says retail bags"
    assert by_trait["filter_coffee"]["evidence"] == "menu lists espresso only"
    for row in obs:
        assert (row["source"], row["user_id"], row["status"]) == ("seed", None, "pending")
        assert row["observed_at"] == "2026-09-09"

    assert not kept({"keep": ""}) and kept({"keep": "Y"})

    check_import_loop()
    print("self-check OK")


class _FakeSupabase:
    """Enough of the client for the import loop: one table, one row already stored."""

    def __init__(self, existing):
        self.existing = existing
        self.inserted = {"cafes": [], "cafe_trait_observations": []}

    def table(self, name):
        self.current = name
        return self

    def rpc(self, name, payload):
        assert name == "match_cafe_blacklist"
        self.empty = True
        return self

    def select(self, *_a, **_k):
        return self

    def eq(self, field, value):
        if field == "source":
            self.empty = True
        return self

    def limit(self, *_a, **_k):
        return self

    def insert(self, payload):
        self.pending = payload if isinstance(payload, list) else [payload]
        self.inserted[self.current].extend(self.pending)
        return self

    def update(self, payload):
        self.updated = payload
        return self


    def execute(self):
        pending, self.pending = getattr(self, "pending", None), None
        empty, self.empty = getattr(self, "empty", False), False
        if pending is not None:
            return type("R", (), {"data": [{**pending[0], "id": "cafe-new"}]})
        return type("R", (), {"data": [] if empty else self.existing})


def check_import_loop() -> None:
    """
    The loop that decides what actually gets inserted, against a fake client.

    Six rows: one to insert, one 10m from a cafe already stored under the same name
    (enriched, not duplicated), one 10m from it under a different name (a neighbour, so
    inserted), one reviewed but not photographed yet, one whose photo cell holds a
    sentence instead of a URL, and one nobody marked keep.
    """
    import tempfile

    stored = [{"id": "old", "name": "Already Here", "latitude": 43.4500, "longitude": -80.4900}]
    fake = _FakeSupabase(stored)

    rows = [
        {"keep": "y", "name": "Keeper", "address": "1 King St", "main_image": "https://e.org/1.jpg",
         "latitude": "43.4600", "longitude": "-80.5200", "osm_id": "1",
         "opening_hours": "Mo-Su 09:00-17:00", "sells_beans": "y", "sells_beans_note": "Detour",
         "filter_coffee": "", "roasts_on_site": "n"},
        {"keep": "y", "name": "Already Here", "address": "2 King St", "main_image": "https://e.org/2.jpg",
         "latitude": "43.45005", "longitude": "-80.49005", "osm_id": "2", "sells_beans": "y"},
        # Same doorstep, different shop. Name-blind proximity would have swallowed it.
        {"keep": "y", "name": "The Neighbour", "address": "2b King St", "main_image": "https://e.org/3.jpg",
         "latitude": "43.45006", "longitude": "-80.49006", "osm_id": "6"},
        {"keep": "y", "name": "No Photo Yet", "address": "3 King St", "main_image": "",
         "latitude": "43.47", "longitude": "-80.53", "osm_id": "3", "filter_coffee": "y"},
        {"keep": "y", "name": "Bad Photo Cell", "address": "5 King St",
         "main_image": "ask Sam for it", "latitude": "43.49", "longitude": "-80.55",
         "osm_id": "5"},
        {"keep": "", "name": "Not Reviewed", "address": "4 King St", "main_image": "https://e.org/4.jpg",
         "latitude": "43.48", "longitude": "-80.54", "osm_id": "4"},
    ]

    with tempfile.NamedTemporaryFile("w", suffix=".csv", newline="", delete=False) as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
        path = handle.name

    tally = run_import(path, date(2026, 9, 9), apply=True, supabase=fake)
    os.unlink(path)

    assert tally == {"inserted": 3, "enriched": 1, "refused": 1,
                     "observations": 4, "photoless": 1}, tally
    assert [c["name"] for c in fake.inserted["cafes"]] == [
        "Keeper", "The Neighbour", "No Photo Yet"]
    assert fake.inserted["cafes"][2]["main_image"] is None
    written = fake.inserted["cafe_trait_observations"]
    # The enriched row's answer lands on the stored cafe, and its photo fills the gap.
    assert {o["cafe_id"] for o in written if o["trait"] == "sells_beans"} == {"cafe-new", "old"}
    assert fake.updated == {"main_image": "https://e.org/2.jpg"}
    assert {o["trait"] for o in written} == {"sells_beans", "roasts_on_site", "filter_coffee"}


def assert_refused(row, because: str, geocode=lambda _row: "") -> None:
    try:
        cafe_row(row, geocode=geocode)
    except ValueError:
        return
    raise AssertionError(f"a row with a bad {because} was accepted")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    export_parser = sub.add_parser("export", help="Overpass KW -> review CSV")
    export_parser.add_argument("--out", default="kw_review.csv")

    import_parser = sub.add_parser("import", help="reviewed CSV -> cafes + seed observations")
    import_parser.add_argument("csv_path")
    import_parser.add_argument("--apply", action="store_true",
                               help="write to the database (default: dry run)")
    import_parser.add_argument("--observed-at", default=date.today().isoformat(),
                               help="the day the review was done, YYYY-MM-DD")

    sub.add_parser("self-check", help="assert the row shaping; no database, no network")

    args = parser.parse_args()

    if args.command == "self-check":
        self_check()
        raise SystemExit(0)

    # Only now: importing the client needs the service key in the environment, and
    # `self-check` must run on a laptop that has none.
    from supabase import create_client
    supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

    if args.command == "export":
        export(args.out, supabase)
    else:
        run_import(args.csv_path, date.fromisoformat(args.observed_at), args.apply, supabase)
