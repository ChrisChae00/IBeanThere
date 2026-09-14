"""Resumable account removal. Storage uses its API; Auth owns the database cascade."""
from collections import defaultdict
from supabase import Client


def delete_account(supabase: Client, user_id: str) -> None:
    # Persist intent before removing files. RLS/API guards stop new writes on retry.
    supabase.table("account_deletion_requests").upsert(
        {"user_id": user_id}, on_conflict="user_id", ignore_duplicates=True
    ).execute()
    previous = None
    while True:
        files = supabase.rpc("account_deletion_files", {"target": user_id}).execute().data
        if not isinstance(files, list):
            raise RuntimeError("Account file inventory unavailable")
        if not files:
            break
        if files == previous:
            raise RuntimeError("Storage deletion made no progress")
        previous = files
        buckets = defaultdict(list)
        for file in files:
            buckets[file["bucket_id"]].append(file["name"])
        for bucket, paths in buckets.items():
            supabase.storage.from_(bucket).remove(paths)
    # Never delete public.users separately: Auth and its child rows delete atomically.
    supabase.auth.admin.delete_user(user_id)
