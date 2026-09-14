import asyncio
import importlib.util
import os
from pathlib import Path
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import AsyncMock, patch

import httpx


SCRIPT = Path(__file__).parents[1] / "scripts" / "backfill_google_place_ids.py"
spec = importlib.util.spec_from_file_location("backfill_google_place_ids", SCRIPT)
backfill = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backfill)


class BackfillCandidateTests(TestCase):
    def test_100_meter_boundary_is_accepted(self):
        self.assertIsNone(backfill.candidate_rejection("new", 100.0, set()))

    def test_over_100_meters_is_rejected(self):
        self.assertEqual(backfill.candidate_rejection("new", 100.01, set()), "over_100m")

    def test_duplicate_is_rejected(self):
        self.assertEqual(backfill.candidate_rejection("used", 1, {"used"}), "duplicate")


class Query:
    def __init__(self, data, operations):
        self.data = data
        self.operations = operations

    def __getattr__(self, name):
        def method(*args, **_kwargs):
            self.operations.append((name, *args))
            return self
        return method

    @property
    def not_(self):
        return self

    def execute(self):
        return SimpleNamespace(data=self.data)


class Database:
    def __init__(self):
        self.operations = []
        self.cafe_reads = 0
        self.cafe = {
            "id": "cafe-1",
            "name": "Cafe",
            "address": "1 Main St",
            "latitude": 43.0,
            "longitude": -80.0,
        }

    def table(self, name):
        if name == "cafes":
            self.cafe_reads += 1
            data = [self.cafe] if self.cafe_reads == 1 else []
        else:
            data = []
        return Query(data, self.operations)


class BackfillFlowTests(TestCase):
    def run_backfill(self, service):
        db = Database()
        with patch.dict(os.environ, {"GOOGLE_PLACES_API_KEY": "key"}), patch.object(
            backfill, "get_supabase_client", return_value=db
        ), patch.object(backfill, "GooglePlacesService", return_value=service), patch("builtins.print"):
            counts = asyncio.run(backfill.backfill(limit=10, apply=False))
        return db, counts

    def test_dry_run_filters_images_before_limit_and_does_not_write(self):
        service = SimpleNamespace(find_place_id_for_cafe=AsyncMock(return_value={
            "id": "place-1",
            "location": {"latitude": 43.0, "longitude": -80.0},
        }))
        db, counts = self.run_backfill(service)
        self.assertEqual(counts["matched"], 1)
        self.assertEqual(
            db.operations[:5],
            [
                ("select", "*"),
                ("is_", "google_place_id", "null"),
                ("is_", "main_image", "null"),
                ("is_", "image", "null"),
                ("limit", 10),
            ],
        )
        self.assertFalse(any(operation[0] == "update" for operation in db.operations))

    def test_api_failure_is_counted_without_write(self):
        service = SimpleNamespace(find_place_id_for_cafe=AsyncMock(
            side_effect=httpx.RequestError("failed")
        ))
        db, counts = self.run_backfill(service)
        self.assertEqual(counts["api_failure"], 1)
        self.assertFalse(any(operation[0] == "update" for operation in db.operations))


if __name__ == "__main__":
    import unittest

    unittest.main()
