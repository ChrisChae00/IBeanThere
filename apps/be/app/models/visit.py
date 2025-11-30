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
    # Basic logging fields
    dessert: Optional[str] = Field(None, max_length=200, description="Dessert ordered")
    price: Optional[Decimal] = Field(None, description="Price paid")
    # Detailed review fields
    atmosphere_rating: Optional[int] = Field(None, ge=1, le=5, description="Atmosphere rating (1-5)")
    parking_info: Optional[str] = Field(None, max_length=50, description="Parking availability info")
    acidity_rating: Optional[int] = Field(None, ge=0, le=10, description="Acidity intensity rating (0-10)")
    body_rating: Optional[int] = Field(None, ge=0, le=10, description="Body intensity rating (0-10)")
    sweetness_rating: Optional[int] = Field(None, ge=0, le=10, description="Sweetness intensity rating (0-10)")
    bitterness_rating: Optional[int] = Field(None, ge=0, le=10, description="Bitterness intensity rating (0-10)")
    aftertaste_rating: Optional[int] = Field(None, ge=0, le=10, description="Aftertaste intensity rating (0-10)")
    # Coffee & Taste advanced fields
    bean_origin: Optional[str] = Field(None, max_length=200, description="Coffee bean origin (e.g., Ethiopia, Colombia)")
    processing_method: Optional[str] = Field(None, max_length=50, description="Processing method (Washed, Natural, Honey, etc.)")
    roast_level: Optional[str] = Field(None, max_length=50, description="Roast level (Light, Medium, Medium-Dark, Dark)")
    extraction_method: Optional[str] = Field(None, max_length=200, description="Extraction method used")
    extraction_equipment: Optional[str] = Field(None, max_length=200, description="Equipment used for extraction (e.g., La Marzocco, Hario, Aeropress)")
    aroma_rating: Optional[int] = Field(None, ge=0, le=10, description="Aroma intensity rating (0-10)")
    # Space & Work Environment fields
    wifi_quality: Optional[str] = Field(None, max_length=500, description="WiFi quality description")
    wifi_rating: Optional[int] = Field(None, ge=1, le=5, description="WiFi rating (1-5)")
    outlet_info: Optional[str] = Field(None, max_length=500, description="Outlet availability and location information")
    furniture_comfort: Optional[str] = Field(None, max_length=500, description="Furniture comfort description (table height, chair comfort, etc.)")
    noise_level: Optional[str] = Field(None, max_length=500, description="Noise level description (decibels, conversation vs white noise, music genre/volume)")
    noise_rating: Optional[int] = Field(None, ge=1, le=5, description="Noise rating (1-5)")
    temperature_lighting: Optional[str] = Field(None, max_length=500, description="Temperature and lighting description (AC/heater strength, lighting for work)")
    facilities_info: Optional[str] = Field(None, max_length=500, description="Facilities information (bathroom location/cleanliness, gender separation, parking availability)")

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
    # Basic logging fields
    dessert: Optional[str] = Field(None, max_length=200, description="Dessert ordered")
    price: Optional[Decimal] = Field(None, description="Price paid")
    # Detailed review fields
    atmosphere_rating: Optional[int] = Field(None, ge=1, le=5, description="Atmosphere rating (1-5)")
    parking_info: Optional[str] = Field(None, max_length=50, description="Parking availability info")
    acidity_rating: Optional[int] = Field(None, ge=0, le=10, description="Acidity intensity rating (0-10)")
    body_rating: Optional[int] = Field(None, ge=0, le=10, description="Body intensity rating (0-10)")
    sweetness_rating: Optional[int] = Field(None, ge=0, le=10, description="Sweetness intensity rating (0-10)")
    bitterness_rating: Optional[int] = Field(None, ge=0, le=10, description="Bitterness intensity rating (0-10)")
    aftertaste_rating: Optional[int] = Field(None, ge=0, le=10, description="Aftertaste intensity rating (0-10)")
    # Coffee & Taste advanced fields
    bean_origin: Optional[str] = Field(None, max_length=200, description="Coffee bean origin (e.g., Ethiopia, Colombia)")
    processing_method: Optional[str] = Field(None, max_length=50, description="Processing method (Washed, Natural, Honey, etc.)")
    roast_level: Optional[str] = Field(None, max_length=50, description="Roast level (Light, Medium, Medium-Dark, Dark)")
    extraction_method: Optional[str] = Field(None, max_length=200, description="Extraction method used")
    extraction_equipment: Optional[str] = Field(None, max_length=200, description="Equipment used for extraction (e.g., La Marzocco, Hario, Aeropress)")
    aroma_rating: Optional[int] = Field(None, ge=0, le=10, description="Aroma intensity rating (0-10)")
    # Space & Work Environment fields
    wifi_quality: Optional[str] = Field(None, max_length=500, description="WiFi quality description")
    wifi_rating: Optional[int] = Field(None, ge=1, le=5, description="WiFi rating (1-5)")
    outlet_info: Optional[str] = Field(None, max_length=500, description="Outlet availability and location information")
    furniture_comfort: Optional[str] = Field(None, max_length=500, description="Furniture comfort description (table height, chair comfort, etc.)")
    noise_level: Optional[str] = Field(None, max_length=500, description="Noise level description (decibels, conversation vs white noise, music genre/volume)")
    noise_rating: Optional[int] = Field(None, ge=1, le=5, description="Noise rating (1-5)")
    temperature_lighting: Optional[str] = Field(None, max_length=500, description="Temperature and lighting description (AC/heater strength, lighting for work)")
    facilities_info: Optional[str] = Field(None, max_length=500, description="Facilities information (bathroom location/cleanliness, gender separation, parking availability)")

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
    # Basic logging fields
    dessert: Optional[str] = None
    price: Optional[Decimal] = None
    # Detailed review fields
    atmosphere_rating: Optional[int] = None
    parking_info: Optional[str] = None
    acidity_rating: Optional[int] = None
    body_rating: Optional[int] = None
    sweetness_rating: Optional[int] = None
    bitterness_rating: Optional[int] = None
    aftertaste_rating: Optional[int] = None
    # Coffee & Taste advanced fields
    bean_origin: Optional[str] = None
    processing_method: Optional[str] = None
    roast_level: Optional[str] = None
    extraction_method: Optional[str] = None
    extraction_equipment: Optional[str] = None
    aroma_rating: Optional[int] = None
    # Space & Work Environment fields
    wifi_quality: Optional[str] = None
    wifi_rating: Optional[int] = None
    outlet_info: Optional[str] = None
    furniture_comfort: Optional[str] = None
    noise_level: Optional[str] = None
    noise_rating: Optional[int] = None
    temperature_lighting: Optional[str] = None
    facilities_info: Optional[str] = None
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
    # Basic logging fields
    dessert: Optional[str] = None
    price: Optional[Decimal] = None
    # Detailed review fields
    atmosphere_rating: Optional[int] = None
    parking_info: Optional[str] = None
    acidity_rating: Optional[int] = None
    body_rating: Optional[int] = None
    sweetness_rating: Optional[int] = None
    bitterness_rating: Optional[int] = None
    aftertaste_rating: Optional[int] = None
    # Coffee & Taste advanced fields
    bean_origin: Optional[str] = None
    processing_method: Optional[str] = None
    roast_level: Optional[str] = None
    extraction_method: Optional[str] = None
    extraction_equipment: Optional[str] = None
    aroma_rating: Optional[int] = None
    # Space & Work Environment fields
    wifi_quality: Optional[str] = None
    wifi_rating: Optional[int] = None
    outlet_info: Optional[str] = None
    furniture_comfort: Optional[str] = None
    noise_level: Optional[str] = None
    noise_rating: Optional[int] = None
    temperature_lighting: Optional[str] = None
    facilities_info: Optional[str] = None
    author_display_name: Optional[str] = None
    updated_at: Optional[datetime] = None

class CafeLogsResponse(BaseModel):
    """Response model for paginated coffee logs"""
    logs: List[CafeLogPublicResponse]
    total_count: int
    page: int
    page_size: int
    has_more: bool

