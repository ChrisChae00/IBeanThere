from fastapi import APIRouter
from .auth import router as auth_router

# Main API v1 router
router = APIRouter(prefix="/api/v1")

# Include sub-routers
router.include_router(auth_router, prefix="/auth", tags=["authentication"])
