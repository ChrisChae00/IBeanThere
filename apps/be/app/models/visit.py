from pydantic import BaseModel, Field
from typing import Optional
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

class CafeVisitUpdate(BaseModel):
    """Update model for confirming auto-detected visits"""
    confirmed: bool
    duration_minutes: Optional[int] = None

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

class TrendingCafeResponse(BaseModel):
    """Response model for trending cafe"""
    id: str
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

