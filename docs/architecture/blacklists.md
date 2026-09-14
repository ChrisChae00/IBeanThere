# Admin blacklists

Admin deletion now retains a minimal cafe identity in `cafe_blacklist` and removes
the cafe and its dependent data in one transaction (`delete_cafe_with_history`).
This only records future dashboard deletions. Earlier deletions cannot be recovered
without a backup. Bulk maintenance purges do not automatically create blacklist entries.

The record contains name, address, coordinates, OSM/Google IDs, source URL, original
cafe ID, and deletion time. It contains no photos, logs, authors, or reviews.
Only the backend service role can access either blacklist table or the matching/deletion RPCs.

## Cafe re-registration and seeds

One SQL matcher is shared by the registration trigger and seed checks. A match is:

- the same nonempty OSM ID, Google Place ID, or source URL; or
- the same name after case/punctuation normalization, plus the same nonempty address
  or a location within approximately 50 metres.

Names alone and coordinates alone do not match. A renamed business without an external
ID can escape matching; an admin must review such cases. The location approximation
is intended for local cafe matching, not global geodesic calculations.

For a matched user registration, the insert trigger assigns `blacklist_history_id`,
forces `pending`, and clears admin verification. Both bean-drop verification routes
skip automatic approval for these rows; the DB trigger also enforces the hold.
Admin lists display “Previously blacklisted”. Explicit admin verification sets
`admin_verified=true` and permits `verified`, while retaining the historical link.
Removing the blacklist entry lifts seed exclusion and clears its link; it does not
automatically approve a pending cafe or restore deleted dependent data.

`seed_kw_reviewed.py`, `seed_real_cafes.py`, and `seed_with_google_places.py` call
`services/blacklists.py` before inserting (before enrichment too for reviewed KW).
A match is skipped; lookup failure stops the run. The insert trigger rejects matched
`app_seed` writes as a second guard. A concurrent deletion between precheck and insert
may therefore abort a seed batch; rerun after checking the failure. These scripts and
their `osm_fields.py` helper are now explicitly included in Git. Their earlier schema
prerequisites remain a separate deployment requirement.

## User moderation

The dashboard accepts an existing user's UUID and a required reason (up to 500 chars).
`watch` records a concern without restricting access; `blocked` denies authenticated
backend requests, including requests carrying an already-issued valid token. Changing
back to watch or removing the entry restores access. Admin accounts cannot be added.
This is account moderation, not automated bot classification or IP/device blocking.
Public browsing and registration of another account remain possible.

`get_current_user` checks the table before returning a user and returns 503 if the
check fails. Optional-auth endpoints fall back to their public response. The migration
adds restrictive policies to existing public RLS tables and Storage objects, so ordinary
authenticated Data API access also observes the block. These policies add no grants.
New RLS tables must add this policy too. Non-RLS tables, public storage URLs, and existing
SECURITY DEFINER RPCs are not secured by these policies and need their own access review.
Supabase Auth itself is not banned; the application rejects authenticated use.

## Admin API and search

All `/api/v1/admin/blacklists` endpoints require `require_admin_role`:

| Method | Path | Behavior |
|---|---|---|
| GET | `/cafes?page=1` | Newest deletion records; 50 per page |
| DELETE | `/cafes/{entry_id}` | Remove an exclusion; 204 |
| GET | `/users?page=1` | Most recently updated decisions; 50 per page |
| PUT | `/users/{user_id}` | Create/update `{status, reason}` |
| DELETE | `/users/{user_id}` | Lift decision; 204 |

The dashboard's Pending and All tabs use the paginated admin list with `q` matching
name/address, as the map search does. Input is debounced by 300 ms and filter syntax
is stripped server-side. Search spans the database, not just the current page.
`page >= 1`, `page_size <= 100`, `q <= 100` characters.

## Rollout and checks

Apply `apps/be/scripts/migrations/022_admin_blacklists.sql` through the Supabase SQL
editor **before deploying this backend**. It expects the existing `cafes`, `users`,
identity columns from 014, Supabase roles, and Storage schema. It is a transactional,
one-time migration; do not run it twice. Missing blacklist tables intentionally block
authenticated API use instead of allowing potentially blocked accounts through.
No production migration or deletion was executed during implementation.

Checks from `apps/be`:

```sh
.venv/bin/python -m unittest discover -s tests -p 'test_*.py'
.venv/bin/python scripts/seed_kw_reviewed.py self-check
# Empty disposable database only: creates its own roles and fixture schemas.
psql -v ON_ERROR_STOP=1 -f tests/check_blacklists.sql "$TEST_DATABASE_URL"
```

The SQL check verifies deletion/cascade, matching and nonmatching identities, seed
rejection, pending hold, explicit admin approval, RPC restrictions, and blocked/watch
RLS behavior. It uses a minimal local schema; existing production triggers and policies
still need a staging rehearsal. Verify the dashboard in both languages after applying
the migration to staging. Keep the blacklist data if rolling application code back;
coordinate rollback because older backends do not enforce user block checks.
