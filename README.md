# IBeanThere (Monorepo)

IBeanThere is a coffee journaling web app. Monorepo contains frontend (Next.js) and backend (FastAPI) with optional shared package.

## Stack
- Frontend: Next.js 14 + TypeScript
- Backend: FastAPI (Python 3.13)
- Database: Supabase (PostgreSQL + Auth + Storage)
- Deploy: Vercel (FE), Render (BE)

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

## Environment
- FE: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- BE: SUPABASE_URL, SUPABASE_KEY, JWT_SECRET, CORS_ORIGINS

## Links
- docs/: project docs

## License
MIT
