from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user model with common fields."""
    email: str
    username: str = Field(..., min_length=3, max_length=20, description="Unique username for login")
    display_name: Optional[str] = Field(None, max_length=30, description="Public display name")
    avatar_url: Optional[str] = None  # URL to the user's avatar image
    bio: Optional[str] = Field(None, max_length=500, description="Public bio")

class UserProfileCreate(BaseModel):
    """Model for creating user profile (after Supabase Auth signup)."""
    username: str = Field(..., min_length=3, max_length=20, description="Unique username for login")
    display_name: Optional[str] = Field(None, max_length=30, description="Public display name")
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500, description="Public bio")

class UserUpdate(BaseModel):
    """Model for updating user information."""
    username: Optional[str] = Field(None, min_length=3, max_length=20, description="Unique username for login")
    display_name: Optional[str] = Field(None, max_length=30, description="Public display name")
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500, description="Public bio")

class User(UserBase):
    """Complete user model with all fields."""
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    """User model for API responses (authenticated user)."""
    id: str
    email: str
    username: str
    display_name: str  # if not set, username will be used
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class UserPublicResponse(BaseModel):
    """Public user profile - minimal information only."""   
    username: str  # Unique identifier for public access
    display_name: str  # if not set, username will be used
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime

class UserRegistrationResponse(BaseModel):
    """User profile creation response - minimal information only."""
    id: str
    username: str
    display_name: str
    created_at: datetime
    message: str = "User profile created successfully"