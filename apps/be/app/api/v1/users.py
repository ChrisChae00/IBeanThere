from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Path
from typing import List
import logging
from supabase import Client
from app.models.user import UserPublicResponse, UserResponse, UserUpdate, UserProfileCreate, UserRegistrationResponse
from app.models.collection import CollectionResponse
from app.api.deps import get_supabase_client, get_current_user
from app.core.permissions import require_permission, Permission

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/profile/{display_name}", response_model=List[UserPublicResponse])
async def get_user_profiles(display_name: str = Path(..., max_length=30), supabase: Client = Depends(get_supabase_client)):
    """
    Public endpoint to get user profiles by display name. (No authentication required)
    - Returns list of users with same display_name (allows duplicates)
    - Use username for unique identification when needed

    Args:
        display_name: The display name of the users to get profiles of.
        supabase: The Supabase client.

    Returns:
        List[UserPublicResponse]: List of user profiles with the same display name.
    """
    try:
        users = supabase.table("users").select("""username, display_name, avatar_url, bio, created_at""").eq("display_name", display_name).execute()
        if not users or not users.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No users found with this display name"
            )
        # Get founding stats for each user
        response_users = []
        for user in users.data:
            # Get user ID first (needed for querying checkins)
            user_id_result = supabase.table("users").select("id").eq("username", user["username"]).single().execute()
            if user_id_result.data:
                user_id = user_id_result.data["id"]
                
                # Count Navigator roles
                nav_count = supabase.table("cafe_checkins").select("id", count="exact").eq("user_id", user_id).eq("founding_role", "navigator").execute()
                navigator_count = nav_count.count if nav_count.count is not None else 0
                
                # Count Vanguard roles
                van_count = supabase.table("cafe_checkins").select("id", count="exact").eq("user_id", user_id).in_("founding_role", ["vanguard", "vanguard_2nd", "vanguard_3rd"]).execute()
                vanguard_count = van_count.count if van_count.count is not None else 0
                
                user["founding_stats"] = {
                    "navigator_count": navigator_count,
                    "vanguard_count": vanguard_count
                }
            
            response_users.append(UserPublicResponse(**user))
            
        return response_users
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching user profiles"
        ) from e

@router.get("/profile-by-username/{username}", response_model=UserPublicResponse)
async def get_user_profile_by_username(username: str = Path(..., max_length=20), supabase: Client = Depends(get_supabase_client)):
    """
    Public endpoint to get user profile by username. (No authentication required)
    - Username is unique, so returns single user
    - Use this for unique identification

    Args:
        username: The username of the user to get the profile of.
        supabase: The Supabase client.

    Returns:
        UserPublicResponse: The user profile.
    """
    try:
        user = supabase.table("users").select("""username, display_name, avatar_url, bio, collections_public, created_at""").eq("username", username).single().execute()
        if not user or not user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        user_data = user.data
        user_id = user_data.get("id") # Although we queried by username, we need ID for stats. 
        # Wait, the query above only selects specific fields. We need to select ID too.
        
        # Re-query to get ID if not present (or just include ID in the select above)
        # Let's modify the select in the original code block instead of re-querying if possible.
        # But here I can only replace the block.
        
        # Actually, let's fix the select query in the previous lines to include ID.
        # But I can't change lines outside this block easily without a larger chunk.
        # I'll just fetch ID here if it's missing, or better, I'll update the select query in a separate chunk if needed.
        # Looking at line 55: select("""username, display_name, avatar_url, bio, created_at""")
        # It does NOT include ID. I need to include ID to query checkins.
        
        # Let's do a separate query for ID since I can't easily change the select here without overlapping.
        # Or I can just use the ID from the user table since 'username' is unique.
        user_full = supabase.table("users").select("id").eq("username", username).single().execute()
        if user_full.data:
            user_id = user_full.data["id"]
            
            # Count Navigator roles
            nav_count = supabase.table("cafe_checkins").select("id", count="exact").eq("user_id", user_id).eq("founding_role", "navigator").execute()
            navigator_count = nav_count.count if nav_count.count is not None else 0
            
            # Count Vanguard roles
            van_count = supabase.table("cafe_checkins").select("id", count="exact").eq("user_id", user_id).in_("founding_role", ["vanguard", "vanguard_2nd", "vanguard_3rd"]).execute()
            vanguard_count = van_count.count if van_count.count is not None else 0
            
            user_data["founding_stats"] = {
                "navigator_count": navigator_count,
                "vanguard_count": vanguard_count
            }
            
        return UserPublicResponse(**user_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching user profile"
        ) from e

