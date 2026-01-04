from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from supabase import Client
from app.api.deps import get_supabase_client, get_current_user
from app.models.social import (
    VisitLikeResponse,
    BadgeResponse,
    BadgeInfo,
    BADGE_DEFINITIONS,
    CommunityFeedItem,
    CommunityFeedResponse,
    TrustedUserResponse
)

router = APIRouter(prefix="/community", tags=["community"])


# =========================================================
# Visit Likes API
# =========================================================

@router.post("/visits/{visit_id}/like", status_code=status.HTTP_201_CREATED)
async def like_visit(
    visit_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Like a visit log (mark as helpful).
    - Cannot like your own visit
    - Cannot like the same visit twice
    """
    try:
        # Check if visit exists and get owner
        visit = supabase.table("cafe_visits").select("id, user_id").eq("id", visit_id).single().execute()
        if not visit.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visit not found"
            )
        
        # Cannot like your own visit
        if visit.data["user_id"] == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot like your own visit"
            )
        
        # Check if already liked
        existing = supabase.table("visit_likes").select("id").eq("user_id", current_user.id).eq("visit_id", visit_id).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already liked this visit"
            )
        
        # Create like
        supabase.table("visit_likes").insert({
            "user_id": current_user.id,
            "visit_id": visit_id
        }).execute()
        
        return {"message": "Visit liked", "visit_id": visit_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to like visit"
        ) from e


@router.delete("/visits/{visit_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_visit(
    visit_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Remove like from a visit log.
    """
    try:
        result = supabase.table("visit_likes").delete().eq("user_id", current_user.id).eq("visit_id", visit_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Like not found"
            )
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unlike visit"
        ) from e


@router.get("/visits/{visit_id}/likes", response_model=dict)
async def get_visit_likes(
    visit_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get like count and whether current user liked the visit.
    """
    try:
        # Get like count
        count_result = supabase.table("visit_likes").select("id", count="exact").eq("visit_id", visit_id).execute()
        like_count = count_result.count if count_result.count is not None else 0
        
        # Check if current user liked
        user_liked = supabase.table("visit_likes").select("id").eq("user_id", current_user.id).eq("visit_id", visit_id).execute()
        is_liked = len(user_liked.data) > 0 if user_liked.data else False
        
        return {
            "visit_id": visit_id,
            "like_count": like_count,
            "is_liked_by_me": is_liked
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get like info"
        ) from e


# =========================================================
# Badges API
# =========================================================

@router.get("/badges", response_model=List[BadgeInfo])
async def get_all_badges():
    """
    Get all available badge definitions.
    """
    return list(BADGE_DEFINITIONS.values())


@router.get("/users/{username}/badges", response_model=List[BadgeResponse])
async def get_user_badges(
    username: str,
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get badges earned by a user.
    """
    try:
        # Get user ID by username
        user = supabase.table("users").select("id").eq("username", username).limit(1).execute()
        if not user.data:
            # User not found in public table
            return []
        
        user_id = user.data[0]["id"]
        
        # Get badges
        badges = supabase.table("user_badges").select("badge_code, awarded_at").eq("user_id", user_id).execute()
        
        return [BadgeResponse(**b) for b in badges.data] if badges.data else []
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"User badges error: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user badges"
        ) from e


