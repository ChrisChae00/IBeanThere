import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import router as api_v1_router

# Load .env file from apps/be directory
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"DEBUG: Loaded .env from {env_path}")
else:
    print(f"DEBUG: .env file not found at {env_path}")

# Debug: print loaded env vars
print(f"DEBUG: GOOGLE_MAPS_API_KEY in env: {os.getenv('GOOGLE_MAPS_API_KEY', 'NOT SET')}")

app = FastAPI(title="IBeanThere API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_v1_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "IBeanThere API", "version": "1.0.0"}