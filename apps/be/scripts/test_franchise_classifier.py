"""
Unit checks for the franchise classifier.

Usage:
    cd apps/be
    python scripts/test_franchise_classifier.py
    python scripts/test_franchise_classifier.py --live   # also hit Overpass
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services import franchise_service as fs


class FakeTable:
    """Minimal stand-in for supabase.table('cafe_brands')."""

    def __init__(self, store):
        self.store = store
        self.filters = {}

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, column, value):
        self.filters[column] = value
        return self

    def limit(self, _n):
        return self

    def execute(self):
        rows = [
            row for row in self.store
            if all(row.get(k) == v for k, v in self.filters.items())
        ]
        return type("Result", (), {"data": rows})()

    def upsert(self, row):
        self.store.append(row)
        return self


class FakeSupabase:
    def __init__(self, rows=None):
        self.store = list(rows or [])

    def table(self, _name):
        return FakeTable(self.store)


def brand_row(key, display_name, outlet_count=None, admin_override=None, wikidata_id=None):
    return {
        "brand_key": key,
        "display_name": display_name,
        "outlet_count": outlet_count,
        "admin_override": admin_override,
        "wikidata_id": wikidata_id,
    }


def test_brand_key_normalizes():
    ok = (
        fs.brand_key("  Tim Hortons ") == fs.brand_key("tim hortons")
        and fs.brand_key("C Market Coffee") == "cmarketcoffee"
        and fs.brand_key("") == ""
    )
    print(f"{'✅' if ok else '❌'} brand_key normalizes whitespace and case")
    return ok


def test_threshold_boundary():
    ok = (
        fs.is_franchise_count(fs.FRANCHISE_OUTLET_THRESHOLD - 1) is False
        and fs.is_franchise_count(fs.FRANCHISE_OUTLET_THRESHOLD) is True
        and fs.is_franchise_count(None) is None
    )
    print(f"{'✅' if ok else '❌'} threshold: {fs.FRANCHISE_OUTLET_THRESHOLD - 1} local, "
          f"{fs.FRANCHISE_OUTLET_THRESHOLD} franchise, unknown stays unknown")
    return ok


def test_cached_verdicts():
    supabase = FakeSupabase([
        brand_row("timhortons", "Tim Hortons", outlet_count=4378),
        brand_row("cmarketcoffee", "C Market Coffee", outlet_count=6),
    ])
    franchise = asyncio.run(fs.classify("Tim Hortons", None, supabase))
    local = asyncio.run(fs.classify("C Market Coffee", None, supabase))
    ok = franchise.status == fs.FRANCHISE and local.status == fs.LOCAL
    print(f"{'✅' if ok else '❌'} cached brands classify without network "
          f"(got {franchise.status}/{local.status})")
    return ok


def test_cache_hit_makes_no_request():
    called = []

    async def boom(*_args, **_kwargs):
        called.append(1)
        return None, None

    original = fs.count_outlets
    fs.count_outlets = boom
    try:
        supabase = FakeSupabase([brand_row("timhortons", "Tim Hortons", outlet_count=4378)])
        asyncio.run(fs.classify("Tim Hortons", None, supabase))
    finally:
        fs.count_outlets = original

    ok = not called
    print(f"{'✅' if ok else '❌'} cache hit skips the Overpass call")
    return ok


def test_admin_override_wins():
    franchise_forced = FakeSupabase([
        brand_row("tinychain", "Tiny Chain", outlet_count=3, admin_override=True)
    ])
    local_forced = FakeSupabase([
        brand_row("bigchain", "Big Chain", outlet_count=9000, admin_override=False)
    ])
    a = asyncio.run(fs.classify("Tiny Chain", None, franchise_forced))
    b = asyncio.run(fs.classify("Big Chain", None, local_forced))
    ok = a.status == fs.FRANCHISE and b.status == fs.LOCAL
    print(f"{'✅' if ok else '❌'} admin_override beats the outlet count both ways "
          f"(got {a.status}/{b.status})")
    return ok


def test_failed_lookup_fails_open():
    async def unavailable(*_args, **_kwargs):
        return None, None

    original = fs.count_outlets
    fs.count_outlets = unavailable
    try:
        verdict = asyncio.run(fs.classify("Brand New Cafe", None, FakeSupabase()))
    finally:
        fs.count_outlets = original

    ok = verdict.status == fs.UNKNOWN
    print(f"{'✅' if ok else '❌'} unreachable Overpass yields '{verdict.status}', not a rejection")
    return ok


def test_osm_brand_tag_preferred():
    extratags = {"brand": "Tim Hortons", "brand:wikidata": "Q175106"}
    key, display_name, wikidata_id = fs.resolve_brand(extratags, "Timmies at Yonge & Bloor")
    ok = key == "timhortons" and wikidata_id == "Q175106" and display_name == "Tim Hortons"
    print(f"{'✅' if ok else '❌'} OSM brand tag overrides the submitted name")
    return ok


def test_live_outlet_counts():
    big, big_source = asyncio.run(fs.count_outlets("Q175106", "Tim Hortons", timeout=45))
    small, _ = asyncio.run(fs.count_outlets(None, "C Market Coffee", timeout=45))
    ok = (
        big is not None and big >= fs.FRANCHISE_OUTLET_THRESHOLD
        and small is not None and small < fs.FRANCHISE_OUTLET_THRESHOLD
    )
    print(f"{'✅' if ok else '❌'} live Overpass counts: Tim Hortons={big} ({big_source}), "
          f"C Market Coffee={small}")
    return ok


def main():
    live = "--live" in sys.argv

    tests = [
        test_brand_key_normalizes,
        test_threshold_boundary,
        test_cached_verdicts,
        test_cache_hit_makes_no_request,
        test_admin_override_wins,
        test_failed_lookup_fails_open,
        test_osm_brand_tag_preferred,
    ]
    if live:
        tests.append(test_live_outlet_counts)
    else:
        print("(skipping live Overpass check — pass --live to include it)")

    results = [test() for test in tests]
    passed = sum(results)
    print(f"\n{passed}/{len(results)} passed")
    sys.exit(0 if passed == len(results) else 1)


if __name__ == "__main__":
    main()
