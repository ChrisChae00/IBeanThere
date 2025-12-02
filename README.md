# IBeanThere

> **"I Bean There"** = "I've been there"  
> A community-driven coffee journaling platform where users discover, verify, and record their cafe visits together.

## About

IBeanThere is fundamentally a **logging app** where users discover and record their cafe visits. Unlike apps that provide pre-populated cafe databases, IBeanThere users create and verify the map together through community participation.

### Core Philosophy

- **User-Generated Content (UGC)**: Users discover and register cafes themselves, building a community-verified database
- **Zero-Cost Mapping**: OpenStreetMap + Leaflet (no monthly fees, unlike Google Maps)
- **Community Verification**: 3 independent users must check in to verify a cafe
- **Founding Crew Gamification**: Navigator (1st pioneer) and Vanguard (2nd, 3rd pioneers) system encourages participation
- **Location-Based Discovery**: Real-time location tracking for automatic visit detection

## Key Features

### 🗺️ Community-Driven Cafe Discovery
- **User Registration**: Users register new cafes with location verification (must be within 50m)
- **3-User Verification**: Cafes are verified when 3 independent users check in
- **Founding Crew System**: Navigator (1st pioneer) and Vanguard (2nd, 3rd pioneers) are permanently recorded
- **Duplicate Detection**: 25m radius check prevents duplicate registrations
- **Admin Dashboard**: Admins can review and verify pending cafe registrations

### 📍 OpenStreetMap Integration
- **Zero Monthly Cost**: OpenStreetMap + Leaflet (vs $100-200/month for Google Maps)
- **OSM Nominatim Geocoding**: Free reverse/forward geocoding (1 req/sec rate limit)
- **Custom Markers**: Status-based marker styles (pending/verified)
- **Marker Clustering**: Efficient rendering for 10+ cafes
- **Interactive Maps**: Explore cafes on an interactive map with filters

### ☕ Coffee Journaling
- **Visit Tracking**: Automatic visit detection when within 100m of a cafe
- **Coffee Logs**: Record your experience with ratings and comments
- **Public/Private Logs**: Share your experiences or keep them private
- **Trending Cafes**: 14-day trending algorithm based on views, visits, and reviews
- **My Logs**: Personal journal of all your cafe visits and experiences

### 🎮 Gamification
- **Founding Crew Badges**: Navigator and Vanguard badges for pioneers
- **Verification Status**: Visual indicators for pending vs verified cafes
- **Visit Statistics**: Track your coffee journey and discover patterns

### 🌐 Internationalization & Theming
- **Multi-language Support**: English and Korean (en/ko)
- **Locale-based Routing**: `/en/` and `/ko/` routes with automatic detection
- **Theme System**: 4 beautiful themes (Morning Coffee, Vanilla Latte, Matcha Latte, Night Espresso)
- **User Preferences**: Customizable theme and language settings

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Maps**: Leaflet + OpenStreetMap + React Leaflet
- **i18n**: next-intl
- **Authentication**: Supabase Auth
- **State Management**: React Context (Theme, Toast)

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens via Supabase
- **Geocoding**: OSM Nominatim API
- **API Versioning**: `/api/v1/`

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database & Auth**: Supabase
- **Storage**: Supabase Storage (for future photo uploads)

## Project Structure

```
IBeanThere/
├── apps/
│   ├── fe/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   │   └── [locale]/ # Localized routes
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities & API clients
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── types/        # TypeScript types
│   │   │   └── i18n/         # Translation files
│   │   └── public/           # Static assets
│   │
│   └── be/                    # FastAPI backend
│       ├── app/
│       │   ├── api/v1/       # API endpoints
│       │   ├── core/         # Core config & permissions
│       │   ├── database/     # Database client
│       │   ├── models/       # Pydantic models
│       │   ├── services/     # Business logic
│       │   └── main.py       # FastAPI app entry
│       └── scripts/          # Database migration scripts
│
├── docs/                      # Project documentation
│   ├── architecture/         # Architecture docs
│   └── development/          # Development guides
│
└── packages/
    └── shared/               # Shared types (future)
```

## Quick Start

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **Supabase account** (for database and authentication)

### Frontend Setup

```bash
cd apps/fe
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd apps/be
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
CORS_ORIGINS=http://localhost:3000
```

**Note**: For production, update `CORS_ORIGINS` with your frontend domain (comma-separated for multiple origins).

## API Endpoints

### Authentication (`/api/v1/auth`)
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/verify` - Verify JWT token
- `POST /api/v1/auth/logout` - Logout user

### Cafes (`/api/v1/cafes`)
- `GET /api/v1/cafes` - Search cafes by location
- `GET /api/v1/cafes/{id}` - Get cafe details
- `POST /api/v1/cafes/register` - Register new cafe
- `GET /api/v1/cafes/trending` - Get trending cafes
- `GET /api/v1/cafes/admin/pending` - Get pending cafes (admin only)
- `POST /api/v1/cafes/admin/{id}/verify` - Verify cafe (admin only)

### Visits (`/api/v1/visits`)
- `POST /api/v1/cafes/{id}/visit` - Record a visit
- `POST /api/v1/cafes/{id}/view` - Record a view

### Users (`/api/v1/users`)
- `GET /api/v1/users/profile/{display_name}` - Get user profile

## Frontend Routes

### Public Routes
- `/` or `/en/` or `/ko/` - Landing page
- `/signin` - Login page
- `/register` - Signup page
- `/discover/explore-map` - Interactive map view
- `/discover/pending-spots` - View pending cafes
- `/discover/register-cafe` - Register new cafe
- `/cafes/[id]` - Cafe detail page
- `/cafes/[id]/log` - Create coffee log

### Protected Routes (Requires Authentication)
- `/profile` - User profile
- `/my-logs` - Personal coffee logs
- `/settings` - User settings
- `/admin/dashboard` - Admin dashboard (admin only)

## Development

### Running Both Services

1. **Start Backend** (Terminal 1)
   ```bash
   cd apps/be
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Start Frontend** (Terminal 2)
   ```bash
   cd apps/fe
   npm run dev
   ```

### Code Quality

- **Frontend**: TypeScript strict mode enabled
- **Backend**: Pydantic models for type validation
- **Linting**: ESLint (frontend), flake8 (backend - recommended)

### Database Migrations

Database migration scripts are located in `apps/be/scripts/`. Run them directly in Supabase SQL editor or via CLI.

## Documentation

- [Architecture Documentation](docs/architecture/) - Project structure and design decisions
- [UGC Verification System](docs/development/IBeanThere-UGC-Verification-System-Plan.md) - Detailed system design
- [Backend Structure](docs/architecture/backend-structure.md) - Backend architecture
- [Frontend Structure](docs/architecture/frontend-structure.md) - Frontend architecture

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT
