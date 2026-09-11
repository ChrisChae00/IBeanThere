# Frontend Repository Structure

## Analytics

Three events and a pageview, mounted once from `ClientProviders` as `AnalyticsWatcher`.
`posthog-js` is imported at runtime rather than bundled, no URL leaves the browser with
an identifier in it, and nothing is stored on the reader's device. Absent
`NEXT_PUBLIC_POSTHOG_KEY` it is entirely inert, which is the local default. The CSP in
`next.config.js` has to name the host or every event is dropped silently.

Full contract, including what each event carries and why the identity is bootstrapped
rather than `identify()`d: `docs/architecture/analytics.md`.

## Coffee workflow changes (`4f95bfe`)

- `CafeTraits.tsx` submits suggestions through `suggestTraitObservation`; pending
  submissions leave approved summaries unchanged. Trait reads use `no-store`.
- `admin/TraitSuggestionsList.tsx` displays the pending queue grouped by cafe, with each
  claim's note and admin-only evidence, and calls admin approve/reject endpoints.
  Backend authorization enforces access. Per-cafe actions approve every claim at once or
  delete the cafe; the website and Maps links let a reviewer check a claim without
  leaving the queue.
- **Admin cafe edits fill from Google.** The edit modal takes a Google Maps URL and
  applies the same lookup the registration form uses, filling name, address, phone,
  website, hours, coordinates and `place_id`. Nothing is written until Save. The backend
  refuses a coordinate move beyond 100m: past that the URL describes a different shop,
  and accepting it would carry this cafe's logs and badges somewhere nobody earned them.
- **Admin modals were unusable and are fixed.** The backdrop used `bg-opacity-50`, which
  Tailwind v4 removed, so `bg-black` painted the page solid black; and the only way out
  was one button. They now use `bg-black/50`, close on Escape and on a backdrop click,
  and lock background scrolling while open.
- **Admin actions drop the cached lists.** Verifying, editing or deleting a cafe
  revalidates the cafe tags and `trending-cafes`, and the backend clears its memoised
  trending lists. Without both, a deleted cafe kept appearing on discover for up to four
  hours after the row was gone.
- `CoffeeLogForm.tsx` asks purchase users whether the cafe sells beans (checked by
  default). Unchecking submits a negative observation, and the form says the answer is
  reviewed before it reaches the cafe page — it is stored `pending` unless the log also
  carried a check-in the backend measured. “Want again” starts unset; selecting the
  chosen answer again clears the local selection.
- `app/actions/cafe.ts` revalidates after log creation and My Logs edits/deletes. It
  drops both `cafe-${cafeId}` and the broad `cafe` tag: a detail page is cached under
  whichever identifier its URL carried, usually a slug, while every caller here holds a
  UUID, so the narrow tag alone left slug-cached pages stale for two minutes. The action
  now also requires a session and a well-formed identifier — a Server Action is a public
  endpoint, and an anonymous caller could otherwise clear the cache in a loop.
  Detail fetches retain their 120-second revalidation. Remaining gap: a visibility change
  made outside this frontend invalidates nothing, since the backend has no way to reach
  Next's cache (SEC-10 in the [security audit](../security-audit-2026-09-09.md)).
- `shared/ui/FlipText.tsx` supplies the landing link hover animation. CSS handles
  reduced motion; duplicate letter faces are hidden from accessibility and selection.

The production build passed before this commit, with Supabase Edge Runtime warnings.
That check does not establish browser accessibility or resolution of audit findings.

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
    │   ├── common/
    │   ├── landing/
    │   ├── layout/
    │   ├── learn/
    │   ├── map/
    │   ├── profile/
    │   ├── providers/
    │   ├── settings/
    │   ├── shared/
    │   ├── ui/           # Legacy; see the note under Styling
    │   └── visits/
    ├── contexts/         # Global React context providers
    ├── features/         # Feature-based architectures and hooks
    ├── hooks/            # Global custom React Hooks
    ├── i18n/             # Localization configs and dictionaries
    ├── lib/              # Utils and client configurations (e.g., Supabase)
    │   └── api/          # Every call to the backend. See Key Features
    ├── middleware.ts     # Edge middleware for navigation/auth
    ├── shared/           # Common code bridging multiple features
    │   ├── contexts/
    │   ├── lib/
    │   ├── types/
    │   └── ui/           # The UI primitives in actual use
    ├── styles/           # See Styling below
    └── types/            # App-wide TypeScript definitions
