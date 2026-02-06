"""
Collections API endpoints for cafe collections feature.

Allows users to:
- Create and manage collections (Favourites, Save for Later, Custom)
- Add/remove cafes from collections
- Share collections via unique tokens
- Quick save cafes to default collections
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from supabase import Client
from typing import Optional, List
from datetime import datetime, timezone
import secrets
import logging

from app.database.supabase import get_supabase_client
from app.api.deps import get_current_user, security
from app.models.collection import (
    CollectionIconType,
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
    CollectionItemCreate,
    CollectionItemUpdate,
    CollectionItemResponse,
    CollectionDetailResponse,
    CafeSaveStatus,
    QuickSaveRequest,
    ShareTokenResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# =========================================================
# Helper Functions
# =========================================================

async def get_or_create_default_collection(
    user_id: str,
    icon_type: CollectionIconType,
    supabase: Client
) -> dict:
    """Get or create a default collection (Favourite or Save for Later)."""
    
    # Check if collection exists
    result = supabase.table("cafe_collections").select("*").eq(
        "user_id", user_id
    ).eq("icon_type", icon_type.value).execute()
    
    if result.data and len(result.data) > 0:
        return result.data[0]
    
    # Create default collection
    name = "Favourites" if icon_type == CollectionIconType.FAVOURITE else "Save for Later"
    position = 0 if icon_type == CollectionIconType.FAVOURITE else 1
    
    new_collection = {
        "user_id": user_id,
        "name": name,
        "icon_type": icon_type.value,
        "is_public": False,
        "position": position,
    }
    
    insert_result = supabase.table("cafe_collections").insert(new_collection).execute()
    
    if not insert_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create default collection"
        )
    
    return insert_result.data[0]


def generate_share_token() -> str:
    """Generate a unique share token."""
    return secrets.token_urlsafe(24)[:32]


async def get_collection_with_items(collection_id: str, supabase: Client) -> dict:
    """Get collection with all its items and cafe details."""
    
    # Get collection
    collection_result = supabase.table("cafe_collections").select("*").eq(
        "id", collection_id
    ).execute()
    
    if not collection_result.data:
        return None
    
    collection = collection_result.data[0]
    
    # Get items with cafe info
    items_result = supabase.table("collection_items").select(
        "id, collection_id, cafe_id, note, added_at"
    ).eq("collection_id", collection_id).order("added_at", desc=True).execute()
    
    items = []
    if items_result.data:
        # Get cafe details for each item
        cafe_ids = [item["cafe_id"] for item in items_result.data]
        cafes_result = supabase.table("cafes").select(
            "id, name, address, main_image, latitude, longitude"
        ).in_("id", cafe_ids).execute()
        
        cafe_map = {cafe["id"]: cafe for cafe in (cafes_result.data or [])}
        
        for item in items_result.data:
            cafe = cafe_map.get(item["cafe_id"], {})
            items.append({
                "id": item["id"],
                "collection_id": item["collection_id"],
                "cafe_id": item["cafe_id"],
                "cafe_name": cafe.get("name", "Unknown"),
                "cafe_address": cafe.get("address"),
                "cafe_main_image": cafe.get("main_image"),
                "cafe_latitude": cafe.get("latitude"),
                "cafe_longitude": cafe.get("longitude"),
                "note": item.get("note"),
                "added_at": item["added_at"],
            })
    
    collection["items"] = items
    collection["item_count"] = len(items)
    
    return collection


# =========================================================
# Collection CRUD Endpoints
# =========================================================

@router.get("/collections", response_model=List[CollectionResponse])
async def get_my_collections(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get all collections for the current user.
    
    Returns collections ordered by position, with Favourites and Save for Later first.
    """
    user_id = current_user.id
    
    # Get all collections
    result = supabase.table("cafe_collections").select("*").eq(
        "user_id", user_id
    ).order("position").order("created_at").execute()
    
    collections = result.data or []
    
    # Get item counts for each collection
    for collection in collections:
        count_result = supabase.table("collection_items").select(
            "id", count="exact"
        ).eq("collection_id", collection["id"]).execute()
        collection["item_count"] = count_result.count or 0
        
        # Get preview cafes (first 3)
        preview_result = supabase.table("collection_items").select(
            "cafe_id"
        ).eq("collection_id", collection["id"]).limit(3).execute()
        
        if preview_result.data:
            cafe_ids = [item["cafe_id"] for item in preview_result.data]
            cafes = supabase.table("cafes").select(
                "id, name, main_image"
            ).in_("id", cafe_ids).execute()
            collection["preview_cafes"] = cafes.data or []
        else:
            collection["preview_cafes"] = []
    
    return collections


