from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class CafeViewCreate(BaseModel):
    """Request model for recording a cafe view"""
    cafe_id: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class CafeViewResponse(BaseModel):
    """Response model for cafe view"""
    id: str
    cafe_id: str
    user_id: Optional[str] = None
    viewed_at: datetime

class CafeVisitCreate(BaseModel):
    """Request model for recording a cafe visit"""
    cafe_id: str
    check_in_lat: Optional[Decimal] = None
    check_in_lng: Optional[Decimal] = None
    distance_meters: Optional[int] = None
    duration_minutes: Optional[int] = None
    auto_detected: bool = False
    confirmed: bool = True
    # Coffee log fields (optional)
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating must be between 1 and 5")
    comment: Optional[str] = Field(None, max_length=1000, description="Comment must be less than 1000 characters")
    photo_urls: Optional[List[str]] = Field(None, max_items=5, description="Maximum 5 photos")
    is_public: bool = True
    anonymous: bool = False
    coffee_type: Optional[str] = Field(None, max_length=100)

class CafeVisitUpdate(BaseModel):
    """Update model for confirming auto-detected visits and adding log content"""
    confirmed: Optional[bool] = None
    duration_minutes: Optional[int] = None
    # Coffee log fields
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating must be between 1 and 5")
    comment: Optional[str] = Field(None, max_length=1000, description="Comment must be less than 1000 characters")
    photo_urls: Optional[List[str]] = Field(None, max_items=5, description="Maximum 5 photos")
    is_public: Optional[bool] = None
    anonymous: Optional[bool] = None
    coffee_type: Optional[str] = Field(None, max_length=100)

class CafeVisitResponse(BaseModel):
    """Response model for cafe visit"""
    id: str
    cafe_id: str
    user_id: str
    visited_at: datetime
    check_in_lat: Optional[Decimal] = None
    check_in_lng: Optional[Decimal] = None
    distance_meters: Optional[int] = None
    duration_minutes: Optional[int] = None
    auto_detected: bool
    confirmed: bool
    has_review: bool
    has_photos: bool
    # Coffee log fields
    rating: Optional[int] = None
    comment: Optional[str] = None
    photo_urls: Optional[List[str]] = None
    is_public: bool = True
    anonymous: bool = False
    coffee_type: Optional[str] = None
    updated_at: Optional[datetime] = None
    # For public display
    author_display_name: Optional[str] = None

class TrendingCafeResponse(BaseModel):
    """Response model for trending cafe"""
    id: str
    slug: Optional[str] = None
    name: str
    address: str
    latitude: Decimal
    longitude: Decimal
    view_count_14d: int = 0
    visit_count_14d: int = 0
    trending_score: Decimal = Decimal('0.0')
    trending_rank: Optional[int] = None

class CafeStatsResponse(BaseModel):
    """Response model for cafe statistics"""
    cafe_id: str
    view_count_total: int = 0
    view_count_14d: int = 0
    visit_count_total: int = 0
    visit_count_14d: int = 0
    trending_score: Decimal = Decimal('0.0')
    trending_rank: Optional[int] = None
    trending_updated_at: Optional[datetime] = None

class CafeLogPublicResponse(BaseModel):
    """Public response model for coffee logs (anonymous display)"""
    id: str
    cafe_id: str
    visited_at: datetime
    rating: Optional[int] = None
    comment: Optional[str] = None
    photo_urls: Optional[List[str]] = None
    coffee_type: Optional[str] = None
    author_display_name: Optional[str] = None
    updated_at: Optional[datetime] = None

class CafeLogsResponse(BaseModel):
    """Response model for paginated coffee logs"""
    logs: List[CafeLogPublicResponse]
    total_count: int
    page: int
    page_size: int
    has_more: bool

