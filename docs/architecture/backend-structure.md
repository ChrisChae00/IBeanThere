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
        ├── email.py
        ├── franchise_service.py   # Brand size lookup (OSM/Overpass) + verdict cache
        ├── google_places_service.py
        ├── osm_service.py         # Nominatim geocoding
        └── venue_category.py      # Coffee vs tea/juice, descriptive traits
```

## Key Features:

- **FastAPI Framework** utilizing the robust ASGI structure
- **Clean Architecture** with clear separation of concerns (API routers, business logic services, data models)
- **API versioning** (v1 currently active)
- **Supabase Integration** for authentication and database management (if applicable to the core infrastructure)
- **Environment-based** dependency and secret management
- **Algorithmic cafe curation** rejecting franchises and non-coffee venues at registration — see [Cafe Curation Rules](./cafe-curation.md)

## Database Migrations

Numbered SQL files in `apps/be/scripts/migrations/`, applied by hand through the Supabase
SQL editor. Latest: `015_google_photo_usage.sql`.

The latest migration and its endpoint support an optional, disabled-by-default Google
photo fallback for explore cards. See [Google Place Photo card fallback](./google-place-photo-fallback.md)
for the data flow, billing guard, backfill, and activation gates.
