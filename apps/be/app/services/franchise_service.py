"""
Franchise classification.

A cafe belongs to a franchise if its brand has at least FRANCHISE_OUTLET_THRESHOLD
locations worldwide. Outlet counts come from OpenStreetMap via Overpass; no brand
names are hardcoded, so the same logic works in any market.

Counting is slow for large brands (10-20s), so every verdict is cached per brand in
the cafe_brands table. Registrations therefore pay the network cost at most once per
brand, and never at all for brands already seen.
"""

import asyncio
import logging
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

FRANCHISE_OUTLET_THRESHOLD = 100  # brands with this many locations or more are franchises
INLINE_LOOKUP_TIMEOUT = 5.0       # hot-path budget; anything slower falls back to 'unknown'

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
OVERPASS_HEADERS = {
    "User-Agent": "IBeanThere/1.0 (https://github.com/ChrisChae00/IBeanThere)"
}

FRANCHISE = "franchise"
LOCAL = "local"
UNKNOWN = "unknown"


@dataclass
class Verdict:
    status: str                       # FRANCHISE | LOCAL | UNKNOWN
    brand_key: str
    display_name: str
    outlet_count: Optional[int] = None


def brand_key(name: str) -> str:
    """Normalize a brand or cafe name into a cache key."""
    return re.sub(r"\s+", "", (name or "").strip().lower())


def is_franchise_count(outlet_count: Optional[int]) -> Optional[bool]:
    """Apply the threshold. None in, None out — an unknown count is not a verdict."""
    if outlet_count is None:
        return None
    return outlet_count >= FRANCHISE_OUTLET_THRESHOLD


async def overpass_query(query: str, timeout: float) -> Optional[dict]:
    """
    POST an Overpass QL query, cycling through the mirrors until the budget runs out.

    Overpass answers 429 when its slots are busy, so a failed cycle is retried with a
    growing pause rather than given up on — as long as the deadline allows. Returns
    None when the budget expires, which callers must treat as unknown.
    """
    loop = asyncio.get_event_loop()
    deadline = loop.time() + timeout
    backoff = 5.0

    async with httpx.AsyncClient() as client:
        while loop.time() < deadline:
            for endpoint in OVERPASS_ENDPOINTS:
                remaining = deadline - loop.time()
                if remaining <= 0:
                    return None
                try:
                    response = await client.post(
                        endpoint,
                        data={"data": query},
                        headers=OVERPASS_HEADERS,
                        timeout=remaining,
                    )
                    if response.status_code == 200:
                        return response.json()
                    logger.warning("Overpass %s returned %s", endpoint, response.status_code)
                except Exception as e:
                    logger.warning("Overpass %s failed: %s", endpoint, e)

            pause = min(backoff, deadline - loop.time())
            if pause <= 0:
                break
            await asyncio.sleep(pause)
            backoff *= 2

    return None


async def count_outlets(
    wikidata_id: Optional[str],
    display_name: Optional[str],
    timeout: float = INLINE_LOOKUP_TIMEOUT,
) -> tuple[Optional[int], Optional[str]]:
    """
    Count a brand's locations worldwide.

    Returns (count, lookup_source). (None, None) when the lookup could not complete —
    callers must treat that as unknown, never as local.
    """
    if wikidata_id:
        # A brand:wikidata id identifies the brand itself, so no other filter is needed.
        body = f'nwr["brand:wikidata"="{wikidata_id}"];'
        source = "wikidata"
    elif display_name:
        escaped = display_name.replace("\\", "\\\\").replace('"', '\\"')
        # Without a brand id, all we have is the name — which is shared by unrelated
        # places worldwide ("The Link", "Inside"). Restrict the count to food and drink
        # venues so a generically named local cafe is not mistaken for a chain.
        body = (
            f'(nwr["name"="{escaped}"]["amenity"="cafe"];'
            f'nwr["name"="{escaped}"]["amenity"="fast_food"];'
            f'nwr["name"="{escaped}"]["shop"="coffee"];);'
        )
        source = "name"
    else:
        return None, None

    # Overpass' own timeout is set slightly above ours so it fails on our side first.
    query = f"[out:json][timeout:{int(timeout) + 5}];{body}out count;"
    data = await overpass_query(query, timeout)

    if not data:
        return None, None

    for element in data.get("elements", []):
        if element.get("type") == "count":
            try:
                return int(element["tags"]["total"]), source
            except (KeyError, TypeError, ValueError):
                return None, None

    return None, None


