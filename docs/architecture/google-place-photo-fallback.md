# Google Place Photo card fallback

## Status and activation gate

The code is present but **disabled by default**. It must stay disabled until all of
these are true:

1. `015_google_photo_usage.sql` is applied and its reservation function is verified.
2. The Place ID backfill dry-run is reviewed, then the approved rows are applied.
3. Terms and Privacy wording has completed legal review for the Canadian billing
   account and the links still point to the current Google policies.
4. Current Google pricing and free usage caps are checked immediately before rollout.
5. Frontend card behavior is checked in both locales, all four themes, and the target
   viewport sizes.

This repository change does not apply the production migration, run the paid APIs, or
turn on the feature flag.

## Why this exists

Explore cards without community or owner photos currently fall back to the coffee
logo. A Google photo can make the first discovery view more useful, but it introduces
billing, attribution, privacy, caching, and map-content restrictions that do not apply
to first-party photos.

The fallback is therefore deliberately narrow:

- only `TrendingCafeCard` and `CafeGridCard` on the explore page;
- never cafe detail, gallery, collection, share, or OpenStreetMap surfaces;
- at most three unique cafes per browser page session by default;
- at most 900 reserved Place Photo media requests per Pacific Time billing month;
- disabled unless the backend feature flag is explicitly enabled.

The initial planning inventory found 302 image-less cafes. Treat that as a historical
estimate: recount production rows before running a backfill.

## Image priority and request flow

The priority is fixed:

1. cafe or administrator `main_image` / legacy `image`;
2. newest public `cafe_visits.photo_urls` image;
3. Google Place Photo;
4. existing coffee-logo placeholder.

`ExploreMapClient` walks the rendered order once per page session: trending cafes
first, then the grid. It deduplicates IDs shared by both sections and never allocates
more than `NEXT_PUBLIC_GOOGLE_PLACE_PHOTO_PER_PAGE_LIMIT` requests, even after filters
or location change.

For an allocated cafe, `GET /api/v1/cafes/{cafe_id}/google-photo` does the following:

1. Re-reads the cafe and public visit photos from Supabase. If a first-party or
   community image now exists, it returns `204` without calling Google.
2. Returns `204` when `google_place_id` is absent.
3. Requests Place Details with the `id,photos` field mask and chooses the first photo.
4. Returns `204` unless that photo has its individual `googleMapsUri` source link.
5. Atomically reserves one monthly media slot in PostgreSQL.
6. Calls Place Photo `getMedia` once with `800x600` bounds and
   `skipHttpRedirect=true`.
7. Returns the short-lived image URI, the individual source URI, provider name, and
   normalized author attribution. Endpoint-generated responses set
   `Cache-Control: no-store`.

Google failures return `502`; an exhausted monthly cap returns
`429 PHOTO_MONTHLY_CAP_REACHED`; missing photos return `204`. The frontend treats all
three as a quiet placeholder fallback.

## Attribution and card interaction

Google images use a native lazy `<img>` with async decoding. They do not pass through
Next Image's long-lived optimization cache. Photo names, media URIs, attribution, and
image bytes are not written to Supabase or a project CDN.

Every displayed Google photo has a persistent `Google Maps` source pill linked to that
photo's `googleMapsUri`, not a generic cafe map URL. The visible pill is 28 px high;
its link has at least a 44x44 px hit area, a keyboard focus ring, localized accessible
name, and an SVG external-link icon. The cafe detail link, source link, and Drop Bean
button are siblings rather than nested interactive elements.

Author names are not added to the compact card. The design relies on Google's
thumbnail-space exception and the direct source link for the larger source view and
full author information; re-check that policy interpretation during legal review.

The pill uses only `--scrim-media`, `--ink-on-media`, and `--radius-pill`, so it keeps
the existing Morning Coffee, Espresso, Matcha Latte, and Vanilla Latte semantics.

## Configuration

Backend:

```env
GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_PHOTO_ENABLED=false
GOOGLE_PLACE_PHOTO_MONTHLY_CAP=900
```

Frontend:

```env
NEXT_PUBLIC_GOOGLE_PLACE_PHOTO_PER_PAGE_LIMIT=3
```

The frontend value must be an integer from `0` through `12`; an invalid value fails
the build. Changing it requires a frontend redeploy. Set it to `0` to stop new browser
requests without changing code. The backend flag is the authoritative kill switch.

The endpoint also has an IP limit of 12 requests per minute in addition to the global
API limit.

## Database migration and hard cap

Apply `apps/be/scripts/migrations/015_google_photo_usage.sql` through the Supabase SQL
editor after migration 014. It creates:

