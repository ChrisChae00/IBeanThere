# Cafe Curation Rules

> **Partly implemented — read this before the sections below.** See
> `docs/product/direction.md` (local-only, not tracked in this repo) for the rationale.
>
> **Done:**
>
> - **Rule 1 (no franchises) is retired.** Registration still classifies the brand and
>   still stores `brand_status`, but no longer rejects on it. The bar is now "can this
>   cafe name its roaster", applied per location, and `brand_status` is a display /
>   admin-review hint only. Rule 2 (coffee only) is unchanged and still rejects.
> - **A three-trait observation model is live** (`sells_beans`, `roasts_on_site`,
>   `filter_coffee`): dated yes/no observations with a source, in
>   `cafe_trait_observations`. It is what the map filters and the cafe page read.
>
> **Still to do:**
>
> - **`venue_traits` demotion.** It is now a raw OSM hint that nothing user-facing
>   reads, but the column and its collection are untouched. OSM's `roastery` tag is
>   deliberately not converted into an observation — being tagged roastery-adjacent
>   does not mean the cafe roasts on site.
> - **The seed pipeline redo**, as an export/review/import cycle.
>
> Sections below still describe the code as it stands; the ones this block contradicts
> are flagged inline. The document is rewritten once the rest lands (the plan's Phase 8).

IBeanThere lists **cafes that serve coffee**. One rule enforces that at registration
time and against data already stored; a second, described below, used to reject
franchises and no longer does. Neither uses a hardcoded list of brand names, so they
behave the same in Toronto, Chicago, or Seoul.

Both rules read OpenStreetMap data that registration already fetches, so neither adds a
network round trip to the happy path.

## Trait suggestions (commit `4f95bfe`)

The three traits are `sells_beans`, `filter_coffee`, and `roasts_on_site`.
Only approved observations contribute to summaries and map flags; the service also
filters pending rows so callers cannot accidentally publish them.

| Surface | Stored status | Actual gate |
|---|---|---|
| Cafe-page suggestion | `pending` | Signed-in user; admin approval before aggregation |
| Registration or existing-cafe check-in | `approved` | Registration distance check using submitted coordinates |
| Purchase log with a check-in inside the 50m gate | `approved` | `mode == "purchase"` plus a server-computed distance |
| Any other log with `sells_beans` present | `pending` | Signed-in user; admin approval before aggregation |
| Reviewed seed row | `pending` | Researched from the shop's own pages; admin approval before aggregation |

The purchase form sends `sells_beans`, initially checked. Unchecking it submits
`false`, which is a negative observation, not an opt-out. The backend accepts this
field on drink creation too, and the UI restriction is not a security boundary — so the
log path decides the status from evidence rather than from the field being present. The
distance it reads is the one the endpoint computes from the cafe's stored coordinates,
never the `distance_meters` in the request body. Everything the form sends today lacks
coordinates, so in practice a log's answer is a suggestion and reaches the admin queue.
This closes SEC-07 in the [security audit](../security-audit-2026-09-09.md).

### Seeded claims are suggestions with their working attached

A seeded row used to be `approved` on the grounds that a person had reviewed the import
spreadsheet before it reached the database. That is no longer where the review happens:
the answers are now researched from each shop's own pages and confirmed afterwards in
the admin queue, so migration 021 drops the constraint that forbade a pending seed row
and adds `evidence`.

`evidence` is admin-only and never leaves the review endpoint. It holds the URL and the
sentence that produced the answer, and unlike `note` it is kept on a "no" as well — the
reason for "roasts on site: no" is exactly what an approver wants to read. `note` stays
public and answers the reader's next question ("which beans?"). Merging the two would
either publish working notes or throw away the only thing that makes an unattended
claim checkable.

Two rules the research follows, both learned by getting them wrong first:

- **Directory sites are not evidence.** Aggregators print the same paragraph under every
  listing, so unrelated cafes come back claiming the same thing in the same words.
- **A blank answer is a real answer.** Unknown is not "no", and the map filter treats it
  as "not this one" rather than publishing a negative. Nothing is inferred from a cafe's
  name.

Paths below have the `/api/v1` prefix:

| Method and path | Contract |
|---|---|
| `GET /cafes/{cafe_id}/traits` | Approved summaries, with viewer-specific `mine` |
| `POST /cafes/{cafe_id}/traits/{trait}` | Returns `{submitted: true, traits: [...]}`; submission does not change the summary |
| `DELETE /cafes/{cafe_id}/traits/{trait}` | Withdraws the caller's observations, including pending rows |
| `GET /cafes/traits/suggestions` | Admin only; oldest 300 pending rows with the cafe's address, website and coordinates, plus username, note, source and evidence |
| `POST /cafes/traits/suggestions/{id}/approve` | Admin only; updates a pending row in place; 404 if absent or already reviewed |
| `DELETE /cafes/traits/suggestions/{id}` | Admin only; deletes a pending row |

Notes are limited to 200 characters and retained only for positive `sells_beans` or
`filter_coffee` observations. The summary uses the current observation's note.
Migrations 019 and 020 add status and note constraints after the base table in 017; 021
allows a pending seed row and adds `evidence` (500 characters). The queue has no
pagination beyond its first 300 rows and these writes have no dedicated abuse limit.
Approval is moderation, not proof of a visit or purchase.

The admin queue groups claims by cafe rather than listing them flat: a seeded cafe
arrives with up to three at once and they are one decision, not three. Each group
carries the shop's website and a Google Maps link built from its name and address —
never from bare coordinates, which resolve to an unnamed pin and tell a reviewer
nothing.

## Rule 1 — No franchises (retired)

> **No longer rejects.** Registration runs this classification and stores the verdict
> in `brand_status`; nothing turns a cafe away on it. What follows describes how the
> verdict is still computed.

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
| `cafes.brand_status` | Brand classification, including `franchise`; a review/display hint, not a registration rejection |
| `cafes.serves_coffee` | `false` hides a venue an admin judged not to serve coffee |
| `cafes.category_source` | `osm` \| `self_declared` \| `admin` \| `unverified` |
| `cafes.venue_traits` | `TEXT[]`, GIN indexed — see below |
| `cafes.osm_tags` | raw OSM tags at match time |
| `cafe_brands` | per-brand outlet count cache + `admin_override` |

### venue_traits

> **Demoted.** What a reader sees comes from `cafe_trait_observations` instead. These
> stay as a raw OSM hint that no user-facing query reads. What follows is how they are
> still collected.

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

## Temporarily closed

A shop that is shut for now but not gone — a renovation, a family emergency, a seasonal
break. Deleting it would take its logs, beans and badges with it, and leaving it as-is
sends people to a locked door.

An admin ticks it in the cafe edit form, beside the opening hours. It is stored as
`temporarily_closed: true` **inside the `business_hours` JSON**, not in a column of its
own: `business_hours` is already an opaque blob the API passes straight through, so the
whole feature cost no migration and no backend change.

The consequences of that choice, all in `apps/fe/src/lib/utils/businessHours.ts`, which
is the only module that names the key:

- `isOpenNow` returns false whatever the timetable says.
- The cafe page and the map card drop the timetable and show the state instead — a
  reader deciding whether to walk over does not need Tuesday's hours to know the door is
  locked. The map pin is smaller, faded and struck through; per the marker rules it stays
  distinguishable without colour.
- `dayHourEntries`/`hasDayHours` exist because `Object.keys(business_hours).length > 0`
  was the test for "are there hours to show", and the flag alone would have answered yes
  and rendered an empty panel.
- Clearing it deletes the key rather than storing `false`. Absence already means "open as
  usual", and a stored `false` reads like a decision somebody made.

**The flag shares a blob with the days, so anything that replaces `business_hours`
wholesale drops it.** The admin's Google Maps lookup does exactly that, and now carries
the flag across the merge — the admin's statement about the shop outranks Google's
timetable, and if Google is right that it is trading again the tick box is right there.
Any future path that overwrites `business_hours` has to do the same, which is the price
of not having given this a column. `scripts/check-business-hours.ts` pins the behaviour.

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

NULL in either column is normal: a brand new local cafe may be in neither dataset. The
photo fallback has one narrow exception: its administrator script attempts to backfill
`google_place_id` only for existing cafes that have no cafe or public visit image. It
does not make an external ID mandatory or perform a general identity backfill. See
[Google Place Photo card fallback](./google-place-photo-fallback.md). The UNIQUE indexes
are partial (`WHERE ... IS NOT NULL`), so NULLs never collide. `source_url` is unique too,
but only against the identical string —
two different URLs pointing at one place are caught by `google_place_id`, not here.
It is stored only when a server-side lookup resolved the submitted URL to a place
within 100 m of the coordinates being registered; otherwise the row keeps no URL at
all. Without that check any user could register a throwaway cafe carrying a real
cafe's URL and permanently block that cafe's own registration on the unique index.

Rows with no external id are defended by proximity plus the on-site requirement: the
same coordinates cannot be claimed twice, and not remotely.

`app/services/cafe_dedupe.py` holds the shared rules — distance, the 25 m check, name
normalization, clustering and the survivor rule. Registration, both seed scripts and
`dedupe_cafes.py` import from there. The module itself implements the proximity layer;
the borrowed-id layer is enforced by the unique indexes, and the seed scripts also
check the ids they already hold in memory to save a round trip. When each caller had
its own notion of "duplicate", the seeds inserted rows registration would have
rejected, which is what produced the pairs the cleanup removed. Add a rule there, not
in a caller.

A failed proximity check raises rather than returning "nothing nearby", and
registration answers 503. A duplicate that slips past it anyway lands on a unique
index, and that comes back as a 409 naming the existing cafe.

Cleanup is deliberately stricter than insertion: no pair of rows is merged on
distance alone — a shared id, or a similar name within 50 m. Two different shops can
sit at the same coordinates (KW Coffee Collective and Contrabean Roasting Company are
stored at byte-identical ones and are both real), so identical coordinates by
themselves merge nothing. Those pairs stay; a new registration between them is still
rejected at 25 m. The asymmetry is on purpose — it never splits an existing cafe in two.

Two caveats on the name test. Containment ("World Peace" inside "World Peace Donuts")
requires the shorter name to be at least six characters, or a row named "Cafe" would
absorb every neighbour. And clustering is transitive, so a chain — A matching B by
name, B matching C by a shared id — puts all three together without ever comparing A
to C; every cluster is printed before anything is deleted for that reason. A name with
no ASCII letters (Korean, Chinese) normalizes to empty and never matches, so cleanup
leaves those rows alone.

### What the next confirm rework does with these columns

Today a `pending` cafe becomes `verified` after three different users drop a bean
there, which says people showed up, not that the place exists. The next rework asks
Google or OSM whether a pending row is a real venue: a hit stores the id and confirms
it, a miss goes to a review queue, and the three-person condition goes away. The
photo-card work does not build that confirmation pipeline. Its Place ID backfill is
limited to image-less cafes and does not change verification status.

## Maintenance scripts

`apps/be/scripts/` is ignored by default. A script becomes tracked only when a document
in this directory names it — that is the whole rule, and it is why the list below is the
inventory rather than a sample. Older maintenance scripts stay local unless already in
Git.

**Seeding the map** (tracked, added with the reviewed-seed work):

- `seed_kw_reviewed.py` — the CSV round trip. `export` writes the candidate rows out for
  a person to judge; `import` reads the judged file back, dry-run first, `--apply` to
  write. What it writes is a *claim*, marked `pending`, not a verdict — see "Trait
  suggestions" above.
- `seed_real_cafes.py`, `seed_with_google_places.py` — the two older entry points, kept
  because they are the ones that enrich from Google.
- `osm_fields.py` — the shared field extraction the three of them lean on.
- All three check `services/blacklists.py` before inserting, so a shop an admin deleted
  is not quietly re-added by the next import. A lookup failure aborts the run rather
  than inserting blind; rerun after checking why. See `blacklists.md`.
- `purge_photoless_seed_cafes.sql` (local) — the block-by-block purge that preceded the
  reviewed seed. Block 1 lists, block 1.5 backs up to `cafes_purged_backup`, block 2
  deletes. Never run block 2 without 1.5.

**The fixed order for a purge-and-reseed.** Each step assumes the one before it:

1. `purge_photoless_seed_cafes.sql` block 1 — list what would go.
2. Block 1.5 — `cafes_purged_backup`. This is the only way back.
3. Block 2 — delete.
4. `seed_kw_reviewed.py export --out kw_review.csv`.
5. A person judges the CSV.
6. `seed_kw_reviewed.py import kw_review.csv`, dry run, then `--apply`.
7. `migrations/018_regular_badges_backfill.sql` — **after** the purge, so a cafe that is
   about to be deleted does not hand out badges on its way out.
8. Deploy.

**Classification and identity:**

- `purge_franchise_cafes.py` — sweeps OSM by region, matches rows to nodes by proximity
  and name, applies both rules, and records traits on survivors. **Rule 1 is retired**
  (see above), so its franchise half now only classifies; it no longer decides what
  exists. Dry run by default;
  `--apply` hard-deletes, cascading to that cafe's reviews, check-ins, bean drops and
  collection entries. Region sweeps and outlet counts are cached to disk between runs.
- `dedupe_cafes.py` — clusters duplicate cafes with the shared rules above and deletes
  the losers. Dry run by default. The survivor is the row with dependent data, then the
  one with an image, then the older one; a loser that has beans or visits of its own is
  printed for a manual merge, never deleted. Rows sharing a `source_url` fail
  `cafes_source_url_uidx`, so run `--apply` **before** applying
  `migrations/014_cafe_identity_uniques.sql`, and resolve whatever it prints as MANUAL
  — those rows are left in place on purpose and still fail the migration. It refuses
  to run at all if a dependent-row count comes back incomplete, because a missing
  count is indistinguishable from "this cafe has no data".
- `dedupe_nearby_cafes.sql` — superseded by `dedupe_cafes.py`, kept for reference. Do
  not run it: it recreates the view and the SECURITY DEFINER `cafe_child_rows()` helper
  that migration 013 dropped (the view now sets `security_invoker`, the function does
  not).
- `test_cafe_dedupe.py` — the identity rules, no DB needed.
- `backfill_google_place_ids.py` — dry-run-first, IDs-only lookup for image-less cafes;
  requires `--limit` and writes only with `--apply`.
- `migrations/015_google_photo_usage.sql` — atomic Pacific-month Place Photo cap.
- `test_franchise_classifier.py`, `test_venue_category.py` — the classifier checks.

Overpass rate-limits aggressively and will refuse a host that queries too hard; the
caches exist for that reason. Prefer one batched sweep over per-row lookups.

## Known limits

- The threshold catches chains by OSM presence, not legal structure. Country Style (79
  OSM locations) is a franchise that passes; a 100-location specialty roaster would be
  classified as a franchise. This no longer rejects registration. `FRANCHISE_OUTLET_THRESHOLD` is one constant.
- Venues absent from OSM cannot be classified at all. Seven bubble tea rows had to be
  removed by hand during the initial purge for this reason.
- `roastery` coverage in OSM is thin. Trustworthy roastery filtering needs a
  human-entered path, not just map tags.
- Temporarily closed rides inside `business_hours`, so it is only as durable as that
  blob. Every wholesale write of it has to preserve the flag by hand; a column would
  have made that structural. Worth revisiting if a second such write path appears.