@router.post("/badges/check", status_code=status.HTTP_200_OK)
async def check_and_award_badges(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Check badge eligibility and award new badges.
    Called after relevant actions (log created, trusted, etc.)
    Returns list of newly awarded badges.
    """
    try:
        newly_awarded = []
        user_id = current_user.id
        
        # Get existing badges
        existing = supabase.table("user_badges").select("badge_code").eq("user_id", user_id).execute()
        existing_codes = [b["badge_code"] for b in existing.data] if existing.data else []
        
        # 1. Bean Sprout: First log recorded
        if "bean_sprout" not in existing_codes:
            log_count = supabase.table("cafe_visits").select("id", count="exact").eq("user_id", user_id).execute()
            if log_count.count and log_count.count >= 1:
                supabase.table("user_badges").insert({
                    "user_id": user_id,
                    "badge_code": "bean_sprout"
                }).execute()
                newly_awarded.append("bean_sprout")
        
        # 2. Cafe Explorer: 5 cafe verifications (Navigator/Vanguard)
        if "cafe_explorer" not in existing_codes:
            verification_count = supabase.table("cafe_checkins").select("id", count="exact").eq("user_id", user_id).in_("founding_role", ["navigator", "vanguard", "vanguard_2nd", "vanguard_3rd"]).execute()
            if verification_count.count and verification_count.count >= 5:
                supabase.table("user_badges").insert({
                    "user_id": user_id,
                    "badge_code": "cafe_explorer"
                }).execute()
                newly_awarded.append("cafe_explorer")
        
        # 3. Coffee Connoisseur: Trusted by 10 users
        if "coffee_connoisseur" not in existing_codes:
            trust_count = supabase.table("user_trust").select("id", count="exact").eq("trustee_id", user_id).execute()
            if trust_count.count and trust_count.count >= 10:
                supabase.table("user_badges").insert({
                    "user_id": user_id,
                    "badge_code": "coffee_connoisseur"
                }).execute()
                newly_awarded.append("coffee_connoisseur")
        
        # 4. Second Home: 5 logs at same cafe on different days
        if "second_home" not in existing_codes:
            # Query visits grouped by cafe_id and count distinct days
            # Due to Supabase limitations, we'll do a simpler approach
            visits = supabase.table("cafe_visits").select("cafe_id, visited_at").eq("user_id", user_id).execute()
            if visits.data:
                from collections import defaultdict
                cafe_days = defaultdict(set)
                for v in visits.data:
                    # Extract just the date part
                    visit_date = v["visited_at"][:10] if v["visited_at"] else None
                    if visit_date:
                        cafe_days[v["cafe_id"]].add(visit_date)
                
                # Check if any cafe has 5 or more unique days
                for cafe_id, days in cafe_days.items():
                    if len(days) >= 5:
                        supabase.table("user_badges").insert({
                            "user_id": user_id,
                            "badge_code": "second_home"
                        }).execute()
                        newly_awarded.append("second_home")
                        break
        
        return {
            "newly_awarded": newly_awarded,
            "badge_details": [BADGE_DEFINITIONS[code] for code in newly_awarded]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check badges"
        ) from e


# =========================================================
# Community Feed API
# =========================================================

@router.get("/feed", response_model=CommunityFeedResponse)
async def get_community_feed(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get community feed showing logs from trusted users.
    """
    try:
        user_id = current_user.id
        
        # Get users I trust
        trusts = supabase.table("user_trust").select("trustee_id").eq("truster_id", user_id).execute()
        
        if not trusts.data:
            return CommunityFeedResponse(
                items=[],
                total_count=0,
                page=page,
                page_size=page_size,
                has_more=False
            )
        
        trustee_ids = [t["trustee_id"] for t in trusts.data]
        
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get public visits from trusted users
        visits = supabase.table("cafe_visits").select("""
            id, cafe_id, user_id, visited_at, rating, comment, photo_urls, coffee_type,
            users!inner(username, display_name, avatar_url),
            cafes!inner(name)
        """).in_("user_id", trustee_ids).eq("is_public", True).order("visited_at", desc=True).range(offset, offset + page_size - 1).execute()
        
        # Get total count
        count_result = supabase.table("cafe_visits").select("id", count="exact").in_("user_id", trustee_ids).eq("is_public", True).execute()
        total_count = count_result.count if count_result.count is not None else 0
        
        # Build response items
        items = []
        for v in visits.data if visits.data else []:
            # Safely get cafe and user data
            cafe_data = v.get("cafes") or {}
            user_data = v.get("users") or {}
            
            # Skip if essential data is missing
            if not cafe_data or not user_data:
                continue
            
            # Get like count for this visit
            like_count_result = supabase.table("visit_likes").select("id", count="exact").eq("visit_id", v["id"]).execute()
            like_count = like_count_result.count if like_count_result.count is not None else 0
            
            # Check if current user liked this
            user_like = supabase.table("visit_likes").select("id").eq("user_id", user_id).eq("visit_id", v["id"]).execute()
            is_liked = len(user_like.data) > 0 if user_like.data else False
            
            items.append(CommunityFeedItem(
                id=v["id"],
                cafe_id=v["cafe_id"],
                cafe_name=cafe_data.get("name", "Unknown Cafe"),
                user_id=v["user_id"],
                username=user_data.get("username", "unknown"),
                display_name=user_data.get("display_name") or user_data.get("username", "unknown"),
                avatar_url=user_data.get("avatar_url"),
                visited_at=v["visited_at"],
                rating=v.get("rating"),
                comment=v.get("comment"),
                photo_urls=v.get("photo_urls"),
                coffee_type=v.get("coffee_type"),
                like_count=like_count,
                is_liked_by_me=is_liked
            ))
        
        return CommunityFeedResponse(
            items=items,
            total_count=total_count,
            page=page,
            page_size=page_size,
            has_more=(offset + page_size) < total_count
        )
    except Exception as e:
        import traceback
        print(f"Feed error: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get community feed"
        ) from e


@router.get("/taste-mates", response_model=List[TrustedUserResponse])
async def get_taste_mates(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get list of my Taste Mates (users I trust).
    """
    try:
        user_id = current_user.id
        
        # Get trust relationships with user details
        trusts = supabase.table("user_trust").select("""
            trustee_id, created_at,
            users!user_trust_trustee_id_fkey(id, username, display_name, avatar_url)
        """).eq("truster_id", user_id).order("created_at", desc=True).execute()
        
        if not trusts.data:
            return []
        
        result = []
        for t in trusts.data:
            user_data = t.get("users", {})
            if user_data:
                # Get trust count for this user
                trust_count = supabase.table("user_trust").select("id", count="exact").eq("trustee_id", t["trustee_id"]).execute()
                
                result.append(TrustedUserResponse(
                    id=user_data["id"],
                    username=user_data["username"],
                    display_name=user_data.get("display_name") or user_data["username"],
                    avatar_url=user_data.get("avatar_url"),
                    trust_count=trust_count.count if trust_count.count else 0,
                    trusted_at=t["created_at"]
                ))
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get taste mates"
        ) from e
