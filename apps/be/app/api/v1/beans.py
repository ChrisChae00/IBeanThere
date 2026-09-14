"""
The roaster and bean catalogue.

Shared, but not authoritative. Search offers **candidates**; the person picks one or
says none of these. Nothing here decides that two names are the same thing:

- Two roasters may share a name in different cities. `city` is what tells them apart
  on screen; the database has no unique index to collapse them.
- One bean name can mean a different lot next season. A new row is cheaper to merge
  later than a wrong merge is to unpick.

So `POST` always inserts. The frontend is responsible for showing the existing
candidates first -- that is where duplicates are actually prevented, by a person
recognising the roaster they meant.

`created_by` is stored (it is useful for cleaning up later) and never returned.
Somebody adding a bean while writing a private log must not become visible through it.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from pydantic import BaseModel, Field
from supabase import Client
import logging

from app.api.deps import get_current_user
from app.database.supabase import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter()


class RoasterResponse(BaseModel):
    id: str
    name: str
    city: Optional[str] = None
    website: Optional[str] = None


class RoasterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    city: Optional[str] = Field(None, max_length=120)
    website: Optional[str] = Field(None, max_length=500)


class BeanResponse(BaseModel):
    id: str
    name: str
    roaster_id: str
    roaster_name: Optional[str] = None
    origin: Optional[str] = None
    process: Optional[str] = None
    roast_level: Optional[str] = None


class BeanCreate(BaseModel):
    roaster_id: str
    name: str = Field(..., min_length=1, max_length=200)
    origin: Optional[str] = Field(None, max_length=200)
    process: Optional[str] = Field(None, max_length=100)
    roast_level: Optional[str] = Field(None, max_length=50)


def _roaster_name(row: dict) -> Optional[str]:
    roaster = row.get("roasters")
    if isinstance(roaster, list):
        roaster = roaster[0] if roaster else None
    return roaster.get("name") if roaster else None


@router.get("/roasters", response_model=List[RoasterResponse])
async def search_roasters(
    q: str = Query("", max_length=200, description="Name fragment to search for"),
    supabase: Client = Depends(get_supabase_client),
):
    """Roasters whose name contains `q`. Candidates to choose from, not a match."""
    try:
        query = supabase.table("roasters").select("id, name, city, website")
        if q.strip():
            # `%` and `_` are wildcards in LIKE; a roaster named "100%" would
            # otherwise search for something the reader did not type.
            escaped = q.strip().replace("%", r"\%").replace("_", r"\_")
            query = query.ilike("name", f"%{escaped}%")
        result = query.order("name").limit(10).execute()
        return [RoasterResponse(**row) for row in (result.data or [])]
    except Exception:
        logger.exception("Error searching roasters")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        )


@router.post("/roasters", response_model=RoasterResponse, status_code=status.HTTP_201_CREATED)
async def create_roaster(
    payload: RoasterCreate,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Add a roaster to the shared catalogue. Always inserts -- see the module note."""
    try:
        result = supabase.table("roasters").insert({
            "name": payload.name.strip(),
            "city": payload.city.strip() if payload.city else None,
            "website": payload.website,
            "created_by": current_user.id,
        }).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create roaster",
            )
        return RoasterResponse(**result.data[0])
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error creating roaster")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        )


@router.get("/roasters/{roaster_id}/beans", response_model=List[BeanResponse])
async def list_roaster_beans(
    roaster_id: str,
    q: str = Query("", max_length=200),
    supabase: Client = Depends(get_supabase_client),
):
    """The beans already recorded for one roaster."""
    try:
        query = supabase.table("beans").select(
            "id, name, roaster_id, origin, process, roast_level, roasters(name)"
        ).eq("roaster_id", roaster_id)
        if q.strip():
            escaped = q.strip().replace("%", r"\%").replace("_", r"\_")
            query = query.ilike("name", f"%{escaped}%")
        result = query.order("name").limit(25).execute()

        return [
            BeanResponse(**{**row, "roaster_name": _roaster_name(row)})
            for row in (result.data or [])
        ]
    except Exception:
        logger.exception("Error listing beans for roaster")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        )


@router.post("/beans", response_model=BeanResponse, status_code=status.HTTP_201_CREATED)
async def create_bean(
    payload: BeanCreate,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Add a bean under a roaster that already exists."""
    try:
        roaster = supabase.table("roasters").select("id, name").eq(
            "id", payload.roaster_id
        ).single().execute()
        if not roaster.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roaster not found",
            )

        result = supabase.table("beans").insert({
            "roaster_id": payload.roaster_id,
            "name": payload.name.strip(),
            "origin": payload.origin,
            "process": payload.process,
            "roast_level": payload.roast_level,
            "created_by": current_user.id,
        }).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create bean",
            )
        return BeanResponse(**{**result.data[0], "roaster_name": roaster.data.get("name")})
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error creating bean")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        )
