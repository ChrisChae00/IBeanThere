from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum

class ErrorCode(str, Enum):
    """Standard error codes for API responses."""
    
    # Authentication errors (401)
    INVALID_TOKEN = "INVALID_TOKEN"
    EXPIRED_TOKEN = "EXPIRED_TOKEN"
    MISSING_TOKEN = "MISSING_TOKEN"
    
    # Authorization errors (403)
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
    NOT_RESOURCE_OWNER = "NOT_RESOURCE_OWNER"
    ADMIN_ONLY = "ADMIN_ONLY"
    
    # Validation errors (400)
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    INVALID_COORDINATES = "INVALID_COORDINATES"
    DISTANCE_TOO_FAR = "DISTANCE_TOO_FAR"
    LOCATION_ACCURACY_LOW = "LOCATION_ACCURACY_LOW"
    
    # Resource errors (404)
    CAFE_NOT_FOUND = "CAFE_NOT_FOUND"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    VISIT_NOT_FOUND = "VISIT_NOT_FOUND"
    REVIEW_NOT_FOUND = "REVIEW_NOT_FOUND"
    
    # Conflict errors (409)
    DUPLICATE_CHECK_IN = "DUPLICATE_CHECK_IN"
    DUPLICATE_REVIEW = "DUPLICATE_REVIEW"
    USERNAME_TAKEN = "USERNAME_TAKEN"
    
    # Server errors (500)
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"

class ErrorDetail(BaseModel):
    """Detailed error information."""
    field: Optional[str] = None
    message: str
    value: Optional[Any] = None

class ErrorResponse(BaseModel):
    """Standard error response model."""
    error_code: ErrorCode
    message: str
    details: Optional[list[ErrorDetail]] = None
    request_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "error_code": "DISTANCE_TOO_FAR",
                "message": "Check-in location too far from cafe",
                "details": [
                    {
                        "field": "distance",
                        "message": "Distance is 75m, must be within 50m",
                        "value": 75
                    }
                ]
            }
        }

def create_error_response(
    error_code: ErrorCode,
    message: str,
    details: Optional[list[ErrorDetail]] = None
) -> Dict[str, Any]:
    """Create a standardized error response."""
    return ErrorResponse(
        error_code=error_code,
        message=message,
        details=details
    ).model_dump()

