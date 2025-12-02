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

### 📍 OpenStreetMap Integration
- **Zero Monthly Cost**: OpenStreetMap + Leaflet (vs $100-200/month for Google Maps)
- **OSM Nominatim Geocoding**: Free reverse/forward geocoding (1 req/sec rate limit)
- **Custom Markers**: Status-based marker styles (pending/verified)
- **Marker Clustering**: Efficient rendering for 10+ cafes

### ☕ Coffee Journaling
- **Visit Tracking**: Automatic visit detection when within 100m of a cafe
- **Coffee Logs**: Record your experience with ratings and comments
- **Public/Private Logs**: Share your experiences or keep them private
- **Trending Cafes**: 14-day trending algorithm based on views, visits, and reviews

### 🎮 Gamification
- **Founding Crew Badges**: Navigator and Vanguard badges for pioneers
- **Verification Status**: Visual indicators for pending vs verified cafes
- **Visit Statistics**: Track your coffee journey and discover patterns

### 🌐 Internationalization
- **Multi-language Support**: English and Korean (en/ko)
- **Locale-based Routing**: `/en/` and `/ko/` routes
- **Theme System**: 4 beautiful themes (Morning Coffee, Vanilla Latte, Matcha Latte, Night Espresso)

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: FastAPI (Python 3.11+)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Maps**: Leaflet + OpenStreetMap
- **Deployment**: Vercel (FE), Render (BE)

## Structure
```
apps/
  fe/        # Next.js app (App Router)
  be/        # FastAPI app
packages/
  shared/    # (optional) shared types
```

## Quick Start
### Frontend
```bash
cd apps/fe
npm install
npm run dev
```

### Backend
```bash
cd apps/be
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=https://your-frontend.vercel.app
```

## Project Structure

```
apps/
  fe/        # Next.js app (App Router)
  be/        # FastAPI app
packages/
  shared/    # (optional) shared types
docs/        # Project documentation
```

## Development

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Supabase account

### Running Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IBeanThere
   ```

2. **Set up Frontend**
   ```bash
   cd apps/fe
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with your values
   npm run dev
   ```

3. **Set up Backend**
   ```bash
   cd apps/be
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your values
   uvicorn app.main:app --reload
   ```

## Documentation

- [Project Structure](docs/architecture/)
- [UGC Verification System](docs/development/IBeanThere-UGC-Verification-System-Plan.md)
- [Visits and Trending](VISITS_AND_TRENDING.md)

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT
