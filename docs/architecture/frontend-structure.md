# Frontend Repository Structure

```
ibeanthere-fe/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Frontend CI/CD
│   │   └── deploy.yml          # Vercel deployment
│   └── pull_request_template.md
├── .cursor/
│   └── rules/                   # Frontend-specific Cursor rules
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── cafes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── reviews/
│   │   │   ├── page.tsx
│   │   │   └── create/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── forms/
│   │   │   ├── ReviewForm.tsx
│   │   │   └── CafeSearchForm.tsx
│   │   ├── maps/
│   │   │   ├── CafeMap.tsx
│   │   │   └── LocationPicker.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── supabase.ts         # Supabase client
│   │   ├── utils.ts            # Utility functions
│   │   └── constants.ts        # App constants
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useReviews.ts
│   │   └── useCafes.ts
│   ├── types/
│   │   ├── api.ts              # API types
│   │   ├── cafe.ts
│   │   ├── review.ts
│   │   └── user.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── images/
│   └── icons/
├── tests/
│   ├── __mocks__/
│   ├── components/
│   └── utils/
├── docs/
│   ├── README.md
│   ├── DEPLOYMENT.md
│   └── API_INTEGRATION.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .eslintrc.json
├── .env.local.example
└── vercel.json
```

## Key Features:
- **Monorepo-style organization** within frontend
- **Feature-based folder structure** (auth, cafes, reviews)
- **Shared components** in `/components/ui`
- **Type-safe API integration** with backend
- **Comprehensive testing** setup
- **CI/CD pipeline** for Vercel deployment
