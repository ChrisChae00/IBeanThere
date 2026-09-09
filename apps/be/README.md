# ibeanthere Backend (FastAPI)

- Run dev: `uvicorn app.main:app --reload`
- Health: GET /health -> {"status":"ok"}
- API docs: http://localhost:8000/docs

## Migrations

Admin blacklist support requires migration 022 before backend deployment. See
[blacklist rollout and checks](../../docs/architecture/blacklists.md) for deletion
history, seed exclusion, re-registration review, and account restrictions.

Numbered SQL files in `scripts/migrations/`, applied by hand through the Supabase SQL
editor in dependency order. Latest checked-in migration: `022_admin_blacklists.sql`.

The trait workflow requires the base `cafe_trait_observations` table (migration 017),
then `019_trait_suggestions.sql` (`status` and pending queue index), then
`020_trait_note.sql` (optional note, at most 200 characters). Earlier prerequisites
including 017 remain local-only; a fresh checkout is not a complete database bootstrap.
Migration 018 is a badge backfill to run after the planned purge, not before it.
SQL files being committed does not establish that a database has applied them.

Migration 015 adds the atomic monthly reservation guard for the disabled-by-default
Google Place Photo card fallback. Apply it before enabling the backend flag. Full
configuration, backfill, rollout, monitoring, and rollback instructions are in
[Google Place Photo card fallback](../../docs/architecture/google-place-photo-fallback.md).

## Cafe curation

Registration classifies brands but no longer rejects franchises. It still rejects
non-coffee venues (bubble tea, tea houses, juice bars), judged from OpenStreetMap data.
Logic lives in `app/services/franchise_service.py` and
`app/services/venue_category.py`; the rules, thresholds and admin overrides are
documented in [Cafe Curation Rules](../../docs/architecture/cafe-curation.md).

Cafe-page trait submissions wait for admin approval; registration and log creation
can write approved observations directly. These paths have different validation:
log creation does not prove physical presence or enforce purchase mode for
`sells_beans`. See the [security audit](../../docs/security-audit-2026-09-09.md).

## Cafe identity

A cafe is identified by ids borrowed from elsewhere — `osm_id`, `google_place_id`,
`source_url` — each with a partial UNIQUE index, plus a 25 m proximity check for rows
that have none. All of it lives in `app/services/cafe_dedupe.py`; registration, both
seed scripts and `scripts/dedupe_cafes.py` share it. Rationale and the rules are in
[docs/architecture/cafe-curation.md](../../docs/architecture/cafe-curation.md).

Checks (no pytest):

```bash
python scripts/test_venue_category.py
python scripts/test_franchise_classifier.py       # add --live to hit Overpass
python scripts/test_cafe_dedupe.py                # identity rules, no DB
.venv/bin/python -m unittest discover -s tests -p 'test_*.py' -v
```

Run these from `apps/be` with dependencies and required Supabase settings available.
The unittest suite uses fake clients/mocks; it does not validate production RLS or
SQL application. At commit `4f95bfe`, all 59 unittest tests passed in the project venv.
