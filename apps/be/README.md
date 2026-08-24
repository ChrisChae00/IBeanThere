# IBeanThere Backend (FastAPI)

- Run dev: `uvicorn app.main:app --reload`
- Health: GET /health -> {"status":"ok"}
- API docs: http://localhost:8000/docs

## Migrations

Numbered SQL files in `scripts/migrations/`, applied by hand through the Supabase SQL
editor in order. Latest: `014_cafe_identity_uniques.sql`.

## Cafe curation

Registration rejects franchises (100+ locations worldwide) and non-coffee venues
(bubble tea, tea houses, juice bars), judged from OpenStreetMap data rather than a
hardcoded brand list. Logic lives in `app/services/franchise_service.py` and
`app/services/venue_category.py`; the rules, thresholds and admin overrides are
documented in [docs/architecture/cafe-curation.md](../../docs/architecture/cafe-curation.md).

## Cafe identity

A cafe is identified by ids borrowed from elsewhere — `osm_id`, `google_place_id`,
`source_url` — each with a partial UNIQUE index, plus a 25 m proximity check for rows
that have none. All of it lives in `app/services/cafe_dedupe.py`; registration, both
seed scripts and `scripts/dedupe_cafes.py` share it. Rationale and the rules are in
[docs/architecture/cafe-curation.md](../../docs/architecture/cafe-curation.md).

Checks (no pytest, plain scripts):

```bash
python scripts/test_venue_category.py
python scripts/test_franchise_classifier.py       # add --live to hit Overpass
python scripts/test_cafe_dedupe.py                # identity rules, no DB
```
