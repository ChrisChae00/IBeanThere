# Design language

What the landing and header established, written down so the rest of the app can be
built against it instead of re-derived from it. Phases 4-6 of the UI refactor follow
this document; new surfaces follow it from the start.

The single source of truth for values is `apps/fe/src/styles/tokens.css` (semantic) over
`themes.css` (per-theme primitives). This file states the *rules*; it never restates a
colour. If a rule and the stylesheet disagree, the stylesheet is right and this file is
stale.

## 1. Character

Four traits, in the order they win when they conflict.

1. **Editorial.** The app reads like a printed page: type sets the hierarchy, rules
   divide the page, whitespace does the rest. It is not a dashboard and does not want
   panels stacked inside panels.
2. **A record kept by hand.** The content is somebody's log of where they drank coffee.
   Counts, dates and place names are the interesting part; decoration is not.
3. **Quiet.** One filled control per view. Nothing pulses, bounces, or asks twice.
4. **Coffee is the subject, not the theme.** No bean icons standing in for bullets, no
   brown-on-brown for its own sake. Four themes exist; the layout must survive all four.

## 2. Voice

Applies to every visible string, both locales.

- **Say what happened, not how you feel about it.** "No cafes here yet." — not "Oops!
  Nothing found :(".
- **One sentence.** Two only when the second one tells the reader what to do next.
- **No exclamation marks.** No "Please". No apologising for a loading state.
- **Empty is an invitation, error is a fact.** An empty list offers the next action
  ("Be the first to add one"). An error says what failed and offers a retry — it never
  pretends the screen is merely empty.
- **Labels are nouns, actions are verbs.** "Trending", "Nearby" / "Drop Bean",
  "Register a cafe".
- **Korean is written, not translated.** Korean copy is written in Korean word order
  with Korean length; an English sentence with Korean words in it reads wrong and also
  breaks the line-height budget.
- **No string ships without a translation key.** A locale ternary in a component
  (`locale === 'ko' ? … : …`) is a missing key, not a shortcut.

## 3. Type

| Role | Class / element | Notes |
|---|---|---|
| Broadsheet display | `.landing-display` | `line-height: .88`, tight tracking, `text-wrap: balance`. Section-defining headlines only. |
| Page and section headings | `h1`–`h3` | Display face via `--font-display`, weight pinned with `font-variation-settings` |
| Micro label | `.landing-micro` | 11px, 600, `.12em` tracking, uppercase. Eyebrows, counts, meta rows, badge text |
| Body | default | `--font-body` |
| Caption | `.type-caption` | Legacy utility; replace when the file it lives in gets opened |

Rules:

- **Korean never takes a line-height below 1.** Hahmlet's syllable ink measures
  `-0.106em` to `0.796em` (0.902em tall), so a 0.88 line box makes consecutive lines
  collide. `:root:lang(ko) .landing-display` uses `1.06`. Anything under `0.91` in
  Korean is broken, not tight.
- **Negative tracking behaves differently per script.** In Latin it closes the gap
  between stems; in Korean it closes the gap between words. Korean gets roughly half.
- **`ch`-based indents are measurements, not constants.** `STEP_INDENTS_CH` in the
  landing hero was measured against that face and that copy. Change either and measure
  again.

## 4. Colour

- **One filled control per view** — the primary action. Everything else is ink, rule,
  or ghost. If a screen wants two filled buttons, one of them is not primary.
- **Hover widens the contrast a surface already has**; it does not move toward the ink.
  Dark brand goes darker, light brand goes lighter, about a fifth toward that theme's
  own extreme. A hover that moves toward the label is how three of four themes failed AA.
- **Hover and press are carried by relief, not by a colour swap** (`relief-control`,
  `.btn-shade`). Matcha Latte has no lighter brand shade left that still holds a legible
  label, so a colour-based hover would have to break either contrast or the theme.
- **Darkening overlays use `--scrim-media`, never `--brand`.** In dark themes the brand
  is a *light* foreground colour; painting a scrim with it removes the darkening.
- **State colours come from `--state-*`.** A raw Tailwind palette class
  (`bg-green-500`) is a bug: it does not move with the theme.
- **Domain colours have their own slots** — `--marker-cafe`, `--marker-user`,
  `--marker-pending`, `--star-*`. Reading `--brand` for a map pin couples two unrelated
  decisions.
- **A badge that claims something is painted; a badge that qualifies is not.** Trending
  is `--brand-hover` under `--ink-on-brand`; pending, verified and the rest sit on
  `--scrim-media` in `--ink-on-media`, or do not exist at all. A row that says the same
  word on every second card carries no information -- delete it rather than style it.
- **Domain markers are fixed where their ground is fixed.** `--marker-user` is one
  colour in all four themes: it sits on OpenStreetMap's tiles, which stay light, and it
  is the one pin a reader has to find at a glance.
- **Never encode meaning in colour alone.** Pending vs verified is a dashed vs solid
  border first, a colour second.
- **A state colour is emphasis, not a text colour.** `--state-success` and
  `--state-danger` over their own 12% tint measure 2.4-3.5:1 in three of the four
  themes. Set the label in `--ink-primary` and let the state colour be a dot beside it;
  the same goes for failure messages.

## 5. Structure

The Discover surfaces were built twice — once quiet, once editorial — and the editorial
one shipped (2026-09-01). What that settled, for every page that follows:

- A page opens with a broadsheet masthead and a rule under it, not a gradient band.
- Panels are framed: `--radius-card`, one `--edge-rule` hairline, no drop shadow.
- Controls are pills. State is depth (`relief-control` at rest, `relief-pressed` when
  active), not a colour swap; the filled control is the page's one primary action.
- Meta rows — counts, statuses, badges — are `.landing-micro`, never emoji.
- Names of things (a cafe, a person) are set in the body face. The display serif is for
  the page's own voice, not for data.


- **A rule before a card.** Grids are `gap-px` over `bg-edge-subtle`, so the gap itself
  is the hairline. Reach for a card only when the thing genuinely lifts off the page.
- **No panel inside a panel.** One elevation step per region.
- **Three radii exist**: `--radius-control` (10px), `--radius-card` (16px),
  `--radius-pill`. A literal `rounded-xl` in new code is a mistake.
- **Controls that act on one region live in one group at its edge, not on top of it.**
  The map's four verbs are a single button group above the frame (`-space-x-px`, pill
  ends, a tooltip each). A control laid over the thing it changes covers the change.
  Name the group's ends explicitly: `first:`/`last:` match every button when each one is
  the only child of its own tooltip wrapper.
