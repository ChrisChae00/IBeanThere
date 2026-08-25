# Frontend Repository Structure

```
apps/fe/
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration, including the CSP
├── package.json          # Node dependencies and scripts
├── postcss.config.js     # Tailwind v4 entry point
├── tsconfig.json         # TypeScript compiler configurations
├── scripts/              # Repo maintenance scripts, not app code
│   └── build-fonts.py    # Vendors the webfaces and regenerates fonts.css
├── public/
│   └── fonts/            # Self-hosted webfaces, split by character range
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
    │   ├── ui/           # Legacy; see the note under Styling
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
    │   └── ui/           # The UI primitives in actual use
    ├── styles/           # See Styling below
    └── types/            # App-wide TypeScript definitions
```

## Key Features

- **Monorepo-style structure** utilizing App Router (`apps/fe/src/app`)
- **Domain/Feature-based folder architecture** separating primitives (`shared/ui`)
  from feature logic (`features/`, domain `components/`)
- **Built-in i18n capabilities** dynamically routing locales
- **Robust typed configuration** across React, standard web primitives and data
- **Tailwind v4**, configured in CSS rather than a JavaScript config file

## Styling

Tailwind v4 has no `tailwind.config.js`. Everything is declared in CSS, and the
stylesheets are layered deliberately:

| File | Holds |
|---|---|
| `styles/globals.css` | The entry point. Imports the rest, declares `@theme`, and holds base and component layers. |
| `styles/fonts.css` | Generated `@font-face` rules. Do not edit by hand — run `scripts/build-fonts.py`. |
| `styles/themes.css` | Layer 1. The only colour literals in the app, one block per theme. |
| `styles/tokens.css` | Layers 2 and 3. Semantic and component tokens, authored once for all themes. |
| `styles/legacy-tokens.css` | Compatibility shims. Scheduled for deletion — see below. |

### Tokens

Three layers, each with one job:

1. **Primitive** (`themes.css`) — the raw palette slots a theme fills in. Adding a theme
   means filling this block and nothing else.
2. **Semantic** (`tokens.css`) — `surface-*`, `ink-*`, `accent*`, `edge-*`, `state-*`,
   plus domain tokens for stars and map markers. **Feature code reads this layer.**

   One naming wrinkle: the brand colour reaches Tailwind as `brand`, not `accent`
   (`bg-brand`, `text-brand`). The old palette already had an `accent` — a pale tint —
   and unmigrated pages still ask for it by that name, so the legacy meaning keeps the
   utility name and the semantic token is exposed under its own. The CSS custom
   property is still `--accent`; only the utility differs.
3. **Component** (`tokens.css`) — `--btn-*`, `--card-*`, `--input-*`, derived from
   layer 2 and never overridden per theme.

Radius is deliberately three values: `--radius-control`, `--radius-card`,
`--radius-pill`. There is no fourth.

There is no third `muted` ink tier. Derived from secondary it cannot clear WCAG AA on
the light themes, and a token that cannot pass is a trap for whoever reaches for it.

`--surface-sunken` and `--surface-hover` are derived by mixing a ground toward ink, so
they are darker than the ground they come from. Ink tuned to just clear on `page` fails
on both. `/theme-demo` measures all four surfaces — check it there, not by reading the
hex values.

### Themes

Four complete visual themes, not a light/dark pair — Dark Roast *is* the dark mode.
They are applied as `data-theme` on `<html>`, set before first paint by a small inline
script in the root layout, so there is no flash. `ThemeContext` sets the attribute;
`lib/themes/palettes.ts` holds names and display names only, never colour values.

Anything needing a theme colour in JavaScript should read the published custom property
(see `getCSSVariable` in `lib/markerStyles.ts`) rather than importing values, so each
colour has exactly one definition.

### Typography

Serif headings over sans body, in both languages, with the pair chosen per locale via
`:lang()`:

| | Display | Body |
|---|---|---|
| English | Playfair Display | Inter |
| Korean | Hahmlet | Pretendard Variable |

Each stack lists the other locale's face as its fallback, which is load-bearing rather
than defensive: cafe names on the English site are Korean.

Every face is self-hosted, because `next.config.js` restricts `font-src` to `'self'`.
Korean faces are split by `unicode-range`, so the file count is large but a page fetches
only the ranges it displays. Rendering the entire Korean message catalogue needs 24 of
Hahmlet's 92 chunks.

Heading weight is driven through the variable `wght` axis, not `font-weight`, so
`--font-display-weight` governs even where a heading still carries a weight utility
class. **A weight utility therefore does nothing to a heading** — display weight is a
system decision, set in `tokens.css`.

### Relief

`.relief-raised`, `.relief-pressed`, and `.relief-control` are the entire neumorphism
budget, and they belong on interactive controls only. Cards, sections and bento cells
stay flat: relief everywhere reads as muddy, and low-contrast card surfaces fail WCAG.

`.relief-control` carries its own hover and press states, so a control signals state
through depth rather than a colour swap. That is not only stylistic — Matcha Latte's
green has no lighter shade left that still carries a legible label.

### The token proof surface

`/theme-demo` renders every semantic token, both relief states, the radius set and the
type scale, reading values back from the live cascade and measuring contrast per theme.
Relief values cannot be judged by reading CSS; tune them there.

### Scheduled deletions

`styles/legacy-tokens.css`, and the legacy half of the `@theme` block in `globals.css`,
exist so pages that have not been reworked keep rendering unchanged during the UI
migration. **They are meant to be deleted once the last page moves over.** If that has
not happened, the migration is not finished.

`components/ui/` is likewise vestigial: it holds a single file, while `shared/ui/` holds
the primitives actually imported across the app. Reach for `shared/ui`.
