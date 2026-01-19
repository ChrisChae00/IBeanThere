"""
Report models for the reports API.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class ReportType(str, Enum):
    """Available report types."""
    # User reports
    USER_INAPPROPRIATE_NAME = "user_inappropriate_name"
    USER_INAPPROPRIATE_AVATAR = "user_inappropriate_avatar"
    USER_INAPPROPRIATE_BIO = "user_inappropriate_bio"
    USER_SPAM = "user_spam"
    # Cafe reports
    CAFE_INCORRECT_INFO = "cafe_incorrect_info"
    CAFE_CLOSED = "cafe_closed"
    CAFE_DUPLICATE = "cafe_duplicate"
    CAFE_NEW_REQUEST = "cafe_new_request"
    # Review reports
    REVIEW_INAPPROPRIATE = "review_inappropriate"
    REVIEW_SPAM = "review_spam"
    # Website reports
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"
    OTHER = "other"


class TargetType(str, Enum):
    """Target types for reports."""
    USER = "user"
    CAFE = "cafe"
    REVIEW = "review"
    WEBSITE = "website"


class ReportStatus(str, Enum):
    """Report status options."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class ReportCreate(BaseModel):
    """Model for creating a new report."""
    report_type: ReportType
    target_type: TargetType
    target_id: Optional[str] = Field(None, description="ID of the reported user/cafe/review")
    target_url: Optional[str] = Field(None, description="URL of the reported content")
    description: str = Field("", max_length=2000, description="Detailed description")
    image_urls: List[str] = Field(default_factory=list, max_length=3, description="URLs of attached images (max 3)")


class ReportUpdate(BaseModel):
    """Model for updating a report (admin only)."""
    status: Optional[ReportStatus] = None
    admin_notes: Optional[str] = Field(None, max_length=2000)


class ReportResponse(BaseModel):
    """Report response model."""
    id: str
    reporter_id: str
    report_type: ReportType
    target_type: TargetType
    target_id: Optional[str] = None
    target_url: Optional[str] = None
    description: str
    image_urls: List[str] = []
    status: ReportStatus
    admin_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    
    # Reporter info (joined from users table)
    reporter_username: Optional[str] = None
    reporter_display_name: Optional[str] = None

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    """Paginated list of reports."""
    reports: List[ReportResponse]
    total: int
    page: int
    page_size: int
    has_more: bool
