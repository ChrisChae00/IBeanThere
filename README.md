<h1 align="center">ibeanthere</h1>

<p align="center">
  <em>A map for remembering the cup you liked, and finding the next coffee and the beans to take home.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/Status-Live-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Market-Kitchener--Waterloo-8C5A3A?style=flat-square" alt="Market" />
</p>

<p align="center">
  <strong><a href="https://ibeanthere.app">ibeanthere.app</a></strong>
</p>

<p align="center">
  <a href="#why-20-exists">Why 2.0</a> •
  <a href="#decisions-worth-defending">Decisions</a> •
  <a href="#results">Results</a> •
  <a href="#engineering-notes">Engineering</a> •
  <a href="#stack">Stack</a> •
  <a href="#run-it-locally">Run it</a>
</p>

---

## Why 2.0 exists

Version 1 promised "an app for saving independent cafes." Google Maps and Naver already do that, with more data and a decade of head start. Saving a place is not a problem anyone had.

The version 2 promise is narrower and, so far, unclaimed:

> Remember the cup you liked. Find the next coffee, and the beans to take home.

That reframing changed the data model, the map, the badges and the onboarding, because the unit of value moved from **a place you saved** to **a coffee you drank**.

### Who it is for

Someone local who tries new coffee and buys beans when they like one. Coffee knowledge is not an entry requirement. Early users are picked by a recent decision they struggled with, not by "likes coffee" as an interest.

### The three moments it plans for

1. Before going somewhere new for coffee.
2. When the bag at home runs out and the next one has to be chosen.
3. When trying to remember what that good coffee actually was.

**Daily opens are not a goal.** Consumption frequency and app frequency are different problems: someone who drinks the same beans every morning has no reason to log it every morning. Notifications and streak badges can force the number up. This bets on being the thing that comes to mind in those three moments instead.

### First market: Kitchener-Waterloo, on purpose

The promise is completeness, not density:

> Every place in KW where you can buy beans is here.

A small pool is why this market was chosen: it is the only size where auditing every cafe by hand over two weekends is realistic. It is also a university town, so every September and January regenerates a cohort of people who just moved and do not know where the coffee is. Ontario expansion waits until KW is proven; the seed script already carries the bounding box.

---

## Decisions worth defending

Each one lists what was rejected, because that is where the reasoning lives.

| Decision | Why | Rejected |
|---|---|---|
| A log is an experience; the bean is optional | "I drank this here, liked it, bought the bag" is one record. Requiring origin, process and price to create a bean makes the first log a chore | Bean as the unit of record, with a mandatory catalogue entry before you can log anything |
| A cafe's bean list is derived from public logs | One source of truth, and it can never expose more than the author chose to show | A `cafe_bean_offerings` table fed automatically by every log, which would have leaked who drank what from private and anonymous entries |
| Trait claims need evidence or a queue | Registering means passing a 100m check while standing there; a purchase logged inside the shop means the same check plus having bought the bag. Those write straight through. Everything else waits for review | Trusting every button press on a cafe page, and a review queue nobody drains |
| Franchise filtering reads OpenStreetMap, not a brand list | A hardcoded blocklist stops working the moment you cross a border. Name counting misfires: a global count flags the Toronto cafe "The Link" as a 217-location chain | Maintaining a blocklist by hand, and matching on names |
| Cafe identity is borrowed, not invented | A cafe is the OSM node id or Google place id it already has, each under a partial UNIQUE index | Generating an internal identity and reconciling duplicates later |
| Unclassifiable venues are listed, not rejected | A wrong rejection is invisible to everyone, including the operator. A wrong listing shows up in the review queue | Failing closed on the classifier |
| Badges count coming back | Ranking who arrived first rewards the calendar, not the coffee | The 1.x pioneer system (Navigator, Scout), removed in the pivot |

---

## Results

| | Before | After |
|---|---|---|
| Proximity query (20 cafes) | 3.39ms | **0.31ms** (11.1x, PostGIS GIST) |
| Buffer I/O per proximity query | 257 blocks | **31 blocks** |
| False 429s over 70 rotating client IPs | 11 | **0** |
| Muted text contrast, light themes | 2.35:1 | **≥4.5:1** (WCAG AA) |
| Korean font payload actually downloaded | 887KB | **883KB** (repo 6.1MB → 1.8MB) |
| Feature files touched to swap 5 UI primitives | — | **0** |
| Blocking browser dialogs in app code | 11 | **0** |
| Cafes on the map | 627 | **64 verified KW cafes** (314 after franchise and duplicate removal, then 302 more purged in the pivot and the market re-seeded by hand) |

---

## Engineering notes

### Curation: keeping a local coffee map local

Brand size is resolved from the OpenStreetMap `brand:wikidata` tag and counted through Overpass, then cached per brand, so a rejection costs one indexed read. Non-coffee venues are detected from the OSM `cuisine` tag, where a coffee marker always wins, so a cafe that also sells bubble tea stays. Linking stored rows to map nodes uses coordinate proximity plus name matching after exact-coordinate matching silently missed 24 rows named "Starbucks Coffee Company". New local shops in neither dataset get a 25m proximity check instead.

The pass removed 253 franchise locations, 42 tea and juice venues, and 18 duplicates. Every cafe that survived carries its brand verdict and its descriptive traits. Rules: [cafe curation](./docs/architecture/cafe-curation.md).

### Spatial search

The GIST index existed and was unused, with Haversine distance computed in Python. Benchmarking ran against a 10,000-row Docker dataset isolated from production, which is how the 11.1x number has a before and an after instead of a vibe. Full method: [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md).

