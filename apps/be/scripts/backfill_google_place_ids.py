"""Backfill Google Place IDs for cafes without any image. Dry-run by default."""

import argparse
import asyncio
import os
import sys
from collections import Counter
from pathlib import Path

import httpx

BE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BE_DIR))

from app.database.supabase import get_supabase_client  # noqa: E402
from app.services.cafe_dedupe import calculate_earth_distance  # noqa: E402
from app.services.google_places_service import GooglePlacesService  # noqa: E402

MAX_DISTANCE_METERS = 100


def candidate_rejection(place_id: str, distance: float, used_ids: set[str]):
    if place_id in used_ids:
        return "duplicate"
    if distance > MAX_DISTANCE_METERS:
        return "over_100m"
    return None


async def backfill(limit: int, apply: bool) -> Counter:
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        raise SystemExit("GOOGLE_PLACES_API_KEY is required")

    db = get_supabase_client()
    rows = db.table("cafes").select("*").is_("google_place_id", "null").is_(
        "main_image", "null"
    ).is_("image", "null").limit(limit).execute().data or []
    cafe_ids = [row["id"] for row in rows]
    if cafe_ids:
        visits = db.table("cafe_visits").select("cafe_id,photo_urls").in_("cafe_id", cafe_ids).eq(
            "is_public", True
        ).not_.is_("photo_urls", "null").execute().data or []
        photographed = {row["cafe_id"] for row in visits if row.get("photo_urls")}
        rows = [row for row in rows if row["id"] not in photographed and row["id"] in cafe_ids]

    existing = db.table("cafes").select("google_place_id").not_.is_("google_place_id", "null").execute().data or []
    used_ids = {row["google_place_id"] for row in existing}
    service = GooglePlacesService(api_key)
    counts = Counter(scanned=len(rows))

    for cafe in rows:
        try:
            candidate = await service.find_place_id_for_cafe(
                cafe.get("name") or "",
                cafe.get("address") or "",
                float(cafe["latitude"]),
                float(cafe["longitude"]),
            )
            if not candidate:
                counts["no_result"] += 1
                continue
            place_id = candidate.get("id")
            location = candidate.get("location") or {}
            distance = calculate_earth_distance(
                float(cafe["latitude"]), float(cafe["longitude"]),
                float(location["latitude"]), float(location["longitude"]),
            )
            rejection = candidate_rejection(place_id, distance, used_ids)
            if rejection:
                counts[rejection] += 1
                continue
            counts["matched"] += 1
            used_ids.add(place_id)
            print({
                "cafe_id": cafe["id"],
                "name": cafe.get("name"),
                "google_place_id": place_id,
                "distance_m": round(distance, 1),
                "action": "update" if apply else "dry-run",
            })
            if apply:
                db.table("cafes").update({"google_place_id": place_id}).eq("id", cafe["id"]).execute()
                counts["updated"] += 1
        except (httpx.HTTPError, KeyError, TypeError, ValueError):
            counts["api_failure"] += 1

    return counts


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", required=True, type=int)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if args.limit < 1:
        parser.error("--limit must be at least 1")
    counts = asyncio.run(backfill(args.limit, args.apply))
    print({"mode": "apply" if args.apply else "dry-run", **counts})


if __name__ == "__main__":
    main()
