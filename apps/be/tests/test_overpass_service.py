"""Overpass blocked this project's IP once; these are the rules that stop a repeat."""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import app.services.overpass_service as overpass


class FakeResponse:
    def __init__(self, status_code, payload=None, headers=None):
        self.status_code = status_code
        self._payload = payload or {}
        self.headers = headers or {}
        self.text = ""

    def json(self):
        return self._payload


def install(responses, sent_at, tmp_path):
    overpass.CACHE_DIR = tmp_path
    overpass._last_call = 0.0

    def fake_post(url, data=None, headers=None, timeout=None):
        sent_at.append(time.monotonic())
        return responses.pop(0)

    overpass.httpx.post = fake_post


def test_repeat_query_is_served_from_disk(tmp_path):
    sent_at = []
    install([FakeResponse(200, {"elements": [{"id": 1}]})], sent_at, tmp_path)

    first = overpass.query("[out:json];node(1);out;")
    second = overpass.query("[out:json];node(1);out;")

    assert first == second == [{"id": 1}]
    assert len(sent_at) == 1


def test_queries_are_spaced(tmp_path):
    sent_at = []
    install([FakeResponse(200, {"elements": []}), FakeResponse(200, {"elements": []})], sent_at, tmp_path)
    overpass.MIN_INTERVAL = 0.3

    overpass.query("query-a")
    overpass.query("query-b")

    assert sent_at[1] - sent_at[0] >= 0.3 * 0.95
    overpass.MIN_INTERVAL = 3.0


def test_refusal_raises_instead_of_reporting_an_empty_region(tmp_path):
    sent_at = []
    install([FakeResponse(429, headers={"Retry-After": "0"}) for _ in range(20)], sent_at, tmp_path)
    overpass.MIN_INTERVAL = 0.0

    try:
        overpass.query("busy-region")
    except RuntimeError as exc:
        assert "refused" in str(exc)
    else:
        raise AssertionError("a refused query must not return an empty element list")
    finally:
        overpass.MIN_INTERVAL = 3.0


if __name__ == "__main__":
    import tempfile

    for test in (test_repeat_query_is_served_from_disk, test_queries_are_spaced,
                 test_refusal_raises_instead_of_reporting_an_empty_region):
        with tempfile.TemporaryDirectory() as tmp:
            test(Path(tmp))
    print("ok")