### Client IP behind a proxy

Behind Render's load balancer, `request.client.host` returned the same value for every user, so a `60/minute` limiter throttled everyone as one bucket. The fix trusts only private ranges, which makes `X-Forwarded-For` parse from the right, past the segment a client can write itself. Setting `--forwarded-allow-ips=*` would have been one flag and would have handed anyone a header that disables throttling. The same audit found the rate-limit key falling back to an unauthenticated `user_id` query parameter, so `?user_id=1,2,3…` bypassed it indefinitely. Removed.

### Design system

Two colour systems had diverged, and forty theme variables were injected by `useEffect` after first paint, so every load flashed. Rebuilding them as three token layers was routine. The proof surface built to check the tokens was not: it found muted text at 2.35:1, a Matcha accent label at 2.62:1, and five CSS variables that 48 files referenced and nothing ever defined. The muted hierarchy had never actually rendered.

Button, Card, Badge, Modal and Tooltip moved onto Base UI behind the existing prop API, so no feature file changed. Accessibility was the reason, not tidiness. The old Modal had no focus trap, no Escape handler and no focus return, which left keyboard and screen reader users tabbing out of an open dialog with no way back.

Fonts are self-hosted because the CSP blocks font CDNs outright. Hahmlet was chosen over Noto Serif KR on what a Korean reader downloads, 883KB against 887KB, rather than on the 3.4x repository size difference that would have picked the other one.

### Security and correctness

Findings that shipped as fixes: report text is escaped in the admin email and dashboard; the password reset form no longer reveals which addresses have an account, and no longer reports success when the mail failed; the follow list had been silently returning empty for every user; map services are held to their published rate limits; five message keys that resolved to nothing now resolve.

Browser-native dialogs are gone from the app. Deleting a coffee log could freeze the tab outright, which left no way to remove a mistaken entry short of deleting the account. Eleven `confirm()` and `alert()` calls now route through the app's own dialog and toast, which also means they are translated, and toasts are announced to screen readers.

### Testing

12 backend test files cover registration policy, trait suggestion evidence, visit privacy, blacklists, account deletion, report safety, badges, and the OSM rate gate. The frontend is verified end to end against a running stack with a real account rather than by build alone: the current run has ten sessions of recorded results, which is where the log deletion freeze, the drop-bean radius mismatch and the silent photo upload failure were found. Results and evidence live in `docs/testing/`.

---

## Stack

**Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Base UI, next-intl (en/ko), Leaflet, PostHog

**Backend:** FastAPI, Python 3.11, Pydantic, slowapi, PostgreSQL + PostGIS, Supabase (auth and storage), OpenStreetMap and Overpass

**Four themes** (Morning Coffee, Dark Roast, Matcha Latte, Vanilla Latte) run on the token layer, so contrast is a property of the system rather than of each screen.

---

## Architecture

```text
IBeanThere/
├── apps/
│   ├── fe/                    # Next.js 15 frontend
│   │   ├── src/app/[locale]/  # Localized App Router
│   │   ├── src/shared/ui/     # Primitives (base/ holds the vendor layer)
│   │   ├── src/components/    # Feature components
│   │   ├── src/lib/themes/    # Theme palettes
│   │   └── src/i18n/messages/ # en.json / ko.json
│   │
│   └── be/                    # FastAPI service
│       ├── app/api/v1/        # ~90 routes: cafes, visits, users, collections, admin
│       ├── app/services/      # Overpass, dedupe, curation
│       ├── app/core/          # Config, security, RBAC dependencies
│       └── tests/             # 12 test modules
└── docs/                      # Direction, architecture, plans, testing evidence
```

`docs/product/direction.md` is the single source for what this product is and is not. `docs/architecture/` holds the system designs.

---

## Run it locally

**Prerequisites:** Node.js 18+, Python 3.11+, a Supabase project.

```bash
# Backend
cd apps/be
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add SUPABASE_URL and SUPABASE_SERVICE_KEY
uvicorn app.main:app --reload --port 8000   # docs at /docs

# Frontend
cd apps/fe
npm install
cp .env.local.example .env.local            # add NEXT_PUBLIC_SUPABASE_*
npm run dev                                 # http://localhost:3000
```

---

## API surface (`/api/v1`)

| Module | Purpose | Key endpoints |
|---|---|---|
| **Auth** | Session and profile metadata | `/auth/me`, `/auth/verify` |
| **Cafes** | Discovery, geocoding, verification | `GET /cafes`, `POST /cafes/register`, `GET /cafes/{id}/beans`, `GET /cafes/admin/pending` |
| **Visits & logs** | Journaling and geofenced check-ins | `POST /cafes/{id}/visit`, `PATCH /visits/{id}`, `DELETE /visits/{id}` |
| **Beans** | Bean and roaster catalogue, trait suggestions | `GET /beans`, `POST /roasters`, `POST /cafes/{id}/traits` |
| **Users** | Public profiles, follows, badges, deletion | `GET /users/profile/{name}`, `DELETE /users/me` |
| **Collections** | Curated groupings, shareable by token | `GET /collections`, `POST /collections/{id}/share` |
| **Admin** | Review queue, blacklists, deletion history | `GET /admin/blacklists/{kind}`, `DELETE /admin/cafes/{id}` |
| **Reports** | Moderation flagging | `POST /reports` |

---

## Contributing

A personal project, currently open to feedback rather than pull requests. Issues and discussions are welcome.

## License

[MIT](LICENSE)
