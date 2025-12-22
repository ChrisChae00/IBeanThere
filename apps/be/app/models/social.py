from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserTrustCreate(BaseModel):
    """Request model for trusting a user"""
    trustee_id: str = Field(..., description="ID of the user to trust")


class UserTrustResponse(BaseModel):
    """Response model for trust relationship"""
    id: str
    truster_id: str
    trustee_id: str
    created_at: datetime


class TrustedUserResponse(BaseModel):
    """Response model for a trusted user (Taste Mate)"""
    id: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    trust_count: int = 0
    trusted_at: datetime


class VisitLikeResponse(BaseModel):
    """Response model for visit like"""
    id: str
    user_id: str
    visit_id: str
    created_at: datetime


class BadgeResponse(BaseModel):
    """Response model for a badge"""
    badge_code: str
    awarded_at: datetime


class BadgeInfo(BaseModel):
    """Badge metadata"""
    code: str
    name: str
    description: str
    icon_url: Optional[str] = None


# Badge Definitions
BADGE_DEFINITIONS = {
    "bean_sprout": BadgeInfo(
        code="bean_sprout",
        name="Bean Sprout",
        description="Recorded your first coffee log"
    ),
    "cafe_explorer": BadgeInfo(
        code="cafe_explorer",
        name="Cafe Explorer",
        description="Contributed to cafe verification 5 times"
    ),
    "coffee_connoisseur": BadgeInfo(
        code="coffee_connoisseur",
        name="Coffee Connoisseur",
        description="Trusted by 10 other users"
    ),
    "second_home": BadgeInfo(
        code="second_home",
        name="Second Home",
        description="Logged 5 visits at the same cafe on different days"
    )
}


class CommunityFeedItem(BaseModel):
    """Response model for community feed item"""
    id: str
    cafe_id: str
    cafe_name: str
    user_id: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    visited_at: datetime
    rating: Optional[int] = None
    comment: Optional[str] = None
    photo_urls: Optional[List[str]] = None
    coffee_type: Optional[str] = None
    like_count: int = 0
    is_liked_by_me: bool = False


class CommunityFeedResponse(BaseModel):
    """Paginated community feed response"""
    items: List[CommunityFeedItem]
    total_count: int
    page: int
    page_size: int
    has_more: bool
