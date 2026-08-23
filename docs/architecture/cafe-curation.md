# Cafe Curation Rules

IBeanThere lists **local, independent cafes that serve coffee**. Two independent rules
enforce that, both at registration time and against data already stored. Neither rule
uses a hardcoded list of brand names, so they behave the same in Toronto, Chicago, or
Seoul.

Both rules read OpenStreetMap data that registration already fetches, so neither adds a
network round trip to the happy path.

## Rule 1 — No franchises

A brand is a franchise when it has **100 or more locations worldwide**
(`FRANCHISE_OUTLET_THRESHOLD` in `app/services/franchise_service.py`).

How a cafe's brand is determined, cheapest step first:

1. The OSM `brand` / `brand:wikidata` tags returned by the Nominatim reverse geocode
   that registration performs anyway (`extratags=1`).
2. Failing that, the submitted name, normalized (lowercased, whitespace stripped).

The outlet count comes from an Overpass `out count;` query, keyed on `brand:wikidata`
when available and on the exact name otherwise. Name-only counts are restricted to food
and drink venues — without that restriction, a local cafe named "The Link" is counted
against every unrelated place of that name in the world.

Counts are slow (10–20s for large brands, and Overpass does not short-circuit), so every
verdict is cached per brand in the `cafe_brands` table. After the initial purge warms
the cache, rejecting a chain costs one indexed read.

## Rule 2 — Coffee only

Bubble tea shops, tea houses and juice bars are rejected regardless of size. The signal
is the OSM `cuisine` tag (`app/services/venue_category.py`):

| Verdict | Condition |
|---|---|
| `coffee` | `cuisine` contains `coffee_shop`, `coffee`, or `coffee_roastery` |
| `excluded` | `cuisine` contains only `bubble_tea`, `tea`, `juice`, or `smoothie` |
| `unknown` | no `cuisine` tag |

`cuisine` is multi-valued (`breakfast;coffee_shop;sandwich`) and must be split on `;`.

**A coffee marker always wins.** A venue tagged both `bubble_tea` and `coffee_shop`
passes: the rule excludes places that do not serve coffee, not places that also serve
something else. Donut shops, bakeries and dessert cafes are kept — they serve coffee.

Measured coverage on 429 downtown Toronto `amenity=cafe` nodes: 49% `coffee_shop`, 30%
untagged, 10% `bubble_tea`, 3% `donut`. Of 25 sampled bubble tea chain locations, 24
carried `cuisine=bubble_tea`.

## Fail open

When either rule cannot reach a verdict — Overpass timed out, the venue is absent from
OSM — registration **succeeds** and the row is flagged for review. A brand-new
independent cafe having no OSM presence is normal, and rejecting it would turn away
exactly the users this app is for.

The one exception: when the map says nothing about cuisine, the registrant must tick
"this cafe serves coffee" on the form. That is self-declared and can be wrong, which is
what the admin override is for.

## Stored data

Migrations `010_add_franchise_classification.sql` and `011_add_venue_category.sql`.

| Column | Meaning |
|---|---|
| `cafes.brand_key` | normalized brand this cafe belongs to |
| `cafes.brand_status` | `local` \| `unknown` (franchises are deleted, never stored) |
| `cafes.serves_coffee` | `false` hides a venue an admin judged not to serve coffee |
| `cafes.category_source` | `osm` \| `self_declared` \| `admin` \| `unverified` |
| `cafes.venue_traits` | `TEXT[]`, GIN indexed — see below |
| `cafes.osm_tags` | raw OSM tags at match time |
| `cafe_brands` | per-brand outlet count cache + `admin_override` |

### venue_traits

Descriptive traits collected for **future** filtering. Nothing reads them yet.

`coffee`, `roastery` (`craft=coffee_roastery`), `sells_beans` (`shop=coffee`), `bakery`,
`dessert`, plus the exclusion markers (`bubble_tea`, `tea`, `juice`, `smoothie`).

Coverage is partial by nature — contributors tag what they care about — so a missing
trait means "unknown", not "no". A future filter such as "roasteries only" needs one
query clause (`.contains("venue_traits", ["roastery"])`) and no schema change.

## Admin overrides

Both verdicts are reversible without touching code, via `PATCH /cafes/admin/{cafe_id}`:

- `brand_override` — writes to `cafe_brands.admin_override`, applies to every location of
  that brand, and survives re-classification.