- `google_api_usage(sku, billing_month, reserved_count, updated_at)`;
- `reserve_google_api_slot(...)`, a service-role-only conditional upsert.

The row update is the concurrency boundary. Reservation 900 succeeds; reservation 901
returns `0`. A failed Google media request is not refunded, so transient failures
cannot reopen billable capacity. Billing month keys use `America/Los_Angeles`, matching
Google's Pacific Time reset. Threshold logs are emitted once at 720, 810, and 900.

The application counter covers the `getMedia` slot it reserves. Place Details requests
using the `photos` field can appear under a separate Places SKU. Compare both the local
counter and the relevant Place Details Photos / Place Photo usage in Google Cloud
Console; do not treat the database count as the billing source of truth.

Google pricing is mutable. The implementation chose 900 below the 1,000-request free
cap visible during development, but rollout must re-check the
[official pricing table](https://developers.google.com/maps/billing-and-pricing/pricing).

## Place ID backfill

The backfill is intentionally not a photo job. It stores only a verified Place ID:

```bash
cd apps/be

# Dry-run is the default. --limit is required and bounds candidate cafe rows.
.venv/bin/python scripts/backfill_google_place_ids.py --limit 302

# Run only after reviewing every emitted cafe/place/distance mapping and aggregates.
.venv/bin/python scripts/backfill_google_place_ids.py --limit 302 --apply
```

The script selects cafes with no Google Place ID and no cafe-owned image, removes cafes
with public visit photos, then:

1. uses Text Search with the IDs-only field mask;
2. requests only `id,location` for the first candidate;
3. applies the shared 100 m earth-distance rule;
4. rejects duplicate Place IDs, missing results, over-distance matches, and API errors;
5. prints each accepted mapping and aggregate counts;
6. writes only `cafes.google_place_id` when `--apply` is present.

It never requests or stores photos, photo resource names, author data, or media URIs.
Text Search IDs-only and Place Details have separate pricing categories, so confirm
available quota before the apply run even though the expected batch is small.

## Legal and privacy constraints

- Google content is owned by Google or its third-party rights holders; IBeanThere does
  not claim ownership.
- The source pill must continue to link directly to each photo's `googleMapsUri`.
- Do not download, proxy, re-host, persist, or feed Google photos into Next Image.
- Do not pass this content into Leaflet, the OSM map, or map modals.
- Place ID requests go to Google, and the browser connects to Google's image host,
  exposing IP and browser information as described in the Privacy Policy.
- Review the current [Places policies](https://developers.google.com/maps/documentation/places/web-service/policies),
  [Place Photos documentation](https://developers.google.com/maps/documentation/places/web-service/place-photos),
  and [Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms)
  before enabling production.

## Rollout, monitoring, and rollback

Roll out in this order:

1. Apply migration 015 and deploy the backend with the feature flag off.
2. Run and review the Place ID dry-run; apply only approved matches.
3. Complete legal review of the English and Korean Terms and Privacy changes.
4. Deploy the frontend with a page limit of 3.
5. Enable the backend flag.
6. For 48 hours, watch local reservations, both Google Cloud SKUs, success rate, and
   p50/p95 latency.

Turn the backend flag off if, after 100 requests, endpoint 5xx exceeds 5% or p95 exceeds
2 seconds. If projected monthly use exceeds 900, redeploy the frontend limit as `1` or
`0`. At 900 reservations the backend automatically returns placeholders.

Rollback needs no schema reversal: set `GOOGLE_PLACE_PHOTO_ENABLED=false`. Optionally
set the frontend limit to `0` on the next deploy. Stored Place IDs and usage rows are
safe to retain; short-lived photo data was never persisted.

## Verification

No automated test contacts Google. Run:

```bash
cd apps/be
.venv/bin/python -m unittest discover -s tests -p 'test_*google_place*.py' -v
.venv/bin/python scripts/test_cafe_dedupe.py

cd ../fe
npm run build
```

The unit checks cover image precedence, source-link requirements, attribution mapping,
no-store responses, cap failure behavior, Pacific month boundaries, and the 100 m
backfill edge. During implementation, migration 015 was also applied to an isolated
temporary PostgreSQL instance: reservation 900 succeeded, 901 failed, and concurrent
requests stopped exactly at the configured cap.

Before production activation, manually verify Korean and English across all themes at
375 px, 768 px, and desktop widths; keyboard focus order; source-pill isolation from
the cafe link; duplicate cafe request sharing; and slow/204/429/502 fallbacks.
