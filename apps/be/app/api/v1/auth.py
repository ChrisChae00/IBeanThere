from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me")
async def get_current_user_info(current_user = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    - Requires: Valid JWT token in Authorization header
    - Returns: User profile data
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at
    }

@router.get("/verify")
async def verify_token(current_user = Depends(get_current_user)):
    """
    Verify if the provided JWT token is valid.
    
    - Requires: Valid JWT token in Authorization header
    - Returns: Token validation status
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "message": "Token is valid"
    }
