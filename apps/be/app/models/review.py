from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    """Base review model with common fields."""
    cafe_id: str
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")
    comment: Optional[str] = Field(None, max_length=500, description="Comment must be less than 500 characters")

class ReviewCreate(ReviewBase):
    """Model for creating a new review."""
    pass

class ReviewUpdate(BaseModel):
    """Model for updating a review information."""
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = Field(None, max_length=500, description="Comment must be less than 500 characters")

class Review(ReviewBase):
    """Complete review model with all fields."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ReviewPublicResponse(BaseModel):
    """Review model for API responses."""
    id: str
    cafe_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    author_display_name: str

class ReviewMyResponse(BaseModel):
    """Review model for API responses."""
    id: str
    user_id: str
    cafe_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None