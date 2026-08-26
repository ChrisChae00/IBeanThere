"""
What kind of venue is this?

ibeanthere lists cafes that sell coffee. Bubble tea shops, tea houses and juice bars
are out, whatever their size. The signal is OpenStreetMap's `cuisine` tag, which is
already fetched during registration, so this costs no extra lookup.

The module also derives descriptive traits (roastery, bakery, sells beans...). Nothing
filters on those yet — they are recorded now because the OSM sweep that produces them
is expensive to repeat, and future filters will want them.
"""

from typing import Optional

COFFEE = "coffee"
EXCLUDED = "excluded"
UNKNOWN = "unknown"

COFFEE_MARKERS = {"coffee_shop", "coffee", "coffee_roastery"}
EXCLUDED_MARKERS = {"bubble_tea", "tea", "juice", "smoothie"}


def parse_cuisine(tags: Optional[dict]) -> set:
    """OSM packs multiple values into one tag: 'breakfast;coffee_shop;sandwich'."""
    raw = (tags or {}).get("cuisine") or ""
    return {value.strip().lower() for value in raw.split(";") if value.strip()}


def classify_venue(tags: Optional[dict]) -> str:
    """
    COFFEE   — sells coffee
    EXCLUDED — tea or juice only
    UNKNOWN  — the map says nothing; the caller decides (we ask the registrant)

    A place tagged both bubble_tea and coffee_shop counts as coffee: the rule excludes
    venues that do not serve coffee, not venues that also serve something else.
    """
    cuisine = parse_cuisine(tags)

    if cuisine & COFFEE_MARKERS:
        return COFFEE
    if cuisine & EXCLUDED_MARKERS:
        return EXCLUDED
    return UNKNOWN


def derive_traits(tags: Optional[dict]) -> list:
    """
    Descriptive traits for future filtering. Recorded, never enforced.

    Coverage is partial by nature — OSM contributors tag what they care about — so a
    missing trait means "unknown", not "no". Treat these as hints, not facts.
    """
    tags = tags or {}
    cuisine = parse_cuisine(tags)
    shop = (tags.get("shop") or "").strip().lower()
    craft = (tags.get("craft") or "").strip().lower()
    amenity = (tags.get("amenity") or "").strip().lower()

    traits = set()

    if cuisine & COFFEE_MARKERS:
        traits.add("coffee")
    traits |= cuisine & EXCLUDED_MARKERS

    if craft == "coffee_roastery" or "coffee_roastery" in cuisine:
        traits.add("roastery")
    if shop == "coffee":
        traits.add("sells_beans")
    if shop in {"bakery", "pastry"} or "bakery" in cuisine:
        traits.add("bakery")
    if (shop in {"confectionery", "pastry"}
            or amenity == "ice_cream"
            or cuisine & {"dessert", "ice_cream", "cake", "donut"}):
        traits.add("dessert")

    return sorted(traits)
