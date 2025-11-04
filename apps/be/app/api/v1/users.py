from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List
from supabase import Client
from app.models.user import UserPublicResponse, UserResponse, UserUpdate, UserProfileCreate, UserRegistrationResponse
from app.api.deps import get_supabase_client, get_current_user
from app.core.permissions import require_permission, Permission

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/profile/{display_name}", response_model=List[UserPublicResponse])
async def get_user_profiles(display_name: str, supabase: Client = Depends(get_supabase_client)):
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
        return [UserPublicResponse(**user) for user in users.data]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching user profiles"
        ) from e

@router.get("/profile-by-username/{username}", response_model=UserPublicResponse)
async def get_user_profile_by_username(username: str, supabase: Client = Depends(get_supabase_client)):
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
        user = supabase.table("users").select("""username, display_name, avatar_url, bio, created_at""").eq("username", username).single().execute()
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

@router.get("/check-username/{username}")
async def check_username_availability(
    username: str,
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
        user = supabase.table("users").select("*").eq("id", current_user.id).single().execute()
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
            role=user_data.get('role', 'user'),  # Get role from public.users table
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
            
            update_data = {
                "username": profile.username,
                "display_name": display_name,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
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
            new_profile = supabase.table("users").insert({
                "id": current_user.id,
                "email": current_user.email,  # Extracted from JWT
                "username": profile.username,
                "display_name": display_name,
                "avatar_url": profile.avatar_url,
                "bio": profile.bio,
                "role": "user"  # Default role for new users
            }).execute()
            
            if not new_profile.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user profile"
                )
            
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
        # Log the actual error for debugging
        import traceback
        print(f"Error registering user profile: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user profile: {str(e)}"
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
        
        # Add updated_at timestamp
        from datetime import datetime, timezone
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        updated_profile = supabase.table("users").update(update_data).eq("id", current_user.id).execute()
        
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