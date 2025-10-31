from pydantic_settings import BaseSettings
    
class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    cors_origins: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields in .env (e.g., old Google settings)

settings = Settings()