- `serves_coffee` — per cafe, sets `category_source='admin'`.

`GET /cafes/admin/all?brand_status=unknown` is the review queue for rows the algorithm
could not classify.

## Cafe identity

Two rows are the same cafe when they share an id we borrowed from someone else, or
when nothing else can tell them apart and they stand on the same spot. Three layers,
no id scheme of our own:

| Layer | What it stops | Where |
|---|---|---|
| Borrowed id | The same OSM node or Google place stored twice | `osm_id`, `google_place_id`, partial UNIQUE (migration 014) |
| Proximity | A second pin on a shop that has no external id | `check_nearby_cafes()`, 25 m, name ignored |
| On site | A pin dropped from across town | registration requires the user within 100 m |

`osm_id` is an OpenStreetMap **node** id and only the seed scripts write it. The
registration path does not store the osm_id from Nominatim's reverse geocode: that id
snaps to the building or the road, so two cafes in one building would claim it and
collide. `google_place_id` comes only from a server-side Places lookup — a
client-supplied id could squat the unique index on a place it does not own.

NULL in either column is normal, not a gap to backfill: a brand new local cafe is in
neither dataset. The UNIQUE indexes are partial (`WHERE ... IS NOT NULL`), so NULLs
never collide. `source_url` is unique too, which catches the same Google cid arriving
under two different URLs.

Rows with no external id are defended by proximity plus the on-site requirement: the
same coordinates cannot be claimed twice, and not remotely.

`app/services/cafe_dedupe.py` holds all of it — distance, the 25 m check, name
normalization, clustering and the survivor rule. Registration, both seed scripts and
`dedupe_cafes.py` import from there. When each of them had its own version, the seeds
inserted rows registration would have rejected, which is what produced the pairs the
cleanup removed. Add a rule there, not in a caller.

Cleanup is deliberately stricter than insertion: it merges two rows only on a shared
id, identical coordinates, or a **similar name within 50 m**. Distance alone would
merge two different shops in one building (Contrabean and KW Coffee Collective are
~22 m apart and both real). Those pairs stay; a new registration between them is still
rejected at 25 m. The asymmetry is on purpose — it never splits an existing cafe in two.

### What the next confirm rework does with these columns

Today a `pending` cafe becomes `verified` after three different users drop a bean
there, which says people showed up, not that the place exists. The next rework asks
Google or OSM whether a pending row is a real venue: a hit stores the id and confirms
it, a miss goes to a review queue, and the three-person condition goes away. This
change only opens the columns; it does not build that pipeline, and it does not
backfill ids onto existing rows.

## Maintenance scripts

`apps/be/scripts/` (not tracked in git):

- `purge_franchise_cafes.py` — sweeps OSM by region, matches rows to nodes by proximity
  and name, applies both rules, and records traits on survivors. Dry run by default;
  `--apply` hard-deletes, cascading to that cafe's reviews, check-ins, bean drops and
  collection entries. Region sweeps and outlet counts are cached to disk between runs.
- `dedupe_cafes.py` — clusters duplicate cafes with the shared rules above and deletes
  the losers. Dry run by default. The survivor is the row with dependent data, then the
  one with an image, then the older one; a loser that has beans or visits of its own is
  printed for a manual merge, never deleted. Run it with `--apply` **before** applying
  `migrations/014_cafe_identity_uniques.sql` — nine existing pairs share a `source_url`
  and would fail that unique index.
- `dedupe_nearby_cafes.sql` — superseded by `dedupe_cafes.py`, kept for reference. Do
  not run it: it recreates the view and SECURITY DEFINER helper migration 013 dropped.
- `test_cafe_dedupe.py` — the identity rules, no DB needed.
- `test_franchise_classifier.py`, `test_venue_category.py` — the classifier checks.

Overpass rate-limits aggressively and will refuse a host that queries too hard; the
caches exist for that reason. Prefer one batched sweep over per-row lookups.

## Known limits

- The threshold catches chains by OSM presence, not legal structure. Country Style (79
  OSM locations) is a franchise that passes; a 100-location specialty roaster would be
  rejected. `FRANCHISE_OUTLET_THRESHOLD` is one constant.
- Venues absent from OSM cannot be classified at all. Seven bubble tea rows had to be
  removed by hand during the initial purge for this reason.
- `roastery` coverage in OSM is thin. Trustworthy roastery filtering needs a
  human-entered path, not just map tags.
