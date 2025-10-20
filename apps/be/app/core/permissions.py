from enum import Enum
from fastapi import HTTPException, status, Depends
from app.api.deps import get_current_user

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
    UPDATE_USER = "user:update"
    DELETE_USER = "user:delete"
    REQUEST_ACCOUNT_DELETION = "user:request_deletion"

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
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.REQUEST_ACCOUNT_DELETION,
    ],
    UserRole.CAFE_OWNER: [
        Permission.READ_USER,
        Permission.READ_MY_USER,
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
    ], 
}

def require_permission(required_permission: Permission):
    """Decorator to check if the user has the required permission."""
    async def permission_checker(current_user = Depends(get_current_user)):
        # Check if the user is authenticated (currently set as USER)
        user_role = getattr(current_user, "role", UserRole.USER)

        # Check if the user has the required permission
        user_permissions = ROLE_PERMISSIONS.get(user_role, [])
        if required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{required_permission}' is required for this action"
            )

        return current_user
    return permission_checker