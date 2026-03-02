# Backend Repository Structure

```
apps/be/
├── .env                # Environment variables
├── README.md           # Backend documentation
├── requirements.txt    # Python dependencies
├── scripts/            # Initialization and utility scripts
└── app/
    ├── __init__.py
    ├── main.py         # FastAPI app entry point
    ├── config.py       # Configuration settings
    ├── api/
    │   ├── __init__.py
    │   ├── deps.py     # API dependencies (auth, db state, etc.)
    │   └── v1/         # API version 1
    │       ├── __init__.py
    │       ├── auth.py
    │       ├── cafes.py
    │       ├── collections.py
    │       ├── community.py
    │       ├── reports.py
    │       ├── router.py
    │       ├── users.py
    │       └── visits.py
    ├── core/           # Core logics and utilities
    ├── database/       # Database connections and configs
    ├── models/         # Pydantic data models
    └── services/       # Business logic layer
```

## Key Features:

- **FastAPI Framework** utilizing the robust ASGI structure
- **Clean Architecture** with clear separation of concerns (API routers, business logic services, data models)
- **API versioning** (v1 currently active)
- **Supabase Integration** for authentication and database management (if applicable to the core infrastructure)
- **Environment-based** dependency and secret management
