<h1 align="center">
  <img src="apps/fe/public/icons/coffee-logo.svg" alt="IBeanThere Logo" width="120" style="vertical-align: middle; margin-right: 10px;" onerror="this.style.display='none'"/>
  IBeanThere
</h1>

<p align="center">
  <em>"I Bean There" (I've been there) — A community-driven coffee journaling platform where coffee lovers discover, verify, and record their cafe visits together.</em>
</p>

<p align="center">
  <strong>Live App: <a href="https://ibeanthere.app">ibeanthere.app</a></strong>
</p>

<p align="center">
  <a href="#about">About</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture--project-structure">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-reference">API Overview</a>
</p>

<hr>

## About

**IBeanThere** is a modern, gamified coffee logging application. Unlike traditional map apps providing pre-populated databases, IBeanThere relies on **User-Generated Content (UGC)**. Users become pioneers, discovering hidden gem cafes, checking in, and verifying locations through real community participation.

### Core Philosophy

- **User-Generated Map:** Build a community-verified coffee map from the ground up.
- **Pioneer System (Gamification):** The first to check-in becomes the **Navigator**. The 2nd and 3rd become **Vanguards**. Get permanently recorded in the cafe's history!
- **Community Verification:** A registered cafe only becomes strictly "verified" once 3 independent users visit and review it.
- **Zero-Cost Infrastructure:** Powered by OpenStreetMap + Leaflet (No expensive Maps API required).

---

## Key Features

### Community-Driven Cafe Discovery

- **Register New Spots:** Pin new cafes directly on the map (requires user physical proximity within 50m).
- **Anti-Duplicate System:** 25m radius conflict detection prevents spamming the same location.
- **Admin & Community Verification:** Pending spots turn verified automatically after 3 user check-ins. Admins can also manually review pending cafes.
- **Interactive OpenStreetMap:** Built using Leaflet with custom clustering and status-based markers.

### Advanced Coffee Journaling

- **Geo-fenced Check-ins:** Visit tracking activates when your location is within 100m.
- **Rich Coffee Logs:** Rate beans, atmospheric vibes, drop comments, and upload photo galleries.
- **Collections & Trending:** 14-day trending algorithm surfaces hot cafes. Users can build their own curated collections.
- **Community & Follows:** See what cafes your friends or community members are exploring.

### Enterprise-Grade Security

- **Role-based Access Control (RBAC):** Strict JWT verifications for Admin/User endpoints natively tied with Supabase metadata.
- **Rate Limiting & Hardened CORS:** API endpoints are protected against brute-force and DDoS via advanced proxy rate-limiters and security headers.
- **Input Sanitization:** URL parameters and payloads are strictly typed (`max_length` constraints, rigorous Pydantic models).

### Global & Accessible

- **Internationalization (i18n):** Native support for English (`/en`) and Korean (`/ko`).
- **Dynamic Theming:** Switch between curated coffee aesthetics: _Morning Coffee_, _Night Espresso_, _Matcha Latte_, or _Vanilla Latte_.

---

## Tech Stack

### Frontend (Next.js)

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **Mapping:** `leaflet`, `react-leaflet`, `leaflet.markercluster`
- **State & i18n:** React Context API, `next-intl`
- **Authentication:** `@supabase/ssr`

### Backend (FastAPI)

- **Framework:** FastAPI
- **Language:** Python 3.11+
- **Security & Validation:** Pydantic `v2`, `slowapi` (Rate Limiting)
- **Database & Auth:** Supabase (PostgreSQL), `supabase-py`
- **Geocoding:** OSM Nominatim API

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

> **For detailed system designs, see the `/docs/` folder.** (Includes routing strategy, module separation rules, and the UGC verification flow diagrams).

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
