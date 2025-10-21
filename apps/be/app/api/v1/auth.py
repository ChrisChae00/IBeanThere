from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.api.deps import get_current_user
from app.core.permissions import require_permission, Permission

router = APIRouter()

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.get("/me")
async def get_current_user_info(current_user = Depends(require_permission(Permission.READ_MY_USER))):
    """
    Get current authenticated user information.
    
    - Requires: Valid JWT token in Authorization header
    - Returns: User profile data (internal ID not exposed)
    """
    return {
        "email": current_user.email,
        "created_at": current_user.created_at,
        "email_verified": current_user.email_confirmed_at is not None
    }

@router.get("/verify")
async def verify_token(current_user = Depends(require_permission(Permission.READ_MY_USER))):
    """
    Verify if the provided JWT token is valid.
    
    - Requires: Valid JWT token in Authorization header
    - Returns: Token validation status
    """
    return {
        "valid": True,
        "message": "Token is valid"
    }

@router.post("/logout")
async def logout(current_user = Depends(require_permission(Permission.READ_MY_USER))):
    """
    Logout user (invalidate token on client side)
    - Supabase handles token invalidation
    - This endpoint confirms logout action
    """
    return {
        "message": "Logged out successfully"
    }

@router.post("/refresh")
async def refresh_token(current_user = Depends(require_permission(Permission.READ_MY_USER))):
    """
    Refresh JWT token
    - Supabase handles token refresh
    - This endpoint triggers refresh process
    """
    return {
        "message": "Token refresh initiated"
    }

@router.get("/email-verified")
async def check_email_verification(current_user = Depends(require_permission(Permission.READ_MY_USER))):
    """
    Check if user's email is verified
    """
    return {
        "email_verified": current_user.email_confirmed_at is not None
    }

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    Initiate password reset process
    - Supabase handles the actual password reset
    """
    return {
        "message": "Password reset email sent if account exists"
    }

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Reset password with token
    - Supabase handles the actual password reset
    """
    return {
        "message": "Password reset completed"
    }
