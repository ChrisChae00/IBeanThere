"""The gate is what keeps this app's IP off Nominatim's block list."""

import asyncio
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import app.services.osm_service as osm
from app.services.osm_service import OSMService


class FakeResponse:
    def __init__(self, status_code, payload=None):
        self.status_code = status_code
        self._payload = payload or {}

    def json(self):
        return self._payload


def install_fake_client(monkey_responses, sent_at):
    """Replace httpx.AsyncClient with one that records call times."""

    class FakeClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *exc):
            return False

        async def get(self, url, params=None, headers=None):
            sent_at.append(time.monotonic())
            return monkey_responses.pop(0)

    osm.httpx.AsyncClient = lambda *a, **k: FakeClient()


def reset():
    OSMService._cache.clear()
    OSMService._last_call = 0.0


def test_concurrent_calls_are_spaced_by_the_rate_limit():
    reset()
    sent_at = []
    payload = {'address': {'road': 'Main Street', 'city': 'Waterloo'}}
    install_fake_client([FakeResponse(200, payload) for _ in range(3)], sent_at)

    async def run():
        service = OSMService()
        # Three different coordinates so the cache cannot answer any of them.
        await asyncio.gather(
            service.reverse_geocode(1.0, 1.0),
            service.reverse_geocode(2.0, 2.0),
            service.reverse_geocode(3.0, 3.0),
        )

    asyncio.run(run())
    gaps = [b - a for a, b in zip(sent_at, sent_at[1:])]
    assert len(sent_at) == 3
    assert all(gap >= OSMService.RATE_LIMIT * 0.95 for gap in gaps), gaps


def test_repeated_coordinates_cost_one_request():
    reset()
    sent_at = []
    payload = {'address': {'road': 'Main Street', 'city': 'Waterloo'}}
    install_fake_client([FakeResponse(200, payload)], sent_at)

    async def run():
        service = OSMService()
        first = await service.reverse_geocode(43.46431, -80.52042)
        # Same shop, a few metres over — rounds to the same cache key.
        second = await service.reverse_geocode(43.46433, -80.52041)
        return first, second

    first, second = asyncio.run(run())
    assert first == second
    assert len(sent_at) == 1


def test_rate_limited_reply_is_not_an_answer():
    reset()
    sent_at = []
    install_fake_client([FakeResponse(429) for _ in range(OSMService.MAX_RETRIES)], sent_at)
    OSMService.RATE_LIMIT = 0.01  # keep the backoff short for the test

    async def run():
        return await OSMService().reverse_geocode(10.0, 10.0)

    try:
        assert asyncio.run(run()) is None
        assert len(sent_at) == OSMService.MAX_RETRIES
    finally:
        OSMService.RATE_LIMIT = 1.0


if __name__ == "__main__":
    test_concurrent_calls_are_spaced_by_the_rate_limit()
    test_repeated_coordinates_cost_one_request()
    test_rate_limited_reply_is_not_an_answer()
    print("ok")
