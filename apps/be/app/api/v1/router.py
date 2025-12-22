from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .cafes import router as cafes_router
from .visits import router as visits_router
from .community import router as community_router

# Main API v1 router
router = APIRouter(prefix="/api/v1")

# Include sub-routers
router.include_router(auth_router, prefix="/auth", tags=["authentication"])
router.include_router(users_router, tags=["users"])
router.include_router(visits_router, tags=["visits"])  # Must be before cafes_router for /cafes/trending
router.include_router(cafes_router, prefix="/cafes", tags=["cafes"])
router.include_router(community_router, tags=["community"])

