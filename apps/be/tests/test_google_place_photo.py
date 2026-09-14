import asyncio
import os
from datetime import datetime, timezone
from unittest import TestCase
from unittest.mock import AsyncMock, patch

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-key")

from app.api.v1 import cafes


class Query:
    def __init__(self, data):
        self.data = data

    def __getattr__(self, _name):
        return lambda *_args, **_kwargs: self

    @property
    def not_(self):
        return self

    def execute(self):
        return self


class Database:
    def __init__(self, cafe, visits=None, reserved=1):
        self.cafe = cafe
        self.visits = visits or []
        self.reserved = reserved

    def table(self, name):
        return Query([self.cafe] if name == "cafes" else self.visits)

    def rpc(self, _name, _params):
        return Query(self.reserved)


async def call_endpoint(db):
    original = getattr(cafes.get_google_photo, "__wrapped__", cafes.get_google_photo)
    with patch.object(cafes, "get_supabase_client", return_value=db), patch.object(
        cafes.settings, "google_place_photo_enabled", True
    ), patch.object(cafes.settings, "google_places_api_key", "key"):
        return await original("cafe-1", object())


class GooglePhotoEndpointTests(TestCase):
    def test_owned_image_prevents_google_calls(self):
        with patch.object(cafes.GooglePlacesService, "get_first_photo", new=AsyncMock()) as google:
            response = asyncio.run(call_endpoint(Database({"id": "cafe-1", "main_image": "owned.jpg"})))
        self.assertEqual(response.status_code, 204)
        google.assert_not_awaited()
        self.assertEqual(response.headers["cache-control"], "no-store")

    def test_public_visit_image_prevents_google_calls(self):
        with patch.object(cafes.GooglePlacesService, "get_first_photo", new=AsyncMock()) as google:
            response = asyncio.run(call_endpoint(Database(
                {"id": "cafe-1", "google_place_id": "place-1"},
                [{"photo_urls": ["visit.jpg"]}],
            )))
        self.assertEqual(response.status_code, 204)
        google.assert_not_awaited()

    def test_success_maps_attribution_and_does_not_cache(self):
        photo = {
            "name": "places/place-1/photos/photo-1",
            "googleMapsUri": "https://maps.google.com/photo",
            "authorAttributions": [{
                "displayName": "Author",
                "uri": "https://maps.google.com/author",
                "photoUri": "https://images.google.com/avatar",
            }],
        }
        with patch.object(cafes.GooglePlacesService, "get_first_photo", new=AsyncMock(return_value=photo)), patch.object(
            cafes.GooglePlacesService, "get_photo_uri", new=AsyncMock(return_value="https://images.google.com/photo")
        ):
            response = asyncio.run(call_endpoint(Database({"id": "cafe-1", "google_place_id": "place-1"})))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.assertIn(b'"display_name":"Author"', response.body)
        self.assertIn(b'"source_url":"https://maps.google.com/photo"', response.body)

    def test_cap_rejects_before_photo_media_call(self):
        photo = {"name": "photo", "googleMapsUri": "https://maps.google.com/photo"}
        media = AsyncMock()
        with patch.object(cafes.GooglePlacesService, "get_first_photo", new=AsyncMock(return_value=photo)), patch.object(
            cafes.GooglePlacesService, "get_photo_uri", new=media
        ):
            response = asyncio.run(call_endpoint(Database(
                {"id": "cafe-1", "google_place_id": "place-1"}, reserved=0
            )))
        self.assertEqual(response.status_code, 429)
        media.assert_not_awaited()

    def test_photo_without_source_url_is_not_displayed(self):
        media = AsyncMock()
        with patch.object(
            cafes.GooglePlacesService,
            "get_first_photo",
            new=AsyncMock(return_value={"name": "photo"}),
        ), patch.object(cafes.GooglePlacesService, "get_photo_uri", new=media):
            response = asyncio.run(call_endpoint(Database(
                {"id": "cafe-1", "google_place_id": "place-1"}
            )))
        self.assertEqual(response.status_code, 204)
        media.assert_not_awaited()

    def test_google_failure_is_quiet_502_without_refunding_slot(self):
        photo = {"name": "photo", "googleMapsUri": "https://maps.google.com/photo"}
        with patch.object(
            cafes.GooglePlacesService, "get_first_photo", new=AsyncMock(return_value=photo)
        ), patch.object(
            cafes.GooglePlacesService, "get_photo_uri", new=AsyncMock(side_effect=ValueError("bad response"))
        ):
            response = asyncio.run(call_endpoint(Database(
                {"id": "cafe-1", "google_place_id": "place-1"}, reserved=1
            )))
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.headers["cache-control"], "no-store")

    def test_pacific_month_changes_at_local_midnight(self):
        self.assertEqual(
            cafes._google_billing_month(datetime(2026, 9, 1, 6, 59, tzinfo=timezone.utc)),
            "2026-08-01",
        )
        self.assertEqual(
            cafes._google_billing_month(datetime(2026, 9, 1, 7, 0, tzinfo=timezone.utc)),
            "2026-09-01",
        )


if __name__ == "__main__":
    import unittest

    unittest.main()
