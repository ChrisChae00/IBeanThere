from pydantic_settings import BaseSettings
    
class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    cors_origins: str = "http://localhost:3000"
    google_maps_api_key: str = ""
    google_places_cache_ttl: int = 2592000  # 30 days in seconds
    
    class Config:
        env_file = ".env"

settings = Settings()