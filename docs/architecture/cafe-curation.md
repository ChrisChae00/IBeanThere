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

## Maintenance scripts

`apps/be/scripts/` (not tracked in git):

- `purge_franchise_cafes.py` — sweeps OSM by region, matches rows to nodes by proximity
  and name, applies both rules, and records traits on survivors. Dry run by default;
  `--apply` hard-deletes, cascading to that cafe's reviews, check-ins, bean drops and
  collection entries. Region sweeps and outlet counts are cached to disk between runs.
- `dedupe_nearby_cafes.sql` — same-name rows within 50 m.
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
