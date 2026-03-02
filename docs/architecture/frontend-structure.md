# Frontend Repository Structure

```
apps/fe/
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Node dependencies and scripts
├── tailwind.config.js    # Styling framework config
├── tsconfig.json         # TypeScript compiler configurations
├── public/               # Static assets (images, icons, etc.)
└── src/                  # Main source code directory
    ├── app/              # Next.js App Router hierarchy
    ├   ├── [locale]/     # Internationalization routing
    ├── components/       # Domain-specific UI elements
    │   ├── admin/
    │   ├── auth/
    │   ├── cafe/
    │   ├── community/
    │   ├── landing/
    │   ├── layout/
    │   ├── map/
    │   ├── profile/
    │   ├── providers/
    │   ├── settings/
    │   ├── shared/
    │   ├── shop/
    │   ├── ui/           # Base, agnostic UI primitives
    │   └── visits/
    ├── contexts/         # Global React context providers
    ├── features/         # Feature-based architectures and hooks
    ├── hooks/            # Global custom React Hooks
    ├── i18n/             # Localization configs and dictionaries
    ├── lib/              # Utils and client configurations (e.g., Supabase)
    ├── middleware.ts     # Edge middleware for navigation/auth
    ├── shared/           # Common code bridging multiple features
    │   ├── contexts/
    │   ├── lib/
    │   ├── types/
    │   └── ui/
    ├── styles/           # Global stylesheets
    └── types/            # App-wide TypeScript definitions
```

## Key Features:

- **Monorepo-style structure** utilizing App Router (`apps/fe/src/app`)
- **Domain/Feature-based folder architecture** separating pure UI (`components/ui`) from feature logic (`features/`, domain `components/`)
- **Built-in i18n capabilities** dynamically routing locales
- **Robust typed configuration** across React, standard web primitives and data
- **Modern stylistic toolkits** with TailwindCSS integrated
