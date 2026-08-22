# IBeanThere Backend (FastAPI)

- Run dev: `uvicorn app.main:app --reload`
- Health: GET /health -> {"status":"ok"}
- API docs: http://localhost:8000/docs

## Migrations

Numbered SQL files in `scripts/migrations/`, applied by hand through the Supabase SQL
editor in order. Latest: `011_add_venue_category.sql`.

## Cafe curation

Registration rejects franchises (100+ locations worldwide) and non-coffee venues
(bubble tea, tea houses, juice bars), judged from OpenStreetMap data rather than a
hardcoded brand list. Logic lives in `app/services/franchise_service.py` and
`app/services/venue_category.py`; the rules, thresholds and admin overrides are
documented in [docs/architecture/cafe-curation.md](../../docs/architecture/cafe-curation.md).

Classifier checks (no pytest, plain scripts):

```bash
python scripts/test_venue_category.py
python scripts/test_franchise_classifier.py       # add --live to hit Overpass
```
