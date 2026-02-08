from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Available taste tags
TASTE_TAGS = [
    "acidic",
    "full_body", 
    "light_roast",
    "dessert_lover",
    "work_friendly",
    "cozy",
    "roastery",
    "specialty"
]

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
    # Consent tracking (GDPR compliance)
    terms_accepted: bool = Field(False, description="User accepted Terms of Service")
    privacy_accepted: bool = Field(False, description="User accepted Privacy Policy")
    consent_version: str = Field("1.0.0", description="Version of terms/privacy at time of consent")

class UserUpdate(BaseModel):
    """Model for updating user information."""
    username: Optional[str] = Field(None, min_length=3, max_length=20, description="Unique username for login")
    display_name: Optional[str] = Field(None, max_length=30, description="Public display name")
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500, description="Public bio")
    taste_tags: Optional[List[str]] = Field(None, max_length=5, description="User taste preference tags (max 5)")
    collections_public: Optional[bool] = None

class User(UserBase):
    """Complete user model with all fields."""
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FoundingStats(BaseModel):
    """Statistics about user's founding contributions."""
    navigator_count: int = 0
    vanguard_count: int = 0

class UserResponse(BaseModel):
    """User model for API responses (authenticated user)."""
    id: str
    email: str
    username: str
    display_name: str  # if not set, username will be used
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None  # User role from public.users table ('user', 'admin', etc.)
    founding_stats: Optional[FoundingStats] = None
    taste_tags: Optional[List[str]] = None
    trust_count: int = 0
    is_trusted_by_me: bool = False
    collections_public: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

class UserPublicResponse(BaseModel):
    """Public user profile - minimal information only."""   
    username: str  # Unique identifier for public access
    display_name: str  # if not set, username will be used
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    founding_stats: Optional[FoundingStats] = None
    taste_tags: Optional[List[str]] = None
    trust_count: int = 0
    collections_public: bool = False
    created_at: datetime

class UserRegistrationResponse(BaseModel):
    """User profile creation response - minimal information only."""
    id: str
    username: str
    display_name: str
    created_at: datetime
    message: str = "User profile created successfully"