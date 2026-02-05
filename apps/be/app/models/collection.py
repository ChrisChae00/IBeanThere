"""
Collection models for cafe collections feature.
Allows users to save cafes to collections like Favourites, Save for Later, or custom collections.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class CollectionIconType(str, Enum):
    """Types of collection icons."""
    FAVOURITE = "favourite"
    SAVE_LATER = "save_later"
    CUSTOM = "custom"


class CollectionBase(BaseModel):
    """Base collection model."""
    name: str = Field(..., min_length=1, max_length=100, description="Collection name")
    description: Optional[str] = Field(None, max_length=500, description="Collection description")
    icon_type: CollectionIconType = Field(default=CollectionIconType.CUSTOM, description="Icon type")
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Custom color (hex)")
    is_public: bool = Field(default=False, description="Whether collection is publicly visible")


class CollectionCreate(CollectionBase):
    """Model for creating a new collection."""
    pass


class CollectionUpdate(BaseModel):
    """Model for updating a collection."""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Collection name")
    description: Optional[str] = Field(None, max_length=500, description="Collection description")
    icon_type: Optional[CollectionIconType] = Field(None, description="Icon type")
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Custom color (hex)")
    is_public: Optional[bool] = Field(None, description="Whether collection is publicly visible")


class CafePreview(BaseModel):
    """Minimal cafe info for collection preview."""
    id: str
    name: str
    main_image: Optional[str] = None


class CollectionResponse(CollectionBase):
    """Collection response model with computed fields."""
    id: str
    user_id: str
    share_token: Optional[str] = None
    position: int = 0
    item_count: int = 0
    preview_cafes: Optional[List[CafePreview]] = None  # First few cafes for preview
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CollectionItemCreate(BaseModel):
    """Model for adding a cafe to a collection."""
    cafe_id: str = Field(..., description="ID of the cafe to add")
    note: Optional[str] = Field(None, max_length=500, description="Personal note about this cafe")


class CollectionItemUpdate(BaseModel):
    """Model for updating a collection item."""
    note: Optional[str] = Field(None, max_length=500, description="Personal note about this cafe")


class CollectionItemResponse(BaseModel):
    """Collection item response model with cafe details."""
    id: str
    collection_id: str
    cafe_id: str
    cafe_name: str
    cafe_address: Optional[str] = None
    cafe_main_image: Optional[str] = None
    cafe_latitude: Optional[float] = None
    cafe_longitude: Optional[float] = None
    note: Optional[str] = None
    added_at: datetime

    class Config:
        from_attributes = True


class CollectionDetailResponse(CollectionResponse):
    """Full collection response including all items."""
    items: List[CollectionItemResponse] = []


class CafeSaveStatus(BaseModel):
    """Response model for cafe's save status in user's collections."""
    is_favourited: bool = False
    is_saved: bool = False  # Save for Later
    saved_collection_ids: List[str] = []


class QuickSaveRequest(BaseModel):
    """Request model for quick save (Favourite or Save for Later)."""
    save_type: str = Field(..., pattern=r'^(favourite|save_later)$', description="Type: 'favourite' or 'save_later'")


class ShareTokenResponse(BaseModel):
    """Response model for share token generation."""
    share_token: str
    share_url: str
