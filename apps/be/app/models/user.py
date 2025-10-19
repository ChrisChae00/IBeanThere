from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user model with common fields."""
    email: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    """Model for creating a new user."""
    pass

class UserUpdate(BaseModel):
    """Model for updating user information."""
    username: Optional[str] = None
    avatar_url: Optional[str] = None

class User(UserBase):
    """Complete user model with all fields."""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    """User model for API responses."""
    id: str
    email: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime