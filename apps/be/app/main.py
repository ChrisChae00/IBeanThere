import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from app.config import settings
from app.core.rate_limit import limiter
from app.api.v1.router import router as api_v1_router

# Load .env file from apps/be directory
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

app = FastAPI(title="ibeanthere API", version="2.0.0")

app.state.limiter = limiter
# slowapi types its handler for RateLimitExceeded; Starlette's stub wants one for any Exception.
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # pyright: ignore[reportArgumentType]
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.allow_credentials,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Must stay the last middleware added, so it is the outermost one: everything
# that keys off the client address (the rate limiter, the cafe view throttle)
# reads scope["client"] after this has replaced the proxy address with the real
# client. Only forwarded headers from settings.trusted_proxy_ips are honoured.
# uvicorn and Starlette declare their own ASGI types, which pyright cannot match.
app.add_middleware(
    ProxyHeadersMiddleware,  # pyright: ignore[reportArgumentType]
    trusted_hosts=settings.trusted_proxy_ips_list,  # pyright: ignore[reportCallIssue]
)

# Include API v1 router
app.include_router(api_v1_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "ibeanthere API", "version": "1.0.0"}