def resolve_brand(extratags: Optional[dict], name: str) -> tuple[str, str, Optional[str]]:
    """
    Work out which brand a cafe belongs to.

    Prefers OSM's brand tags (authoritative, already fetched during reverse geocoding)
    and falls back to the submitted name — reverse geocoding often snaps to the building
    rather than the POI, in which case the name is all we have.

    Returns (brand_key, display_name, wikidata_id).
    """
    extratags = extratags or {}
    display_name = extratags.get("brand") or name
    wikidata_id = extratags.get("brand:wikidata")
    return brand_key(display_name), display_name, wikidata_id


def _verdict_from_row(row: dict) -> Verdict:
    """Turn a cached cafe_brands row into a verdict. Admin override wins over the count."""
    override = row.get("admin_override")
    if override is None:
        franchise = is_franchise_count(row.get("outlet_count"))
    else:
        franchise = override

    if franchise is None:
        status = UNKNOWN
    else:
        status = FRANCHISE if franchise else LOCAL

    return Verdict(
        status=status,
        brand_key=row["brand_key"],
        display_name=row.get("display_name") or row["brand_key"],
        outlet_count=row.get("outlet_count"),
    )


def lookup_cached_brand(supabase, key: str, wikidata_id: Optional[str]) -> Optional[dict]:
    """Find a cached brand by wikidata id first, then by normalized name."""
    try:
        if wikidata_id:
            result = (
                supabase.table("cafe_brands")
                .select("*")
                .eq("wikidata_id", wikidata_id)
                .limit(1)
                .execute()
            )
            if result.data:
                return result.data[0]

        result = (
            supabase.table("cafe_brands")
            .select("*")
            .eq("brand_key", key)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception:
        logger.warning("cafe_brands lookup failed", exc_info=True)
        return None


def cache_brand(
    supabase,
    key: str,
    display_name: str,
    wikidata_id: Optional[str],
    outlet_count: Optional[int],
    lookup_source: Optional[str],
) -> None:
    """Write through a freshly computed count. Failure here must not fail the caller."""
    try:
        supabase.table("cafe_brands").upsert({
            "brand_key": key,
            "display_name": display_name,
            "wikidata_id": wikidata_id,
            "outlet_count": outlet_count,
            "lookup_source": lookup_source,
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception:
        logger.warning("Failed to cache brand %s", key, exc_info=True)


async def classify(
    name: str,
    extratags: Optional[dict],
    supabase,
    timeout: float = INLINE_LOOKUP_TIMEOUT,
) -> Verdict:
    """
    Classify a cafe as franchise / local / unknown.

    Fails open: if the brand cannot be counted, the verdict is UNKNOWN and the caller
    should let the registration through for admin review. A new independent cafe having
    no OSM presence yet is normal, and must not be mistaken for a rejection.
    """
    key, display_name, wikidata_id = resolve_brand(extratags, name)
    if not key:
        return Verdict(UNKNOWN, key, display_name)

    cached = lookup_cached_brand(supabase, key, wikidata_id)
    if cached and cached.get("outlet_count") is not None:
        return _verdict_from_row(cached)
    if cached and cached.get("admin_override") is not None:
        return _verdict_from_row(cached)

    outlet_count, lookup_source = await count_outlets(wikidata_id, display_name, timeout)
    if outlet_count is None:
        return Verdict(UNKNOWN, key, display_name)

    cache_brand(supabase, key, display_name, wikidata_id, outlet_count, lookup_source)

    franchise = is_franchise_count(outlet_count)
    return Verdict(
        FRANCHISE if franchise else LOCAL,
        key,
        display_name,
        outlet_count,
    )


def classify_sync(name: str, tags: Optional[dict], supabase, timeout: float = 60.0) -> Verdict:
    """Blocking wrapper for scripts. Not for use inside the running API event loop."""
    return asyncio.run(classify(name, tags, supabase, timeout))