```

## Profile and social (`0ecb396`, `882f917`)

- **Trust is followers and following.** `user_trust` has one row per "A trusts B";
  the profile header shows both directions as counts, and either one opens
  `TrustListModal` — fetched on open, not with the profile, because the list is
  unbounded and the page only ever asks about one person.
- **The server says whether you follow this person.** `is_trusted_by_me` rides on the
  public-profile response, which now takes optional auth. The page used to download its
  own entire following list and search it for one name, and answered "you follow
  nobody" for the whole time a newline in a PostgREST `select` was silently dropping the
  embed and returning `[]`. A multi-line `select` string is that bug waiting to happen —
  keep them on one line.
- **Unfollowing asks first.** The button that undoes it is the same button that did it,
  one click away, and the feed of logs it empties does not refill on its own. A `Modal`,
  not `confirm()`: the browser dialog cannot be translated and cannot name the person.
- **Reporting lives in the overflow.** `shared/ui/ActionsMenu` (was
  `components/cafe/CafeActionsMenu`, never cafe-specific) — a rare, irreversible-feeling
  action does not get a control in the row beside the one people came for.
- **Cafe hunter types, not flavour notes.** The eight `taste_tags` describe how someone
  reads a cafe (`bean_hunter`, `quiet_corner`, `work_friendly`), not what an espresso
  tastes like. Ids are enforced only in `app/models/user.py`; `user_taste_tags.tag` has
  no CHECK, so renaming one needs a data pass (migration 023, local).
- **`/shop` and `/community` are gone** (`c9fe635`). Neither was reachable from the app,
  both were in the sitemap, and the shop still sold gear for working in cafes — the
  framing the log was rewritten to drop. The badge gallery went with `/community`; a
  profile badge row is the open replacement.

## Auth screens (`4ea7194`, `cd3f579`)

- **One layout, five pages.** `features/auth/presentation/components/AuthLayout` is
  sign-in, sign-up, forgot-password, reset-password and complete-profile: the landing
  hero's still on the left as an inset card, the form on the right, only the form below
  `lg`. The rules behind it are in `design-language.md` §5 and §6.
- **`AuthHeading` is the page's `h1`, and a form renders its own.** A form with states
  ("sent", "done", "link expired") changes its heading with them, so the heading lives
  in the form component rather than the page. Sign-in and sign-up pass theirs from the
  page because they have one state.
- **`shared/ui/PixelImage`** is magicui's pixel-image rewritten as CSS
  (`.pixel-tile`, `.pixel-color` in `globals.css`): deterministic tile delays, no timer,
  held until the image loads, lazy `next/image` tiles that share one request.
- **`shared/ui/Input` merges classes with `cn()`.** A caller's `className` now wins over
  the base; the only other callers passing one were the two reset forms, whose dead
  overrides went in the same commit.
- **Reset emails go through Supabase's own mailer**, configured in the dashboard — not
  the backend's Resend client. When a mail does not arrive, look in the Supabase auth
  log, or send from a development build: the forgot-password form prints the real error
  only in development, because in production it would reveal which addresses have an
  account (design-language §2).

## Key Features

- **Monorepo-style structure** utilizing App Router (`apps/fe/src/app`)
- **Domain/Feature-based folder architecture** separating primitives (`shared/ui`)
  from feature logic (`features/`, domain `components/`)
- **Built-in i18n capabilities** dynamically routing locales
- **Robust typed configuration** across React, standard web primitives and data
- **Tailwind v4**, configured in CSS rather than a JavaScript config file
- **One door to the backend** (`lib/api/`). `client.ts` holds the base URL, the session
  token, the network-error wrapper and the `detail → message` error shape; each module
  beside it is one area of the API. A component that calls `fetch` on
  `NEXT_PUBLIC_API_URL` with a hand-built `Authorization` header is rebuilding all four,
  and gets a different answer than its neighbours on every one of them.

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

Deleting them early does not fail the build — Tailwind simply stops generating the
class, and the page ships with no background instead of an error. So the deletion is
gated on a count, not on a feeling. It reaches zero, then they go:

```sh
cd apps/fe && grep -rlE "\b(bg|text|border|from|to|via|ring|fill|stroke|shadow|divide|outline)-(primary|primaryText|secondary|accent|background|cardBackground|surface|text|textSecondary|border|success|warning|error|textHero|cardText|cardTextSecondary|surfaceText|surfaceTextSecondary|authText|starFilled|starEmpty|starEmptyOutline|cardShadow|pending|userMarkerMap|cafeMarker)\b" src --include="*.tsx" --include="*.ts" | wc -l
```

134 files as of the design-system branch. No lint rule guards this: every one of those
files would trip it, and the allowlist keeping them quiet would cost more than the
count does.

`components/ui/` is likewise vestigial: it holds a single file, while `shared/ui/` holds
the primitives actually imported across the app. Reach for `shared/ui`.
