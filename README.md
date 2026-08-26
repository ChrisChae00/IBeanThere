<h1 align="center">
  ibeanthere
</h1>

<p align="center">
  <em>"I Bean There" (I've been there) — A community-driven coffee journaling platform where coffee lovers discover, verify, and record their cafe visits together.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active_Development-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Version-1.1.0-blue?style=flat-square" alt="Version" />
</p>

<p align="center">
  <strong>🔗 Live App: <a href="https://ibeanthere.app">ibeanthere.app</a></strong>
</p>

<p align="center">
  <a href="#about">About</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#thematic-color-palettes">Thematic Palettes</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#engineering-evolution-log">Engineering Log</a> •
  <a href="#architecture--project-structure">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-reference">API Overview</a>
</p>

<hr>

## About

**ibeanthere** is a modern, gamified coffee logging application. Unlike traditional map apps providing pre-populated databases, ibeanthere relies entirely on **User-Generated Content (UGC)**. Users become pioneers, discovering hidden gem cafes, checking in, and verifying locations through real community participation.

### Core Philosophy

- **User-Generated Map:** Build a community-verified coffee map from the ground up.
- **Pioneer System (Gamification):** The first to check-in becomes the **Navigator**. The 2nd and 3rd become **Scouts**. Get permanently recorded in the cafe's history!
- **Community Verification:** A registered cafe only becomes strictly "verified" once 3 independent users visit and review it.
- **Local Coffee Only:** Franchises and non-coffee venues are turned away at registration. The map is for independent cafes that actually serve coffee.
- **Zero-Cost Infrastructure:** Powered by OpenStreetMap + Leaflet (No expensive Google Maps API required).

---

## Key Features

### Community-Driven Cafe Discovery
- **Register New Spots:** Pin new cafes directly on the map with robust Google Maps link resolution (enforces user location presence and physical proximity within 100m).
- **Anti-Duplicate System:** 25m radius conflict detection prevents spamming the same location, along with deduplication of overlapping map markers.
- **Algorithmic Curation:** Chains (100+ locations worldwide) and non-coffee venues (bubble tea, tea houses, juice bars) are rejected at registration, judged from OpenStreetMap brand and cuisine data rather than a hardcoded brand list — so the rule holds in any market. See [Cafe Curation Rules](./docs/architecture/cafe-curation.md).
- **Admin & Community Verification:** Pending spots turn verified automatically after 3 user check-ins. Admins have a comprehensive management view with status filtering to manually review pending cafes, plus per-brand and per-cafe overrides when the algorithm gets one wrong.
- **Interactive Map Exploration:** Built using Leaflet with custom clustering, progressive radius expansion, and a discovery fallback system.

### Advanced Coffee Journaling
- **Geo-fenced Check-ins:** Visit tracking activates when your location is within 100m.
- **Rich Coffee Logs:** Rate beans, atmospheric vibes, drop comments, and upload photo galleries.
- **Collections & Trending:** 14-day trending algorithm surfaces hot cafes. Users can build their own curated collections.
- **Community & Follows:** See what cafes your friends or community members are exploring.

### Enterprise-Grade Security
- **Role-based Access Control (RBAC):** Strict JWT verifications for Admin/User endpoints natively tied with Supabase metadata.
- **Rate Limiting & Hardened CORS:** API endpoints are protected against brute-force and DDoS via advanced proxy rate-limiters (`slowapi`) and security headers.
- **Input Sanitization:** URL parameters and payloads are strictly typed (`max_length` constraints, rigorous Pydantic models).

### Global & Accessible
- **Internationalization (i18n):** Native support for English (`/en`) and Korean (`/ko`).
- **Dynamic Theming:** Switch between curated coffee aesthetics matching your mood.

---

## Thematic Color Palettes

ibeanthere supports dynamic theme switching powered by a React Context state system. Here are the curated palettes available to users:

| Theme | Preview | Primary | Background | Card BG | Text | Design Aesthetic |
|---|---|---|---|---|---|---|
| **Morning Coffee** | ![#8C5A3A](https://img.shields.io/badge/-%238C5A3A-8C5A3A?style=flat-square) ![#e9d6c0](https://img.shields.io/badge/-%23e9d6c0-e9d6c0?style=flat-square) | `#8C5A3A` | `#e9d6c0` | `#f5f0e8` | `#442f19` | Cozy, warm colors resembling morning filter coffee and cream. |
| **Dark Roast (Espresso)** | ![#d4c7b8](https://img.shields.io/badge/-%23d4c7b8-d4c7b8?style=flat-square) ![#1A120B](https://img.shields.io/badge/-%231A120B-1A120B?style=flat-square) | `#d4c7b8` | `#1A120B` | `#2A1A13` | `#e9ded2` | Deep contrast, dark mode aesthetic tailored for night coffee logs. |
| **Matcha Latte** | ![#85a035](https://img.shields.io/badge/-%2385a035-85a035?style=flat-square) ![#e0e8d0](https://img.shields.io/badge/-%23e0e8d0-e0e8d0?style=flat-square) | `#85a035` | `#e0e8d0` | `#f0f2e8` | `#4a5c2a` | Calming, desaturated green hues reflecting high-quality green tea. |
| **Vanilla Latte** | ![#362C1D](https://img.shields.io/badge/-%23362C1D-362C1D?style=flat-square) ![#FFF8DC](https://img.shields.io/badge/-%23FFF8DC-FFF8DC?style=flat-square) | `#362C1D` | `#FFF8DC` | `#FFF9F0` | `#362C1D` | Creamy white and sweet vanilla shades for a soft and minimal look. |

---

## Tech Stack

### Frontend (Next.js)
<p align="left">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase Auth" />
</p>

### Backend (FastAPI)
<p align="left">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white" alt="Pydantic" />
  <img src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white" alt="OSM" />
</p>

---

## Engineering Highlights

Major challenges solved and optimizations completed:

### Spatial Query Indexing & Performance Optimization
- **Impact:** **11.1x query speedup** (3.39ms → 0.31ms) on proximity search via PostGIS GIST indices
- **Methodology:** 
  - Benchmarked before/after with 10,000-row Docker dataset (isolated from production)
  - Seeded **1,172 real cafes** from OpenStreetMap (OSM) into production
  - Achieved **88% reduction in buffer I/O** (257 → 31 blocks)
  - Maintained production integrity (zero impact from benchmarking)
- **Result:** Proximity search now returns 20 cafes in sub-millisecond time
- **Details:** See [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md)

### Spatial Proximity & GPS Verification
- **Challenge:** Mobile GPS erratic, causing false negatives on cafe check-ins/registrations.
- **Solution:** Widened geofence from **50m to 100m**, refined Google Maps + Nominatim coordinate resolution.

### Map Rendering & UX Performance
- **Challenge:** Hundreds of overlapping markers caused lag on mobile.
- **Solution:** 
  - Integrated `leaflet.markercluster` with custom clustering configuration
  - Wrote coordinate deduplication (merge markers within 25-meter radius)
  - Progressive "Load More" pagination for list rendering
  - High-zoom level clustering toggle for real-time performance

### Access Control (RBAC) & Admin Workflow
- **Challenge:** Preventing unauthorized cafe listing manipulation.
- **Solution:** 
  - Administrative portal with live status filters (Pending/Verified/Flagged)
  - Role-Based Access Control via Supabase Auth metadata
  - Fixed cache invalidation bug ("Ghost Images" on admin updates)

### Algorithmic Cafe Curation
- **Challenge:** Keeping a "local coffee" map local. A hardcoded brand blocklist does not survive crossing a border, and name matching misfires — a global name count flags the Toronto cafe "The Link" as a 217-location chain.
- **Solution:**
  - Brand size resolved from OpenStreetMap `brand:wikidata` and counted via Overpass, cached per brand so a rejection costs one indexed read
  - Non-coffee venues detected from the OSM `cuisine` tag; a coffee marker always wins, so cafes that also sell bubble tea stay
  - Coordinate-proximity plus name matching to link stored rows to map nodes — exact-coordinate matching silently missed 24 "Starbucks Coffee Company" rows
  - Fail-open by design: an unclassifiable venue is listed and queued for review, never rejected
  - Identity borrowed rather than invented: a cafe is the OpenStreetMap node id or Google place id it already has, each under a partial UNIQUE index, with a 25 m proximity check for the new local shop that is in neither dataset
- **Result:** 627 → 314 cafes. 253 franchise locations, 42 tea/juice venues and 18 duplicates removed; every survivor carries its brand verdict and descriptive traits.

### Automated API Verification & Testing
- **Coverage:** 100% pass rate across core integration suites (Healthcheck, Spatial Proximity Search, Geofencing, RBAC Auth Guards, and OSM Reverse Geocoding).
- **Execution Speed:** Fast API verification suite runs with sub-second latency, ensuring continuous regression prevention across all core endpoints.

---

## Architecture & Project Structure

This repository uses a monorepo-style structure separating the React frontend and Python backend, ensuring a clear boundary of concerns.

```text
IBeanThere/
├── apps/
│   ├── fe/                    # Next.js 14 Frontend App
│   │   ├── src/app/           # Localized App Router ([locale]/...)
│   │   ├── src/shared/ui/     # Reusable UI component library
│   │   ├── src/components/    # Feature-specific components
│   │   └── tailwind.config.js # Thematic configurations
│   │
│   └── be/                    # FastAPI Backend Service
│       ├── app/api/v1/        # Endpoints (auth, cafes, users, collections, etc.)
│       ├── app/core/          # Configs, Security, deps.py (RBAC)
│       └── scripts/           # DB Migrations / Utilities
├── docs/                      # Architecture & Implementation Plans
└── package.json               # Monorepo/Root tools
```

> **For detailed system designs, see the `/docs/` folder.** (Includes routing strategy, module separation rules, the UGC verification flow diagrams, and the [cafe curation rules](./docs/architecture/cafe-curation.md)).

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase Project (Database & Authentication set up)

### 1. Backend Setup

```bash
cd apps/be
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your SUPABASE_URL and SUPABASE_SERVICE_KEY
```

Run the API:

```bash
uvicorn app.main:app --reload --port 8000
```

> API Docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd apps/fe
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with NEXT_PUBLIC_SUPABASE variables
```

Run the Client:

```bash
npm run dev
```

> App available at: `http://localhost:3000`

---

## Key API Reference (`/api/v1`)

| Module            | Purpose                              | Key Endpoints                                                    |
| ----------------- | ------------------------------------ | ---------------------------------------------------------------- |
| **Auth**          | User session and profile metadata    | `/auth/me`, `/auth/verify`                                       |
| **Cafes**         | Discovery, Geocoding, Verification   | `GET /cafes`, `POST /cafes/register`, `GET /cafes/admin/pending` |
| **Visits & Logs** | Journaling and physical check-ins    | `POST /cafes/{id}/visit`, `POST /cafes/{id}/log`                 |
| **Users**         | Public profiles, badges              | `GET /users/profile/{name}`                                      |
| **Collections**   | Custom groupings of cafes (My Beans) | `GET /collections`, `POST /collections`                          |
| **Reports**       | Security & moderation flagging       | `POST /reports`                                                  |
| **Community**     | Social feeds, trending algorithms    | `GET /community/trending`                                        |

---

## Contributing

This is currently a private/personal project shaping the future of coffee mapping, but feedback and feature requests are highly welcome. Feel free to open issues or discussions in the repository.

## License

This project is licensed under the [MIT License](LICENSE).