@router.post("/collections", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    data: CollectionCreate = Body(...),
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Create a new custom collection.
    
    Note: Favourite and Save for Later collections are created automatically.
    """
    user_id = current_user.id
    
    # Prevent creating duplicate system collections
    if data.icon_type in [CollectionIconType.FAVOURITE, CollectionIconType.SAVE_LATER]:
        existing = supabase.table("cafe_collections").select("id").eq(
            "user_id", user_id
        ).eq("icon_type", data.icon_type.value).execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{data.icon_type.value} collection already exists"
            )
    
    # Get next position
    position_result = supabase.table("cafe_collections").select(
        "position"
    ).eq("user_id", user_id).order("position", desc=True).limit(1).execute()
    
    next_position = (position_result.data[0]["position"] + 1) if position_result.data else 0
    
    # Create collection
    new_collection = {
        "user_id": user_id,
        "name": data.name,
        "description": data.description,
        "icon_type": data.icon_type.value,
        "color": data.color,
        "is_public": data.is_public,
        "position": next_position,
    }
    
    result = supabase.table("cafe_collections").insert(new_collection).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create collection"
        )
    
    collection = result.data[0]
    collection["item_count"] = 0
    collection["preview_cafes"] = []
    
    return collection


@router.get("/collections/{collection_id}", response_model=CollectionDetailResponse)
async def get_collection_detail(
    collection_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get detailed collection info including all items.
    
    Only accessible by the collection owner or if collection is public.
    """
    collection = await get_collection_with_items(collection_id, supabase)
    
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Check access permission
    if collection["user_id"] != current_user.id and not collection.get("is_public"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this collection"
        )
    
    return collection


@router.patch("/collections/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    data: CollectionUpdate = Body(...),
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Update a collection's name, description, or visibility.
    """
    user_id = current_user.id
    
    # Check ownership
    existing = supabase.table("cafe_collections").select("*").eq(
        "id", collection_id
    ).eq("user_id", user_id).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found or you don't have permission"
        )
    
    # Prevent changing icon_type of system collections
    collection = existing.data[0]
    if collection["icon_type"] in ["favourite", "save_later"]:
        if data.icon_type and data.icon_type.value != collection["icon_type"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change type of system collections"
            )
    
    # Build update data
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name
    if data.description is not None:
        update_data["description"] = data.description
    if data.color is not None:
        update_data["color"] = data.color
    if data.is_public is not None:
        update_data["is_public"] = data.is_public
    if data.icon_type is not None:
        update_data["icon_type"] = data.icon_type.value
    
    if not update_data:
        return collection
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = supabase.table("cafe_collections").update(update_data).eq(
        "id", collection_id
    ).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update collection"
        )
    
    updated = result.data[0]
    
    # Add item count
    count_result = supabase.table("collection_items").select(
        "id", count="exact"
    ).eq("collection_id", collection_id).execute()
    updated["item_count"] = count_result.count or 0
    updated["preview_cafes"] = []
    
    return updated


@router.delete("/collections/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Delete a collection and all its items.
    
    Note: System collections (Favourites, Save for Later) cannot be deleted.
    """
    user_id = current_user.id
    
    # Check ownership and type
    existing = supabase.table("cafe_collections").select("*").eq(
        "id", collection_id
    ).eq("user_id", user_id).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found or you don't have permission"
        )
    
    collection = existing.data[0]
    
    # Prevent deleting system collections
    if collection["icon_type"] in ["favourite", "save_later"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system collections (Favourites, Save for Later)"
        )
    
    # Delete collection (items will be cascade deleted)
    supabase.table("cafe_collections").delete().eq("id", collection_id).execute()
    
    return None


# =========================================================
# Collection Items Endpoints
# =========================================================

@router.post("/collections/{collection_id}/items", response_model=CollectionItemResponse, status_code=status.HTTP_201_CREATED)
async def add_cafe_to_collection(
    collection_id: str,
    data: CollectionItemCreate = Body(...),
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Add a cafe to a collection.
    """
    user_id = current_user.id
    
    # Check collection ownership
    collection = supabase.table("cafe_collections").select("*").eq(
        "id", collection_id
    ).eq("user_id", user_id).execute()
    
    if not collection.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found or you don't have permission"
        )
    
    # Check if cafe exists
    cafe = supabase.table("cafes").select("id, name, address, main_image").eq(
        "id", data.cafe_id
    ).execute()
    
    if not cafe.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cafe not found"
        )
    
    # Check if already added
    existing = supabase.table("collection_items").select("id").eq(
        "collection_id", collection_id
    ).eq("cafe_id", data.cafe_id).execute()
    
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cafe already in this collection"
        )
    
    # Add to collection
    new_item = {
        "collection_id": collection_id,
        "cafe_id": data.cafe_id,
        "note": data.note,
    }
    
    result = supabase.table("collection_items").insert(new_item).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add cafe to collection"
        )
    
    item = result.data[0]
    cafe_data = cafe.data[0]
    
    return {
        "id": item["id"],
        "collection_id": item["collection_id"],
        "cafe_id": item["cafe_id"],
        "cafe_name": cafe_data["name"],
        "cafe_address": cafe_data.get("address"),
        "cafe_main_image": cafe_data.get("main_image"),
        "note": item.get("note"),
        "added_at": item["added_at"],
    }


@router.delete("/collections/{collection_id}/items/{cafe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_cafe_from_collection(
    collection_id: str,
    cafe_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Remove a cafe from a collection.
    """
    user_id = current_user.id
    
    # Check collection ownership
    collection = supabase.table("cafe_collections").select("id").eq(
        "id", collection_id
    ).eq("user_id", user_id).execute()
    
    if not collection.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found or you don't have permission"
        )
    
    # Delete item
    result = supabase.table("collection_items").delete().eq(
        "collection_id", collection_id
    ).eq("cafe_id", cafe_id).execute()
    
    return None


# =========================================================
# Sharing Endpoints
# =========================================================

@router.post("/collections/{collection_id}/share", response_model=ShareTokenResponse)
async def generate_share_link(
    collection_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Generate a share token for a collection.
    
    If a token already exists, returns the existing one.
    """
    user_id = current_user.id
    
    # Check ownership
    collection = supabase.table("cafe_collections").select("*").eq(
        "id", collection_id
    ).eq("user_id", user_id).execute()
    
    if not collection.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found or you don't have permission"
        )
    
    existing_token = collection.data[0].get("share_token")
    
    if existing_token:
        return {
            "share_token": existing_token,
            "share_url": f"/shared/{existing_token}"
        }
    
    # Generate new token
    new_token = generate_share_token()
    
    result = supabase.table("cafe_collections").update({
        "share_token": new_token,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", collection_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate share link"
        )
    
    return {
        "share_token": new_token,
        "share_url": f"/shared/{new_token}"
    }


@router.get("/collections/shared/{token}", response_model=CollectionDetailResponse)
async def get_shared_collection(
    token: str,
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get a collection by its share token (public endpoint).
    
    Anyone with the token can view the collection.
    """
    # Find collection by token
    result = supabase.table("cafe_collections").select("*").eq(
        "share_token", token
    ).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared collection not found"
        )
    
    collection = await get_collection_with_items(result.data[0]["id"], supabase)
    
    return collection


# =========================================================
# Quick Save Endpoints (for cafe detail page)
# =========================================================

@router.get("/cafes/{cafe_id}/save-status", response_model=CafeSaveStatus)
async def get_cafe_save_status(
    cafe_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get the save status of a cafe for the current user.
    
    Returns whether the cafe is in Favourites, Save for Later, or any custom collections.
    """
    user_id = current_user.id
    
    # Get user's collections that contain this cafe
    collections = supabase.table("cafe_collections").select(
        "id, icon_type"
    ).eq("user_id", user_id).execute()
    
    if not collections.data:
        return {
            "is_favourited": False,
            "is_saved": False,
            "saved_collection_ids": []
        }
    
    collection_ids = [c["id"] for c in collections.data]
    collection_map = {c["id"]: c["icon_type"] for c in collections.data}
    
    # Check which collections contain this cafe
    items = supabase.table("collection_items").select(
        "collection_id"
    ).eq("cafe_id", cafe_id).in_("collection_id", collection_ids).execute()
    
    saved_ids = [item["collection_id"] for item in (items.data or [])]
    
    is_favourited = any(
        collection_map.get(cid) == "favourite" 
        for cid in saved_ids
    )
    is_saved = any(
        collection_map.get(cid) == "save_later" 
        for cid in saved_ids
    )
    
    return {
        "is_favourited": is_favourited,
        "is_saved": is_saved,
        "saved_collection_ids": saved_ids
    }


@router.post("/cafes/{cafe_id}/quick-save", status_code=status.HTTP_200_OK)
async def quick_save_cafe(
    cafe_id: str,
    data: QuickSaveRequest = Body(...),
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Quick save/unsave a cafe to Favourites or Save for Later.
    
    Toggles the save state - if already saved, removes it.
    """
    user_id = current_user.id
    
    # Determine icon type
    icon_type = (
        CollectionIconType.FAVOURITE 
        if data.save_type == "favourite" 
        else CollectionIconType.SAVE_LATER
    )
    
    # Get or create the default collection
    collection = await get_or_create_default_collection(user_id, icon_type, supabase)
    collection_id = collection["id"]
    
    # Check if cafe exists
    cafe = supabase.table("cafes").select("id").eq("id", cafe_id).execute()
    if not cafe.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cafe not found"
        )
    
    # Check if already saved
    existing = supabase.table("collection_items").select("id").eq(
        "collection_id", collection_id
    ).eq("cafe_id", cafe_id).execute()
    
    if existing.data:
        # Remove from collection (toggle off)
        supabase.table("collection_items").delete().eq(
            "id", existing.data[0]["id"]
        ).execute()
        
        return {"action": "removed", "collection_id": collection_id}
    else:
        # Add to collection
        supabase.table("collection_items").insert({
            "collection_id": collection_id,
            "cafe_id": cafe_id
        }).execute()
        
        return {"action": "added", "collection_id": collection_id}
