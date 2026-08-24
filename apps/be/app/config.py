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

    # Reverse proxies whose X-Forwarded-For we trust. Render only reaches the
    # container through its load balancer, so trusting private ranges is enough.
    # No wildcard here on purpose: uvicorn takes the leftmost, client-writable
    # X-Forwarded-For entry when every host is trusted, which lets anyone pick
    # their own rate-limit key.
    trusted_proxy_ips: str = "127.0.0.1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into a list, handling wildcard"""
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
    
    @property
    def trusted_proxy_ips_list(self) -> List[str]:
        """Parse trusted proxy addresses/networks into a list"""
        return [ip.strip() for ip in self.trusted_proxy_ips.split(",") if ip.strip()]

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