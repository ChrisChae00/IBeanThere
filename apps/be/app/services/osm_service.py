"""
OpenStreetMap Nominatim API service for geocoding.

Rate limit: 1 request per second
User-Agent: Required by OSM policy
"""

import httpx
import asyncio
import logging
import time
from collections import OrderedDict
from typing import Any, Optional, Dict, List

logger = logging.getLogger(__name__)

def format_address(data: Dict) -> str:
    """
    Build a postal address from Nominatim's address components.

    Nominatim's own `display_name` walks the whole administrative tree, so a Waterloo
    cafe arrives carrying "Region of Waterloo, Southwestern Ontario" — levels nobody
    writes on an envelope. Only the parts a postal address actually uses are kept, and
    the order is the one people write them in.
    """
    address = data.get('address', {}) or {}

    street = ' '.join(
        part for part in (address.get('house_number'), address.get('road')) if part
    )
    city = (
        address.get('city')
        or address.get('town')
        or address.get('village')
        or address.get('municipality')
        or address.get('suburb')
    )

    parts = [
        data.get('name'),
        street,
        city,
        address.get('state'),
        address.get('postcode'),
        address.get('country'),
    ]

    # A name that is already the first thing in the street line would read twice.
    seen: List[str] = []
    for part in parts:
        if part and part not in seen:
            seen.append(part)
    return ', '.join(seen)


class OSMService:
    """OpenStreetMap Nominatim API service."""

    BASE_URL = "https://nominatim.openstreetmap.org"
    HEADERS = {
        'User-Agent': 'ibeanthere/1.0'
    }
    RATE_LIMIT = 1.0  # Nominatim's usage policy: one request per second, absolute max
    MAX_RETRIES = 3
    CACHE_SIZE = 512
    # ~11 m at the equator. Two people standing in the same shop ask the same question,
    # so they should not both spend a request on it.
    COORD_PRECISION = 4

    """
    One gate for every call this process makes to Nominatim.

    The policy is one request per second *per client*, not per request handler: the
    old per-call `sleep(1)` let two concurrent registrations sleep in parallel and
    then fire together, which is how an IP earns a 429. The lock serialises calls and
    the timestamp spaces them, so the limit holds no matter how many requests the API
    is serving.
    """
    _gate = asyncio.Lock()
    _last_call = 0.0
    _cache: "OrderedDict[str, Any]" = OrderedDict()

    @classmethod
    def _cache_get(cls, key: str):
        if key in cls._cache:
            cls._cache.move_to_end(key)
            return cls._cache[key]
        return None

    @classmethod
    def _cache_put(cls, key: str, value: Any) -> None:
        cls._cache[key] = value
        cls._cache.move_to_end(key)
        while len(cls._cache) > cls.CACHE_SIZE:
            cls._cache.popitem(last=False)

    async def _get(self, path: str, params: Dict[str, Any]) -> Optional[Any]:
        """
        Send one rate-limited request, retrying a 429 with a widening wait.

        Returns the decoded body, or None when Nominatim could not answer — callers
        must treat None as "the map service is unavailable", never as "no such place".
        """
        for attempt in range(self.MAX_RETRIES):
            async with OSMService._gate:
                wait = self.RATE_LIMIT - (time.monotonic() - OSMService._last_call)
                if wait > 0:
                    await asyncio.sleep(wait)
                try:
                    async with httpx.AsyncClient(timeout=10.0) as client:
                        response = await client.get(
                            f"{self.BASE_URL}{path}",
                            params=params,
                            headers=self.HEADERS
                        )
                finally:
                    OSMService._last_call = time.monotonic()

            if response.status_code == 200:
                return response.json()

            if response.status_code == 429:
                # Backing off inside the gate would block every other caller behind a
                # sleep that is not theirs, so it happens outside it.
                backoff = self.RATE_LIMIT * (2 ** attempt)
                logger.warning("Nominatim rate limit hit (attempt %s), waiting %.1fs",
                               attempt + 1, backoff)
                await asyncio.sleep(backoff)
                continue

            logger.warning("Nominatim %s returned %s", path, response.status_code)
            return None

        logger.error("Nominatim %s still rate limited after %s attempts", path, self.MAX_RETRIES)
        return None
    
    async def reverse_geocode(self, lat: float, lng: float) -> Optional[Dict]:
        """
        Convert coordinates to address (reverse geocoding).

        Returns None when Nominatim is unreachable or rate limiting us. That is not
        the same answer as "this place does not exist", and callers must not read it
        as one.
        """
        key = f"reverse:{round(lat, self.COORD_PRECISION)},{round(lng, self.COORD_PRECISION)}"
        cached = self._cache_get(key)
        if cached is not None:
            return cached

        data = await self._get('/reverse', {
            'lat': lat,
            'lon': lng,
            'format': 'json',
            'addressdetails': 1,
            'extratags': 1
        })
        if not data:
            return None

        address = data.get('address', {})
        result = {
            'display_name': format_address(data),
            'name': address.get('name'),
            'road': address.get('road'),
            'city': address.get('city'),
            'province': address.get('state') or address.get('region'),
            'country': address.get('country'),
            'postcode': address.get('postcode'),
            'extratags': data.get('extratags', {})
        }
        self._cache_put(key, result)
        return result

    async def search(self, query: str, limit: int = 5, countrycodes: Optional[str] = None, viewbox: Optional[Dict[str, float]] = None) -> List[Dict]:
        """
        Search for places by name (forward geocoding).

        Args:
            query: Search query
            limit: Maximum number of results
            countrycodes: ISO 3166-1alpha2 country codes (comma-separated, e.g., "ca,us")
            viewbox: Bounding box to prioritize results (west, south, east, north)

        Returns:
            List of matching places, empty when the service could not answer
        """
        params: Dict[str, Any] = {
            'q': query,
            'format': 'json',
            'limit': limit,
            'addressdetails': 1
        }
        if countrycodes:
            params['countrycodes'] = countrycodes
        if viewbox:
            params['viewbox'] = f"{viewbox['west']},{viewbox['south']},{viewbox['east']},{viewbox['north']}"
            params['bounded'] = 0  # Don't restrict to viewbox, just prioritize

        key = 'search:' + repr(sorted(params.items()))
        cached = self._cache_get(key)
        if cached is not None:
            return cached

        data = await self._get('/search', params)
        if not data:
            return []
        self._cache_put(key, data)
        return data
