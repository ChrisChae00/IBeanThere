from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    cors_origins: str = "http://localhost:3000"
    
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
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()