- **A detail card opens beside what it describes, not in the middle of the screen.** On
  the map the pin is panned to a known place first and the card takes the empty half of
  the frame. Whether it goes beside or above is decided by whether it *fits*
  (`pin.x + halfPin + gap + cardWidth <= frameWidth - margin`), never by viewport width:
  a wide screen can still be a narrow column.
- **A card positioned inside a clipped frame caps its height against its own top**
  (`frameHeight - top - margin`), and observes its height rather than measuring it once.
  Content that grows after placement -- a disclosure opening -- otherwise runs under the
  frame's clip, where scrolling cannot reach it.
- **Scroll regions inside small panels use `.scrollbar-quiet`**: no layout width, a
  hairline thumb on hover only.
- **A link out of the app is a small control** (`CAFE_ACTION_CLASS`, 30px), and it keeps
  the 44px target with an invisible band, not by growing.
- **Popovers sit above whatever opened them.** The `--z-*` stack in `tokens.css` is the
  whole ordering; add a band, do not add a bigger number.
- **Elevation is `--relief-shadow-*` or a named `--shadow-*`.** An inline `boxShadow`
  string is not theme-aware and cannot be.

## 6. Motion

- **Above the fold is CSS** (`Reveal trigger="load"`, `.landing-rise`,
  `.landing-word*`). A stylesheet is render-blocking, so the from-state and the
  animation arrive with the first paint. A JS-parked `opacity: 0` above the fold is a
  blank screen until the motion bundle hydrates.
- **Below the fold may use Framer** (`Reveal trigger="view"`), because it is invisible
  before hydration anyway.
- **Nothing that runs per frame calls `setState`.** Write to a CSS custom property or to
  `textContent` (see `GrowthIndex`, `Counter`).
- **Scroll emphasis is a position calculation, not an IntersectionObserver.** IO is
  threshold-based; a fast scroll can put two rows past the line in one batch and leave
  the emphasis on the wrong one.
- **`prefers-reduced-motion` gets the finished page**, not an empty one.
- The base layer puts a 200ms transition on every `button, a, input, textarea, select`.
  Instant feedback requires an explicit `transition: none`.

## 7. Accessibility

- Body text 4.5:1, non-text (button fill against the page, focus rings, marker against
  the map) 3:1 — in **all four themes**, measured, not eyeballed.
- Interactive targets are at least 44×44, even when the visible chrome is smaller -- a
  `before:` band restores the target without inflating the button.
- Focus rings are never removed. `focus-visible` styling is part of the component, not
  an afterthought.
- Every icon-only control has a localised accessible name.
- Verify in English first: Korean labels run ~90px narrower and will pass a layout that
  English breaks.

## 8. Banned

| Banned | Use instead |
|---|---|
| `bg-primary`, `text-primaryText`, `cardBackground`, `cardText*`, `text-textSecondary`, any `--color-*` | The semantic tokens in `tokens.css`. The alias layer is deleted in Phase 6 |
| `--ibean-*` outside the legacy utilities | `--relief-shadow-*`, `--radius-*`, spacing utilities |
| Hardcoded hex, `rgba()`, inline `boxShadow`, arbitrary `rounded-[…]`/`h-[…]` | Tokens |
| Emoji standing in for an icon (🔥 ⏳ ☕️ 📍) | `lucide-react`, or a `.landing-micro` word |
| Hand-rolled button classes | `shared/ui/Button` (`variant`, `size` already exist) |
| A second component that differs from an existing one by two classes | A `size`/`variant` prop on the existing one |
| Untranslated literals, locale ternaries | `next-intl` keys in `en.json` and `ko.json` |

## Related

- `docs/architecture/frontend-structure.md` — where things live
- `apps/fe/src/styles/tokens.css`, `themes.css` — the values themselves
