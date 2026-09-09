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
- **Cafe curation** classifies brands without rejecting franchises and rejects non-coffee venues — see [Cafe Curation Rules](./cafe-curation.md)
- **Trait suggestions** use `services/traits.py` for approved-only aggregation and note cleanup, with admin review endpoints in `api/v1/cafes.py`.
- **Coffee logs and badges** use `services/coffee_logs.py` for public log projections and `services/badges.py` for shared badge awards. Log creation handles an absent `cafe_beans` row with `limit(1)` before inserting the first drop.

## Database Migrations

Numbered SQL files in `apps/be/scripts/migrations/`, applied by hand through the Supabase
SQL editor. Latest checked-in file: `020_trait_note.sql`. Trait suggestions require
the base table from 017, followed by 019 and 020. The full bootstrap is not tracked;
see [backend migration notes](../../apps/be/README.md#migrations).

Migration 015 and its endpoint support an optional, disabled-by-default Google
photo fallback for explore cards. See [Google Place Photo card fallback](./google-place-photo-fallback.md)
for the data flow, billing guard, backfill, and activation gates.
