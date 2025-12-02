from enum import Enum
from fastapi import HTTPException, status, Depends

class UserRole(str, Enum):
    """User roles for the API."""
    ADMIN = "admin"
    CAFE_OWNER = "cafe_owner"
    USER = "user"
    GUEST = "guest"

class Permission(str, Enum):
    """Permissions for the API."""

    # Cafe permissions
    CREATE_CAFE = "cafe:create"
    READ_CAFE = "cafe:read"
    UPDATE_CAFE = "cafe:update"
    DELETE_CAFE = "cafe:delete"

    # Review permissions
    CREATE_REVIEW = "review:create"
    READ_REVIEW = "review:read"
    UPDATE_REVIEW = "review:update"
    DELETE_REVIEW = "review:delete"

    # User permissions
    READ_USER = "user:read"
    READ_MY_USER = "user:read_my"
    CREATE_USER_PROFILE = "user:create_profile"
    UPDATE_USER = "user:update"
    DELETE_USER = "user:delete"
    REQUEST_ACCOUNT_DELETION = "user:request_deletion"
    
    # Admin permissions
    ADMIN_VERIFY_CAFE = "admin:verify_cafe"
    ADMIN_DELETE_CAFE = "admin:delete_cafe"
    ADMIN_VIEW_PENDING = "admin:view_pending"

# Permission by role
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        Permission.CREATE_CAFE,
        Permission.READ_CAFE,
        Permission.UPDATE_CAFE,
        Permission.DELETE_CAFE,
        Permission.CREATE_REVIEW,
        Permission.READ_REVIEW,
        Permission.UPDATE_REVIEW,
        Permission.DELETE_REVIEW,
        Permission.READ_USER,
        Permission.READ_MY_USER,
        Permission.CREATE_USER_PROFILE,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.REQUEST_ACCOUNT_DELETION,
        Permission.ADMIN_VERIFY_CAFE,
        Permission.ADMIN_DELETE_CAFE,
        Permission.ADMIN_VIEW_PENDING,
    ],
    UserRole.CAFE_OWNER: [
        Permission.READ_USER,
        Permission.READ_MY_USER,
        Permission.CREATE_USER_PROFILE,
        Permission.REQUEST_ACCOUNT_DELETION,
        Permission.CREATE_CAFE,
        Permission.READ_CAFE,
        Permission.UPDATE_CAFE,
        Permission.DELETE_CAFE,
        Permission.CREATE_REVIEW,
        Permission.READ_REVIEW,
    ],
    UserRole.USER: [
        Permission.READ_USER,
        Permission.READ_MY_USER,
        Permission.CREATE_USER_PROFILE,
        Permission.UPDATE_USER,
        Permission.REQUEST_ACCOUNT_DELETION,
        Permission.CREATE_REVIEW,
        Permission.READ_REVIEW,
        Permission.UPDATE_REVIEW,
        Permission.DELETE_REVIEW,
    ],
    UserRole.GUEST: [
        Permission.READ_USER,
        Permission.READ_CAFE,
        Permission.READ_REVIEW,
        Permission.CREATE_USER_PROFILE,
    ], 
}

def require_permission(required_permission: Permission):
    """Decorator to check if the user has the required permission."""
    from app.api.deps import get_current_user
    
    async def permission_checker(current_user = Depends(get_current_user)):
        user_role = getattr(current_user, "role", None)
        
        if user_role is None:
            user_role = UserRole.USER
        
        # Check if the user has the required permission
        user_permissions = ROLE_PERMISSIONS.get(user_role, [])
        if required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{required_permission}' is required for this action"
            )

        return current_user
    return permission_checker