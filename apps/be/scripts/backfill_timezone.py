"""
One-time backfill script: populate timezone for existing cafes that have no timezone set.
Run after deploying 008_add_cafe_timezone.sql migration.

Usage:
    cd apps/be
    python scripts/backfill_timezone.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client
from app.utils.timezone import get_timezone_from_coords

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def backfill():
    result = supabase.table("cafes").select("id, latitude, longitude").is_("timezone", "null").execute()
    cafes = result.data or []
    print(f"Found {len(cafes)} cafes without timezone.")

    updated = 0
    skipped = 0
    for cafe in cafes:
        tz = get_timezone_from_coords(float(cafe["latitude"]), float(cafe["longitude"]))
        if tz:
            supabase.table("cafes").update({"timezone": tz}).eq("id", cafe["id"]).execute()
            updated += 1
        else:
            print(f"  No timezone found for cafe {cafe['id']} ({cafe['latitude']}, {cafe['longitude']})")
            skipped += 1

    print(f"Done. Updated: {updated}, Skipped: {skipped}")


if __name__ == "__main__":
    backfill()
