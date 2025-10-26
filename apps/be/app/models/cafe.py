from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class CafeBase(BaseModel):
    """Base cafe model with common fields."""
    google_place_id: str = Field(..., description="Google Places API place_id")
    name: str
    address: str
    phone_number: Optional[str] = None
    website: Optional[str] = None
    google_maps_url: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    google_rating: Optional[Decimal] = None
    google_review_count: Optional[int] = Field(default=0, ge=0)
    google_types: Optional[List[str]] = None
    opening_hours: Optional[dict] = None

class CafeCreate(CafeBase):
    """Model for creating a new cafe entry."""
    pass

class CafeUpdate(BaseModel):
    """Model for updating cafe information."""
    name: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    website: Optional[str] = None
    google_maps_url: Optional[str] = None
    google_rating: Optional[Decimal] = None
    google_review_count: Optional[int] = Field(None, ge=0)
    google_types: Optional[List[str]] = None
    opening_hours: Optional[dict] = None
    last_synced_at: Optional[datetime] = None

class Cafe(CafeBase):
    """Complete cafe model with all fields."""
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_synced_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CafeResponse(BaseModel):
    """Cafe model for API responses."""
    id: str
    google_place_id: str
    name: str
    address: str
    phone_number: Optional[str] = None
    website: Optional[str] = None
    google_maps_url: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    google_rating: Optional[Decimal] = None
    google_review_count: Optional[int] = 0
    google_types: Optional[List[str]] = None
    opening_hours: Optional[dict] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class CafeSearchParams(BaseModel):
    """Parameters for cafe search."""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")
    radius: int = Field(default=2000, ge=100, le=5000, description="Search radius in meters")

class CafeSearchResponse(BaseModel):
    """Response model for cafe search."""
    cafes: List[CafeResponse]
    cache_hit: bool = Field(default=True, description="Whether this was served from cache")
    total_count: int

