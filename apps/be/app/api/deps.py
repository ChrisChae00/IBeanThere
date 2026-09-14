import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.database.supabase import get_supabase_client
from app.core.permissions import UserRole

logger = logging.getLogger(__name__)

# Security scheme for JWT tokens
security = HTTPBearer()

# Same scheme, but a missing or bad token is not an error. Used by endpoints that
# are public but say a little more to someone signed in -- "here is what people
# report about this cafe" plus "and here is what you reported".
optional_security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Validates Supabase JWT token and returns current user with role.
    
    - Requires: Authorization: Bearer <token>
    - Returns: User object with role attribute
    - Raises: 401 if token is invalid or missing
    """
    token = credentials.credentials
    
    try:
        # Validate token with Supabase
        auth_user = supabase.auth.get_user(token)
        if not auth_user or not auth_user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Get user role from public.users table
        user_id = auth_user.user.id
        try:
            blocked = supabase.table("user_blacklist").select("user_id").eq(
                "user_id", user_id
            ).eq("status", "blocked").limit(1).execute().data
        except Exception:
            # Fail closed: not knowing whether an account is blocked is not permission
            # to serve it. But say why in the log -- this guard sits in front of every
            # authenticated endpoint, so when it breaks the whole signed-in app returns
            # 503 and the response alone cannot tell an outage from an unapplied
            # migration.
            logger.exception("user_blacklist lookup failed; refusing the request")
            raise HTTPException(503, "Account status unavailable")
        try:
            deleting = supabase.table("account_deletion_requests").select("user_id").eq(
                "user_id", user_id
            ).limit(1).execute().data
        except Exception:
            logger.exception("Account deletion status unavailable")
            raise HTTPException(503, "Account status unavailable")
        if deleting:
            raise HTTPException(403, "Account deletion in progress")
        if blocked:
            raise HTTPException(403, "Account blocked")
        try:
            user_profile = supabase.table("users").select("role").eq("id", user_id).single().execute()
            role = user_profile.data.get("role", "user") if user_profile.data else "user"
        except Exception:
            # If users table doesn't exist or user not found, default to 'user'
            role = "user"
        
        # Add role to user object
        auth_user.user.role = role
            
        return auth_user.user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(optional_security),
    supabase: Client = Depends(get_supabase_client)
):
    """
    The signed-in user, or None.

    Never raises: a public endpoint must keep serving its public answer when the
    token is absent, expired or malformed. Anything that must not be seen by a
    stranger belongs behind `get_current_user`, not behind this.
    """
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials, supabase)
    except Exception:
        return None


async def verify_review_owner(
    review_id: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Verifies if the current user is the owner of the review.
    
    Args:
        review_id: The ID of the review to verify ownership of.
        current_user: The current user.
        supabase: The Supabase client.

    Returns:
        review_id: The ID of the review.

    Raises:
        HTTPException(401) if the user is not authenticated.
        HTTPException(403) if the current user is not the owner of the review.
        HTTPException(404) if the review is not found.
    """
    try: 
        review = await supabase.table("reviews").select("user_id").eq("id", review_id).single().execute()
        if not review or not review.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        if review.data['user_id'] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not the owner of this review"
            )
        return review_id
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        ) from e

async def require_admin_role(
    current_user = Depends(get_current_user)
):
    """
    Dependency to verify that the current user has admin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        current_user: Current user if admin
        
    Raises:
        HTTPException(403) if user is not admin
    """
    user_role = getattr(current_user, "role", None)
    
    if user_role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required for this action"
        )
    
    return current_user
