"""
Overpass client shared by every bulk OSM job.

Overpass is a public service with per-IP slots, and this project has already earned a
block from it once. The rules that keep that from happening again live here rather
than in each script, because a script that reimplements them is a script that will
forget one:

- one query at a time, spaced by `MIN_INTERVAL`
- 429 and 504 are backed off and retried, honouring `Retry-After` when it is sent
- every answer is cached on disk, so re-running a seed costs nothing upstream
- endpoints rotate only after a real failure, never to go faster
"""

import hashlib
import json
import logging
import os
import time
from pathlib import Path
from typing import List, Optional

import httpx

logger = logging.getLogger(__name__)

ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

HEADERS = {"User-Agent": "IBeanThere/1.0 (https://github.com/ChrisChae00/IBeanThere)"}

MIN_INTERVAL = 3.0      # seconds between queries, whatever the caller does
MAX_RETRIES = 4
BASE_BACKOFF = 5.0      # seconds; doubles per retry
CACHE_DIR = Path(os.environ.get("OVERPASS_CACHE_DIR", Path.home() / ".cache" / "ibeanthere" / "overpass"))

_last_call = 0.0


def _cache_path(query: str) -> Path:
    return CACHE_DIR / f"{hashlib.sha256(query.encode()).hexdigest()}.json"


def _throttle() -> None:
    global _last_call
    wait = MIN_INTERVAL - (time.monotonic() - _last_call)
    if wait > 0:
        time.sleep(wait)
    _last_call = time.monotonic()


def query(overpass_ql: str, use_cache: bool = True) -> List[dict]:
    """
    Run one Overpass QL query and return its `elements`.

    Raises RuntimeError when every endpoint refused — a caller must not read an empty
    list as "this region has no cafes" and go on to delete or seed anything.
    """
    cache_file = _cache_path(overpass_ql)
    if use_cache and cache_file.exists():
        logger.info("Overpass cache hit (%s)", cache_file.name)
        return json.loads(cache_file.read_text()).get("elements", [])

    last_error: Optional[str] = None

    for endpoint in ENDPOINTS:
        for attempt in range(MAX_RETRIES):
            _throttle()
            try:
                response = httpx.post(
                    endpoint,
                    data={"data": overpass_ql},
                    headers=HEADERS,
                    timeout=180,
                )
            except Exception as exc:  # network-level failure: try the next endpoint
                last_error = f"{endpoint}: {exc}"
                logger.warning("Overpass request failed (%s)", last_error)
                break

            if response.status_code == 200:
                payload = response.json()
                if use_cache:
                    CACHE_DIR.mkdir(parents=True, exist_ok=True)
                    cache_file.write_text(json.dumps(payload))
                return payload.get("elements", [])

            # 429: no slot free. 504: the query ran too long for the server's budget.
            if response.status_code in (429, 504):
                retry_after = response.headers.get("Retry-After")
                backoff = float(retry_after) if (retry_after or "").isdigit() else BASE_BACKOFF * (2 ** attempt)
                last_error = f"{endpoint}: {response.status_code}"
                logger.warning("Overpass %s, waiting %.0fs (attempt %s)",
                               response.status_code, backoff, attempt + 1)
                time.sleep(backoff)
                continue

            last_error = f"{endpoint}: {response.status_code}"
            logger.warning("Overpass returned %s", response.status_code)
            break

    raise RuntimeError(f"Every Overpass endpoint refused the query. Last error: {last_error}")
