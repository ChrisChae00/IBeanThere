from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

# UGC Verification System Models

class CafeBase(BaseModel):
    """Base cafe model with UGC verification fields."""
    name: str
    address: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    business_hours: Optional[Dict[str, Any]] = None

class CafeRegistrationRequest(BaseModel):
    """Request model for cafe registration (UGC)."""
    name: str
    latitude: Decimal = Field(..., ge=-90, le=90)
    longitude: Decimal = Field(..., ge=-180, le=180)
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    business_hours: Optional[Dict[str, Any]] = None
    
    # Location verification
    user_location: Optional[dict] = None  # {lat, lng} for verification
    
    # Source tracking
    source_type: Optional[str] = None  # 'google_url' | 'map_click' | 'manual'
    source_url: Optional[str] = None

class CafeCreate(CafeBase):
    """Model for creating a new cafe entry (internal)."""
    navigator_id: Optional[str] = None  # User ID who first registered
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    normalized_name: Optional[str] = None
    normalized_address: Optional[str] = None

class CafeUpdate(BaseModel):
    """Model for updating cafe information."""
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

class CafeResponse(BaseModel):
    """Cafe model for API responses with verification info."""
    id: str
    name: str
    address: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[str] = None
    business_hours: Optional[Dict[str, Any]] = None
    
    # Verification fields
    status: str  # 'pending' | 'verified'
    verification_count: int
    verified_at: Optional[datetime] = None
    admin_verified: bool = False
    
    # Founding Crew
    navigator_id: Optional[str] = None
    vanguard_ids: Optional[list] = None
    
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CafeSearchParams(BaseModel):
    """Parameters for cafe search."""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")
    radius: int = Field(default=2000, ge=100, le=5000, description="Search radius in meters")
    status: Optional[str] = Field(None, description="Filter by status: 'pending' | 'verified'")

class CafeSearchResponse(BaseModel):
    """Response model for cafe search."""
    cafes: List[CafeResponse]
    total_count: int
