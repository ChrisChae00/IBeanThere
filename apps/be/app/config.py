from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    cors_origins: str = "http://localhost:3000"
    
    # Email notification settings
    resend_api_key: Optional[str] = None
    admin_email: str = "ibeanthere.app@gmail.com"
    
    # Google Places API
    google_places_api_key: Optional[str] = None
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into a list, handling wildcard"""
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
    
    @property
    def allow_credentials(self) -> bool:
        """Allow credentials only if not using wildcard"""
        return self.cors_origins.strip() != "*"
    
    @property
    def email_enabled(self) -> bool:
        """Check if email notifications are enabled"""
        return bool(self.resend_api_key)
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()