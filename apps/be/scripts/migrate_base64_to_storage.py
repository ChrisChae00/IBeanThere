"""
One-time migration script: base64 images → Supabase Storage

Migrates existing base64 data URLs stored in:
  - cafes.main_image
  - cafe_visits.photo_urls

to Supabase Storage (cafe-images bucket) and replaces with public URLs.

Prerequisites:
  1. Create 'cafe-images' public bucket in Supabase Dashboard
  2. Run create_cafe_images_bucket.sql for RLS policies
  3. Set environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY

Usage:
  cd apps/be
  python -m scripts.migrate_base64_to_storage

  Or with explicit env vars:
  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx python -m scripts.migrate_base64_to_storage

  Dry run (no changes):
  python -m scripts.migrate_base64_to_storage --dry-run
"""

import base64
import os
import sys
import uuid
import time
import argparse

from supabase import create_client, Client

BUCKET = "cafe-images"
MIGRATION_FOLDER = "migrated"


def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        # Fallback: try loading from app config
        try:
            from app.config import settings
            url = settings.supabase_url
            key = settings.supabase_service_key
        except Exception:
            print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")
            sys.exit(1)

    return create_client(url, key)


def is_base64_data_url(value: str) -> bool:
    """Check if a string is a base64 data URL (not an http URL)."""
    if not value:
        return False
    return value.startswith("data:image/")


def parse_data_url(data_url: str) -> tuple[str, bytes]:
    """Parse a data URL into (content_type, raw_bytes)."""
    # Format: data:image/jpeg;base64,/9j/4AAQ...
    header, encoded = data_url.split(",", 1)
    content_type = header.split(":")[1].split(";")[0]
    raw_bytes = base64.b64decode(encoded)
    return content_type, raw_bytes


def content_type_to_ext(content_type: str) -> str:
    mapping = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
    }
    return mapping.get(content_type, "jpg")


def upload_base64_to_storage(
    supabase: Client,
    data_url: str,
    folder: str,
) -> str:
    """Upload a base64 data URL to Supabase Storage. Returns public URL."""
    content_type, raw_bytes = parse_data_url(data_url)
    ext = content_type_to_ext(content_type)
    filename = f"{int(time.time())}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = f"{folder}/{filename}"

    result = supabase.storage.from_(BUCKET).upload(
        file_path,
        raw_bytes,
        file_options={"content-type": content_type, "cache-control": "3600"},
    )

    if hasattr(result, "error") and result.error:
        raise RuntimeError(f"Upload failed: {result.error}")

    url_data = supabase.storage.from_(BUCKET).get_public_url(file_path)
    return url_data


def migrate_cafes(supabase: Client, dry_run: bool = False) -> dict:
    """Migrate cafes.main_image from base64 to Storage URLs."""
    stats = {"found": 0, "migrated": 0, "skipped": 0, "errors": 0}

    # Fetch all cafes with non-null main_image
    result = supabase.table("cafes").select("id, main_image, navigator_id").not_.is_("main_image", "null").execute()
    cafes = result.data or []

    for cafe in cafes:
        main_image = cafe.get("main_image", "")
        if not is_base64_data_url(main_image):
            stats["skipped"] += 1
            continue

        stats["found"] += 1
        cafe_id = cafe["id"]
        owner_id = cafe.get("navigator_id", "unknown")
        folder = f"{MIGRATION_FOLDER}/{owner_id}"

        print(f"  Cafe {cafe_id}: base64 image found ({len(main_image)} chars)")

        if dry_run:
            stats["migrated"] += 1
            continue

        try:
            public_url = upload_base64_to_storage(supabase, main_image, folder)
            supabase.table("cafes").update({"main_image": public_url}).eq("id", cafe_id).execute()
            stats["migrated"] += 1
            print(f"    → Migrated to: {public_url[:80]}...")
        except Exception as e:
            stats["errors"] += 1
            print(f"    → ERROR: {e}")

    return stats


def migrate_visits(supabase: Client, dry_run: bool = False) -> dict:
    """Migrate cafe_visits.photo_urls from base64 to Storage URLs."""
    stats = {"found": 0, "migrated": 0, "skipped": 0, "errors": 0}

    # Fetch all visits with non-null photo_urls
    result = supabase.table("cafe_visits").select("id, user_id, photo_urls").not_.is_("photo_urls", "null").execute()
    visits = result.data or []

    for visit in visits:
        photo_urls = visit.get("photo_urls", [])
        if not photo_urls or not isinstance(photo_urls, list):
            stats["skipped"] += 1
            continue

        # Check if any photos are base64
        base64_indices = [i for i, url in enumerate(photo_urls) if is_base64_data_url(url)]
        if not base64_indices:
            stats["skipped"] += 1
            continue

        stats["found"] += 1
        visit_id = visit["id"]
        user_id = visit.get("user_id", "unknown")
        folder = f"{MIGRATION_FOLDER}/{user_id}"

        print(f"  Visit {visit_id}: {len(base64_indices)} base64 photo(s) found")

        if dry_run:
            stats["migrated"] += 1
            continue

        try:
            new_urls = list(photo_urls)  # copy
            for i in base64_indices:
                public_url = upload_base64_to_storage(supabase, photo_urls[i], folder)
                new_urls[i] = public_url
                print(f"    → Photo {i+1} migrated")

            supabase.table("cafe_visits").update({"photo_urls": new_urls}).eq("id", visit_id).execute()
            stats["migrated"] += 1
        except Exception as e:
            stats["errors"] += 1
            print(f"    → ERROR: {e}")

    return stats


def main():
    parser = argparse.ArgumentParser(description="Migrate base64 images to Supabase Storage")
    parser.add_argument("--dry-run", action="store_true", help="Preview without making changes")
    args = parser.parse_args()

    if args.dry_run:
        print("=== DRY RUN MODE (no changes will be made) ===\n")

    supabase = get_supabase_client()

    # Verify bucket exists
    try:
        supabase.storage.from_(BUCKET).list(MIGRATION_FOLDER, {"limit": 1})
    except Exception:
        print(f"ERROR: Bucket '{BUCKET}' not found. Create it in Supabase Dashboard first.")
        sys.exit(1)

    print("--- Migrating cafes.main_image ---")
    cafe_stats = migrate_cafes(supabase, dry_run=args.dry_run)
    print(f"  Result: {cafe_stats}\n")

    print("--- Migrating cafe_visits.photo_urls ---")
    visit_stats = migrate_visits(supabase, dry_run=args.dry_run)
    print(f"  Result: {visit_stats}\n")

    total_errors = cafe_stats["errors"] + visit_stats["errors"]
    if total_errors > 0:
        print(f"WARNING: {total_errors} error(s) occurred. Review output above.")
    else:
        print("Migration complete!")


if __name__ == "__main__":
    main()
