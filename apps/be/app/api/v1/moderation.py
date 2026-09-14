"""Admin-only deletion history and account moderation. No public list endpoint."""
from datetime import datetime, timezone
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from app.api.deps import require_admin_role
from app.database.supabase import get_supabase_client

router = APIRouter(prefix="/admin/blacklists", dependencies=[Depends(require_admin_role)])


class UserDecision(BaseModel):
    status: Literal["watch", "blocked"]
    reason: str = Field(min_length=1, max_length=500)


@router.get("/cafes")
def cafes(page: int = Query(1, ge=1), db=Depends(get_supabase_client)):
    return db.table("cafe_blacklist").select("*").order("deleted_at", desc=True).range((page-1)*50, page*50-1).execute().data or []


@router.delete("/cafes/{entry_id}", status_code=204)
def remove_cafe(entry_id: UUID, db=Depends(get_supabase_client)):
    db.table("cafe_blacklist").delete().eq("id", str(entry_id)).execute()


@router.get("/users")
def users(page: int = Query(1, ge=1), db=Depends(get_supabase_client)):
    return db.table("user_blacklist").select("*").order("updated_at", desc=True).range((page-1)*50, page*50-1).execute().data or []


@router.put("/users/{user_id}")
def set_user(user_id: UUID, decision: UserDecision, db=Depends(get_supabase_client)):
    profile = db.table("users").select("id, role").eq("id", str(user_id)).limit(1).execute().data
    if not profile:
        raise HTTPException(404, "User not found")
    if profile[0].get("role") == "admin":
        raise HTTPException(400, "Admin accounts cannot be blacklisted")
    reason = decision.reason.strip()
    if not reason:
        raise HTTPException(422, "Reason is required")
    return db.table("user_blacklist").upsert({
        "user_id": str(user_id), "status": decision.status, "reason": reason,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).execute().data


@router.delete("/users/{user_id}", status_code=204)
def remove_user(user_id: UUID, db=Depends(get_supabase_client)):
    db.table("user_blacklist").delete().eq("user_id", str(user_id)).execute()
