from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List
from supabase import Client
from app.models.user import UserPublicResponse, UserResponse, UserUpdate, UserProfileCreate, UserRegistrationResponse
from app.api.deps import get_supabase_client, get_current_user
from app.core.permissions import require_permission, Permission

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/profile/{display_name}", response_model=UserPublicResponse)
async def get_user_profile(display_name: str, supabase: Client = Depends(get_supabase_client)
):
    """
    Public endpoint to get user profile by display name. (No authentication required)

    Args:
        display_name: The display name of the user to get the profile of.
        supabase: The Supabase client.

    Returns:
        UserPublicResponse: The user profile.
    """
    try:
        user = await supabase.table("users").select("""display_name, avatar_url, bio, created_at""").eq("display_name", display_name).single().execute()
        if not user or not user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserPublicResponse(**user.data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching user profile"
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
        users = await supabase.table("users").select("""display_name, avatar_url, bio, created_at""").ilike("display_name", f"%{query}%").limit(limit).execute()
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
        user = await supabase.table("users").select("*").eq("id", current_user.id).single().execute()
        if not user or not user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        user_data = user.data
        # Use username as default if display_name is not provided
        display_name = user_data.get('display_name') or user_data['username']
        
        return UserResponse(
            id=user_data['id'],
            email=user_data['email'],
            username=user_data['username'],
            display_name=display_name,
            bio=user_data.get('bio'),
            avatar_url=user_data.get('avatar_url'),
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
    current_user = Depends(get_current_user),
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
        # Check if profile already exists
        existing_profile = await supabase.table("users").select("id").eq("id", current_user.id).execute()
        
        if existing_profile.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile already exists"
            )
        
        # Use username as default if display_name is not provided
        display_name = profile.display_name or profile.username
        
        # Create new profile
        new_profile = await supabase.table("users").insert({
            "id": current_user.id,
            "email": current_user.email,  # Extracted from JWT
            "username": profile.username,
            "display_name": display_name,
            "avatar_url": profile.avatar_url,
            "bio": profile.bio
        }).execute()
        
        profile_data = new_profile.data[0]
        return UserRegistrationResponse(
            id=profile_data["id"],
            username=profile_data["username"],
            display_name=profile_data["display_name"],
            created_at=profile_data["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user profile"
        ) from e

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    profile: UserUpdate,
    current_user = Depends(get_current_user),
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
        # Permission validation
        user_role = getattr(current_user, "role", "user")
        if user_role not in ["user", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Specific permission is required for this action"
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
        
        # Add updated_at timestamp 
        update_data["updated_at"] = "now()"
        
        updated_profile = await supabase.table("users").update(update_data).eq("id", current_user.id).execute()
        
        if not updated_profile.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        profile_data = updated_profile.data[0]
        # Use username as default if display_name is not provided
        display_name = profile_data.get("display_name") or profile_data["username"]
        
        return UserResponse(
            id=profile_data["id"],
            email=profile_data["email"],
            username=profile_data["username"],
            display_name=display_name,
            avatar_url=profile_data.get("avatar_url"),
            bio=profile_data.get("bio"),
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