@router.get("/{username}/collections", response_model=List[CollectionResponse])
async def get_user_public_collections(
    username: str,
    supabase: Client = Depends(get_supabase_client)
):
    """
    Public endpoint to get a user's collections if they have enabled collections_public.
    Returns empty list if collections are not public.
    """
    try:
        # Fetch user and check collections_public flag
        user = supabase.table("users").select("id, collections_public").eq("username", username).single().execute()
        if not user or not user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if not user.data.get("collections_public", False):
            return []

        user_id = user.data["id"]

        # Reuse get_my_collections pattern
        result = supabase.table("cafe_collections").select("*").eq(
            "user_id", user_id
        ).order("position").order("created_at").execute()

        collections = result.data or []

        for collection in collections:
            count_result = supabase.table("collection_items").select(
                "id", count="exact"
            ).eq("collection_id", collection["id"]).execute()
            collection["item_count"] = count_result.count or 0

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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching user collections"
        ) from e


@router.get("/check-username/{username}")
async def check_username_availability(
    username: str = Path(..., max_length=20),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Check if username is available during registration
    
    Args:
        username: The username to check for availability
        supabase: The Supabase client
        
    Returns:
        dict: Availability status and username
    """
    try:
        # Check reserved words first (including 'admin' and 'admin_account')
        reserved_words = [
            'admin', 'admin_account', 'root', 'api', 'www', 'test', 'user', 'guest', 'null', 'undefined',
            'support', 'help', 'ibeanthere', 'system', 'manager', 'official', 'operator'
        ]
        if username.lower() in reserved_words:
            return {
                "available": False,
                "username": username,
                "reason": "reserved"
            }
        
        existing_user = supabase.table("users").select("username").eq("username", username).execute()
        return {
            "available": len(existing_user.data) == 0,
            "username": username
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check username availability"
        ) from e

@router.get("/check-display-name/{display_name}")
async def check_display_name_availability(
    display_name: str,
    supabase: Client = Depends(get_supabase_client)
):
    """
    Check if display_name is available during registration
    
    Args:
        display_name: The display name to check for availability
        supabase: The Supabase client
        
    Returns:
        dict: Availability status and display_name
    """
    try:
        existing_user = supabase.table("users").select("display_name").eq("display_name", display_name).execute()
        return {
            "available": len(existing_user.data) == 0,
            "display_name": display_name
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check display name availability"
        ) from e

@router.get("/search", response_model=List[UserPublicResponse])
async def search_users(
    query: str = Query(..., min_length=3, max_length=50, description="Search query for users"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of users to return"),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Public endpoint to search for users by display name. (No authentication required)

    Args:
        query: The search query for users.
        limit: The maximum number of users to return.
        supabase: The Supabase client.

    Returns:
        List[UserPublicResponse]: The list of users.
    """
    try:
        users = supabase.table("users").select("""username, display_name, avatar_url, bio, created_at""").ilike("display_name", f"%{query}%").limit(limit).execute()
        if not users or not users.data:
            return []
        return [UserPublicResponse(**user) for user in users.data]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while searching for users"
        ) from e

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user = Depends(get_current_user),
    permission: Permission = Depends(require_permission(Permission.READ_MY_USER)),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get current authenticated user information.

    Args:
        current_user: The current authenticated user.
        permission: The permission to check.
        supabase: The Supabase client.

    Returns:
        UserResponse: The user profile.
    """
    try: 
        try:
            user = supabase.table("users").select("*").eq("id", current_user.id).single().execute()
            user_data = user.data
        except Exception:
            # Self-Healing: If user profile is missing in public.users but Auth is valid (which it is to get here),
            # recreate the profile using metadata from the Auth User (current_user).
            logger.warning("User profile missing for %s. Attempting self-healing.", current_user.id)
            
            user_meta = current_user.user_metadata or {}
            
            # Determine username
            username = user_meta.get('username') or user_meta.get('preferred_username')
            if not username:
                email_parts = current_user.email.split('@') if current_user.email else []
                username = email_parts[0] if email_parts else f"user_{current_user.id[:8]}"
            
            # Determine display name
            display_name = user_meta.get('display_name') or user_meta.get('full_name') or user_meta.get('name') or username
            
            # Determine avatar
            avatar_url = user_meta.get('avatar_url') or user_meta.get('picture')
            
            # Insert new profile
            new_profile_data = {
                "id": current_user.id,
                "email": current_user.email,
                "username": username,
                "display_name": display_name,
                "avatar_url": avatar_url,
                "role": "user"
            }
            
            try:
                # Use upsert to be safe, though insert is fine too since we know it failed fetch
                new_user = supabase.table("users").upsert(new_profile_data).select("*").single().execute()
                user_data = new_user.data
            except Exception as insert_error:
                logger.error("Self-healing failed for user %s", current_user.id, exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="User data corrupted and failed to restore."
                )

        if not user_data:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Handle cases where username might be missing (e.g. fresh Google Auth)
        username = user_data.get('username')
        if not username:
            # Fallback: Create a temporary username from email or ID
            email_parts = user_data.get('email', '').split('@')
            username = email_parts[0] if email_parts else f"user_{user_data['id'][:8]}"

        # Use username as default if display_name is not provided
        display_name = user_data.get('display_name') or username
        
        # Get founding stats
        # Count Navigator roles
        nav_count = supabase.table("cafe_checkins").select("id", count="exact").eq("user_id", current_user.id).eq("founding_role", "navigator").execute()
        navigator_count = nav_count.count if nav_count.count is not None else 0
        
        # Count Vanguard roles
        van_count = supabase.table("cafe_checkins").select("id", count="exact").eq("user_id", current_user.id).in_("founding_role", ["vanguard", "vanguard_2nd", "vanguard_3rd"]).execute()
        vanguard_count = van_count.count if van_count.count is not None else 0
        
        return UserResponse(
            id=user_data['id'],
            email=user_data['email'],
            username=username,
            display_name=display_name,
            bio=user_data.get('bio'),
            avatar_url=user_data.get('avatar_url'),
            role=user_data.get('role', 'user'),  # Get role from public.users table
            founding_stats={
                "navigator_count": navigator_count,
                "vanguard_count": vanguard_count
            },
            taste_tags=await _get_user_taste_tags(supabase, current_user.id),
            trust_count=await _get_user_trust_count(supabase, current_user.id),
            is_trusted_by_me=False,  # Can't trust yourself
            collections_public=user_data.get('collections_public', False),
            created_at=user_data['created_at'],
            updated_at=user_data.get('updated_at')
        )
    except HTTPException: 
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching user profile"
        ) from e

@router.post("/register", response_model=UserRegistrationResponse)
async def register_user_profile(
    profile: UserProfileCreate,
    current_user = Depends(require_permission(Permission.CREATE_USER_PROFILE)),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Register user profile (after Supabase Auth signup)
    - Called after frontend Supabase Auth signup
    - Extract user info from JWT token
    - Store additional profile information only

    Args:
        profile: Profile creation data (username, display_name, avatar_url, bio)
        current_user: Current user extracted from JWT
        supabase: Supabase client

    Returns:
        UserRegistrationResponse: Profile registration completion response
    """
    try:
        import os
        # 0. Restrict 'admin' username
        if profile.username.lower() == "admin":
            admin_email = os.getenv("ADMIN_EMAIL")
            if not admin_email or current_user.email != admin_email:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="The username 'admin' is reserved."
                )

        # Check if profile already exists
        existing_profile = supabase.table("users").select("*").eq("id", current_user.id).execute()
        
        # Check username uniqueness (exclude current user if updating)
        existing_username = supabase.table("users").select("id").eq("username", profile.username).execute()
        if existing_username.data:
            # If username exists and belongs to different user, raise error
            for user in existing_username.data:
                if user.get("id") != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Username already taken"
                    )
        
        # Use username as default if display_name is not provided
        display_name = profile.display_name or profile.username
        
        # If profile already exists (created by trigger), update it
        if existing_profile.data and len(existing_profile.data) > 0:
            # Update existing profile
            from datetime import datetime, timezone
            
            now = datetime.now(timezone.utc)
            update_data = {
                "username": profile.username,
                "display_name": display_name,
                "updated_at": now.isoformat()
            }
            
            # Store consent timestamps if user accepted
            if profile.terms_accepted:
                update_data["terms_accepted_at"] = now.isoformat()
            if profile.privacy_accepted:
                update_data["privacy_accepted_at"] = now.isoformat()
            if profile.consent_version:
                update_data["consent_version"] = profile.consent_version
            
            # Only update fields that are provided
            if profile.avatar_url is not None:
                update_data["avatar_url"] = profile.avatar_url
            if profile.bio is not None:
                update_data["bio"] = profile.bio
            
            updated_profile = supabase.table("users").update(update_data).eq("id", current_user.id).execute()
            
            if not updated_profile.data or len(updated_profile.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update user profile"
                )
            
            profile_data = updated_profile.data[0]
        else:
            # Create new profile (shouldn't happen if trigger works, but keep as fallback)
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            
            insert_data = {
                "id": current_user.id,
                "email": current_user.email,  # Extracted from JWT
                "username": profile.username,
                "display_name": display_name,
                "avatar_url": profile.avatar_url,
                "bio": profile.bio,
                "role": "user"  # Default role for new users
            }
            
            # Add consent timestamps if accepted
            if profile.terms_accepted:
                insert_data["terms_accepted_at"] = now.isoformat()
            if profile.privacy_accepted:
                insert_data["privacy_accepted_at"] = now.isoformat()
            if profile.consent_version:
                insert_data["consent_version"] = profile.consent_version
            
            new_profile = supabase.table("users").insert(insert_data).execute()
            
            if not new_profile.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user profile"
                )
            
            profile_data = new_profile.data[0]

        # Critical: Sync consent status to Supabase Auth metadata
        # This allows frontend useAuth to know user has consented without extra DB calls
        try:
            auth_update_data = {}
            if profile.terms_accepted:
                auth_update_data["terms_accepted"] = True
            if profile.privacy_accepted:
                auth_update_data["privacy_accepted"] = True
            
            if auth_update_data:
                supabase.auth.admin.update_user_by_id(
                    current_user.id,
                    {"user_metadata": auth_update_data}
                )
        except Exception:
            # Non-blocking error, just log it
            logger.warning("Failed to sync consent to auth metadata", exc_info=True)

        return UserRegistrationResponse(
            id=profile_data["id"],
            username=profile_data["username"],
            display_name=profile_data["display_name"],
            created_at=profile_data["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error registering user profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        ) from e

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    profile: UserUpdate,
    current_user = Depends(require_permission(Permission.UPDATE_USER)),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Update my profile (authentication required)
    - Only owner can update
    - Use username as default if display_name is not provided

    Args:
        profile: Profile data to update
        current_user: Current user extracted from JWT
        supabase: Supabase client

    Returns:
        UserResponse: Updated profile information
    """
    try:
        import os
        # Restrict 'admin' username
        if profile.username and profile.username.lower() == "admin":
            admin_email = os.getenv("ADMIN_EMAIL")
            if not admin_email or current_user.email != admin_email:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="The username 'admin' is reserved."
                )

        # Check username uniqueness if username is being updated
        if profile.username is not None:
            existing_username = supabase.table("users").select("id").eq("username", profile.username).execute()
            if existing_username.data and existing_username.data[0]["id"] != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        update_data = {}
        if profile.username is not None:
            update_data["username"] = profile.username
        if profile.display_name is not None:
            update_data["display_name"] = profile.display_name
        if profile.avatar_url is not None:
            update_data["avatar_url"] = profile.avatar_url
        if profile.bio is not None:
            update_data["bio"] = profile.bio
        if profile.collections_public is not None:
            update_data["collections_public"] = profile.collections_public

        # Add updated_at timestamp
        from datetime import datetime, timezone
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        updated_profile = supabase.table("users").update(update_data).eq("id", current_user.id).execute()
        
        if not updated_profile.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Handle taste_tags update (sync with user_taste_tags table)
        if profile.taste_tags is not None:
            from app.models.user import TASTE_TAGS
            
            # Validate tags
            invalid_tags = [tag for tag in profile.taste_tags if tag not in TASTE_TAGS]
            if invalid_tags:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid taste tags: {', '.join(invalid_tags)}"
                )
            
            # Limit to 5 tags
            if len(profile.taste_tags) > 5:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum 5 taste tags allowed"
                )
            
            # Delete existing tags
            supabase.table("user_taste_tags").delete().eq("user_id", current_user.id).execute()
            
            # Insert new tags
            if profile.taste_tags:
                tags_to_insert = [
                    {"user_id": current_user.id, "tag": tag}
                    for tag in profile.taste_tags
                ]
                supabase.table("user_taste_tags").insert(tags_to_insert).execute()
        
        profile_data = updated_profile.data[0]
        # Use username as default if display_name is not provided
        display_name = profile_data.get("display_name") or profile_data["username"]
        
        # Fetch updated taste tags
        taste_tags = await _get_user_taste_tags(supabase, current_user.id)
        trust_count = await _get_user_trust_count(supabase, current_user.id)
        
        return UserResponse(
            id=profile_data["id"],
            email=profile_data["email"],
            username=profile_data["username"],
            display_name=display_name,
            avatar_url=profile_data.get("avatar_url"),
            bio=profile_data.get("bio"),
            taste_tags=taste_tags,
            trust_count=trust_count,
            is_trusted_by_me=False,  # Can't trust yourself
            collections_public=profile_data.get("collections_public", False),
            created_at=profile_data["created_at"],
            updated_at=profile_data.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        ) from e


# =========================================================
# Helper Functions for Taste & Trust
# =========================================================

async def _get_user_taste_tags(supabase: Client, user_id: str) -> List[str]:
    """Get taste tags for a user."""
    try:
        result = supabase.table("user_taste_tags").select("tag").eq("user_id", user_id).execute()
        return [row["tag"] for row in result.data] if result.data else []
    except Exception:
        return []


async def _get_user_trust_count(supabase: Client, user_id: str) -> int:
    """Get the count of users who trust this user."""
    try:
        result = supabase.table("user_trust").select("id", count="exact").eq("trustee_id", user_id).execute()
        return result.count if result.count is not None else 0
    except Exception:
        return 0


async def _is_user_trusted_by(supabase: Client, truster_id: str, trustee_id: str) -> bool:
    """Check if truster trusts trustee."""
    try:
        result = supabase.table("user_trust").select("id").eq("truster_id", truster_id).eq("trustee_id", trustee_id).execute()
        return len(result.data) > 0 if result.data else False
    except Exception:
        return False


async def _get_daily_trust_count(supabase: Client, user_id: str) -> int:
    """Get today's trust count for a user."""
    try:
        from datetime import date
        today = date.today().isoformat()
        result = supabase.table("user_trust_daily_count").select("trust_count").eq("user_id", user_id).eq("trust_date", today).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]["trust_count"]
        return 0
    except Exception:
        return 0


async def _increment_daily_trust_count(supabase: Client, user_id: str) -> None:
    """Increment today's trust count for a user."""
    try:
        from datetime import date
        today = date.today().isoformat()
        # Try to update existing record
        existing = supabase.table("user_trust_daily_count").select("id, trust_count").eq("user_id", user_id).eq("trust_date", today).execute()
        if existing.data and len(existing.data) > 0:
            new_count = existing.data[0]["trust_count"] + 1
            supabase.table("user_trust_daily_count").update({"trust_count": new_count}).eq("id", existing.data[0]["id"]).execute()
        else:
            supabase.table("user_trust_daily_count").insert({
                "user_id": user_id,
                "trust_date": today,
                "trust_count": 1
            }).execute()
    except Exception:
        logger.warning("Failed to increment daily trust count", exc_info=True)


# =========================================================
# Trust (Taste Mate) API Endpoints
# =========================================================

DAILY_TRUST_LIMIT = 5  # Maximum trusts per day


@router.post("/{username}/trust", status_code=status.HTTP_201_CREATED)
async def trust_user(
    username: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Trust a user (Taste Mate).
    - Cannot trust yourself
    - Daily limit: 5 trusts per day
    - Cannot trust the same user twice
    """
    try:
        # Get target user by username
        target_user = supabase.table("users").select("id").eq("username", username).single().execute()
        if not target_user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        target_user_id = target_user.data["id"]
        
        # Cannot trust yourself
        if target_user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot trust yourself"
            )
        
        # Check daily limit
        daily_count = await _get_daily_trust_count(supabase, current_user.id)
        if daily_count >= DAILY_TRUST_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Daily trust limit reached ({DAILY_TRUST_LIMIT}/day)"
            )
        
        # Check if already trusting
        is_already_trusted = await _is_user_trusted_by(supabase, current_user.id, target_user_id)
        if is_already_trusted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already trusting this user"
            )
        
        # Create trust relationship
        supabase.table("user_trust").insert({
            "truster_id": current_user.id,
            "trustee_id": target_user_id
        }).execute()
        
        # Increment daily count
        await _increment_daily_trust_count(supabase, current_user.id)
        
        return {"message": "User trusted successfully", "username": username}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trust user"
        ) from e


@router.delete("/{username}/trust", status_code=status.HTTP_204_NO_CONTENT)
async def untrust_user(
    username: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Remove trust from a user (Taste Mate).
    """
    try:
        # Get target user by username
        target_user = supabase.table("users").select("id").eq("username", username).single().execute()
        if not target_user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        target_user_id = target_user.data["id"]
        
        # Delete trust relationship
        result = supabase.table("user_trust").delete().eq("truster_id", current_user.id).eq("trustee_id", target_user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trust relationship not found"
            )
        
        return None  # 204 No Content
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to untrust user"
        ) from e


@router.get("/me/trusting", response_model=List[UserPublicResponse])
async def get_trusting_users(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get list of users I trust (Taste Mates).
    """
    try:
        # Get trust relationships where I am the truster
        trusts = supabase.table("user_trust").select("trustee_id").eq("truster_id", current_user.id).execute()
        
        if not trusts.data:
            return []
        
        trustee_ids = [t["trustee_id"] for t in trusts.data]
        
        # Get user profiles for trustee IDs
        users = supabase.table("users").select("username, display_name, avatar_url, bio, created_at").in_("id", trustee_ids).execute()
        
        if not users.data:
            return []
        
        result = []
        for user in users.data:
            # Get founding stats and taste tags for each user
            user_id_result = supabase.table("users").select("id").eq("username", user["username"]).single().execute()
            if user_id_result.data:
                user_id = user_id_result.data["id"]
                
                nav_count = supabase.table("cafe_checkins").select("id", count="exact").eq("user_id", user_id).eq("founding_role", "navigator").execute()
                navigator_count = nav_count.count if nav_count.count is not None else 0
                
                van_count = supabase.table("cafe_checkins").select("id", count="exact").eq("user_id", user_id).in_("founding_role", ["vanguard", "vanguard_2nd", "vanguard_3rd"]).execute()
                vanguard_count = van_count.count if van_count.count is not None else 0
                
                user["founding_stats"] = {
                    "navigator_count": navigator_count,
                    "vanguard_count": vanguard_count
                }
                user["taste_tags"] = await _get_user_taste_tags(supabase, user_id)
                user["trust_count"] = await _get_user_trust_count(supabase, user_id)
            
            result.append(UserPublicResponse(**user))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get trusting users"
        ) from e


@router.get("/me/streak")
async def get_my_streak(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get current user's drop streak information.
    
    Returns:
        dict: current_streak, max_streak, last_drop_date, streak_active
    """
    try:
        from datetime import datetime, timezone, timedelta
        from dateutil import parser as date_parser
        
        # Get user's streak data from profile
        user_result = supabase.table("users").select(
            "current_streak, max_streak, last_drop_date"
        ).eq("id", current_user.id).single().execute()
        
        if not user_result.data:
            return {
                "current_streak": 0,
                "max_streak": 0,
                "last_drop_date": None,
                "streak_active": False,
                "days_since_last_drop": None
            }
        
        data = user_result.data
        current_streak = data.get("current_streak") or 0
        max_streak = data.get("max_streak") or 0
        last_drop_date = data.get("last_drop_date")
        
        # Check if streak is still active (within 7 days)
        streak_active = False
        days_since_last_drop = None
        
        if last_drop_date:
            try:
                last_date = date_parser.parse(last_drop_date).date() if isinstance(last_drop_date, str) else last_drop_date
                today = datetime.now(timezone.utc).date()
                days_since_last_drop = (today - last_date).days
                streak_active = days_since_last_drop <= 7
            except Exception:
                pass
        
        return {
            "current_streak": current_streak,
            "max_streak": max_streak,
            "last_drop_date": last_drop_date,
            "streak_active": streak_active,
            "days_since_last_drop": days_since_last_drop
        }
        
    except Exception:
        logger.error("Error getting streak", exc_info=True)
        return {
            "current_streak": 0,
            "max_streak": 0,
            "last_drop_date": None,
            "streak_active": False,
            "days_since_last_drop": None
        }