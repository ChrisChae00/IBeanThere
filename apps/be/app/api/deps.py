from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.database.supabase import get_supabase_client

# Security scheme for JWT tokens
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Validates Supabase JWT token and returns current user.
    
    - Requires: Authorization: Bearer <token>
    - Returns: User object
    - Raises: 401 if token is invalid or missing
    """
    token = credentials.credentials
    
    try:
        # Validate token with Supabase
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Check if user email is verified (optional check - can be disabled for testing)
        # Uncomment the following lines if email verification is required
        # if not user.user.email_confirmed_at:
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Email not verified"
        #     )
            
        return user.user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

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