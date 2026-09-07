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
- **State is the fill, not depth** (2026-09-02). A control is a rule and a fill; hover
  inverts the fill. The neumorphic relief that used to carry hover and press is gone —
  no soft double shadow, no 1px lift, no brand glow, nothing that reads as floating off
  the page. Nothing in a control moves either: no `translate`, no `scale`.
- **Three button shapes, and they are classes, not re-typed utility strings.**
  `btn-fill` (brand fill, `.btn-shade` press) is the page's one primary action;
  `btn-line` draws its rule in the current ink and fills with that ink on hover;
  `control-flat` is the same idea for a control that owns a surface, with `.is-active`
  for the selected member of a group. Size stays at the call site — a 52px hero CTA and
  a 30px inline link are the same shape at different scales.
- **`btn-line` needs to be told what is behind it.** Its hover fill cannot be
  `currentColor`: the same rule changes `color`, so the label ends up painted in its own
  background. `--btn-line-ink` is the ink it draws with, `--btn-line-on` the surface
  behind it; a section on another ground sets the pair once (the landing's dark band
  does) instead of every button on it re-specifying its hover.
- **Matcha Latte's `--c-brand-soft` is knowingly wrong.** It is the old lighter shade
  under the new cream ink, so hover measures 2.20:1 — below its own rest state.
  Deepening it is the fix if it ever matters.
- **The inverted band is its own slot on a dark theme.** `--surface-inverse` defaults to
  the ink, which is right on a light theme and wrong on a dark one -- there the ink is a
  near-white, and a full-width block of it is a lamp. A theme names `--c-inverse` to take
  it off that default (Dark Roast does); the other three inherit the ink.
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
- **A state colour is emphasis, not a text colour**, with one row on the record.
  `--state-success` and `--state-danger` over their own 12% tint measure 2.4-3.5:1 in
  three of the four themes. Set the label in `--ink-primary` and let the state colour be
  a dot beside it; the same goes for failure messages. The exception is the drawer's log
  out row, named in `--state-danger` at rest by decision: it measures 3.25:1 on the
  raised surface, below the 4.5:1 body threshold, and is kept because a colour that
  arrives only once the pointer is on the row arrives after the decision to press it.

## 5. Structure

The Discover surfaces were built twice — once quiet, once editorial — and the editorial
one shipped (2026-09-01). What that settled, for every page that follows:

- A page opens with a broadsheet masthead and a rule under it, not a gradient band.
- Panels are framed: `--radius-card`, one `--edge-rule` hairline, no drop shadow.
- Controls are pills. State is the fill — `control-flat` at rest, `.is-active` (brand
  fill) when selected — and the filled control is the page's one primary action. An
  active control takes the brand, never a 12% wash of it: a tint is a lit background,
  not a chosen state.
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
- **A name holds one line and ends in an ellipsis.** A cafe's name is data of unknown
  length; letting it wrap makes every card in a row a different height. `truncate`, with
  the full string on `title` and on the page the card opens.
- **A hint under a field starts where the field's text starts.** The input pads its text
  by `px-4`, so the line explaining it does too, or it reads as belonging to the form
  rather than to the field.
- **A panel that hangs over something closes on a click outside it, not on unhover** —
  and on `pointerdown`, so the same press still reaches the map or link underneath.
  Escape closes it too.
- **A field showing an answer rather than taking one is `readOnly`, not disabled**: it
  stays selectable and focusable, and `read-only:` styling is on the `Input` primitive so
  no caller repeats it. Reverting such a field is a reset of the whole form, never an
  unlock — half of one source with half of another is a record that matches neither.
- **Scroll regions inside small panels use `.scrollbar-quiet`**: no layout width, a
  hairline thumb on hover only.
- **A link out of the app is a small control** (`CAFE_ACTION_CLASS`, 30px), and it keeps
  the 44px target with an invisible band, not by growing.
- **Popovers sit above whatever opened them.** The `--z-*` stack in `tokens.css` is the
  whole ordering; add a band, do not add a bigger number.
- **A panel stands on `--surface-raised`, because that is what its hover is mixed
  from.** `--surface-hover` is `--c-raised` darkened; a menu laid on `--surface-page`
  gets a hover *lighter* than its own ground on the light themes (Morning Coffee's page
  is a tan, its raised surface a near-white cream) and the row reads as a wash rather
  than as something being pointed at.
- **A modal panel is the dialog primitive, not a portal written by hand.** The mobile
  drawer is a Base UI dialog: focus trap, Escape, focus restore, scroll lock and
  unmounting when closed all come with it. The hand-rolled version it replaced stayed in
  the DOM while closed, so every link in it was still reachable by Tab from the page
  behind.
- **A popup opened from inside a modal panel is portalled into that panel**, and is
  handed the element rather than a ref. Portalled to the body it lands outside the focus
  trap, and the dialog pulls focus straight back and closes it in the frame it opened; a
  ref is still null on the render that mounts the portal, which renders nothing at all
  while the trigger goes on reporting itself open.
- **The mobile drawer carries the bar's own structure, not a second one.** A section that
  exists in one and not the other is an information architecture the reader has to learn
  twice: the logs and the beans sit inside the account menu on the desktop bar, so they
  sit inside the account section here. The same rule removes the drawer's row icons --
  the bar is text pills with no icon vocabulary, so a glyph per row was invented in one
  place and nowhere else.
- **Elevation is one named token or nothing.** `--shadow-panel` for a floating panel,
  `--shadow-marker` for a pin on the map; both are fixed rather than theme-derived,
  because the themes' own shadow colours are light in the dark themes and would paint a
  halo. Cards and controls carry no shadow at all. An inline `boxShadow` string is not
  theme-aware and cannot be.

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
  the map) 3:1 — in **all four themes**, measured, not eyeballed. Measure on
  `/[locale]/theme-demo`, which reads the live cascade; the numbers written into docs are
  snapshots, not the source.
- **Three exceptions are on the record, and none is an oversight to fix on sight.**
  Matcha Latte's label on its brand is 3.37:1: the pair was read on screen and kept
  (`themes.css` says so beside the slot). `--marker-pending` is 2.21:1 on the map tiles
  in every theme; the white `--marker-ring` is what draws its edge. The drawer's log out
  row is 3.25:1, chosen so the warning is there before the press rather than after it.
  Anything else below the threshold is a bug.
- Interactive targets are at least 44×44, even when the visible chrome is smaller -- a
  `before:` band restores the target without inflating the button.
- **Every hover state has an `:active` twin.** A phone has no hover, so the press is the
  only moment a control can show that the tap landed; `.menu-item` carried its hover for
  weeks without one, and the drawer's rows answered a finger with nothing at all.
- Focus rings are never removed. `focus-visible` styling is part of the component, not
  an afterthought.
- Every icon-only control has a localised accessible name.
- Verify in English first: Korean labels run ~90px narrower and will pass a layout that
  English breaks.

## 7.1 Traps found the hard way

- **A `--color-*` bridge entry is what makes a token a utility.** `border-edge-rule` was
  written across the app for weeks and was never a class: `--color-edge-rule` was missing
  from the `@theme` block in `globals.css`, so Tailwind generated nothing and every one
  of those borders fell back to `currentColor` at full ink strength. When a token looks
  ignored, check the bridge before checking the value.
- **A component-layer rule loses to a shadcn utility.** The base button ships
  `border-transparent` and `hover:bg-muted` as utilities; `control-flat` had to move into
  `@layer utilities` to win.
- **Child effects run before the parent's.** A control whose colours are set by a parent
  effect measures the *old* values, which is how a swatch showed one colour and the
  number beside it another. Write that kind of change in the event handler.

## 8. Banned

| Banned | Use instead |
|---|---|
| `bg-primary`, `text-primaryText`, `cardBackground`, `cardText*`, `text-textSecondary`, any `--color-*` | The semantic tokens in `tokens.css`. The alias layer is deleted in Phase 6 |
| `--ibean-*` outside the legacy utilities | `--shadow-panel`, `--radius-*`, spacing utilities |
| `relief-control`, `relief-raised`, `relief-pressed`, any soft double shadow or hover lift | `control-flat`, `btn-line`, `btn-fill` |
| Hardcoded hex, `rgba()`, inline `boxShadow`, arbitrary `rounded-[…]`/`h-[…]` | Tokens |
| Emoji standing in for an icon (🔥 ⏳ ☕️ 📍) | `lucide-react`, or a `.landing-micro` word |
| Hand-rolled button classes | `shared/ui/Button` (`variant`, `size` already exist) |
| A second component that differs from an existing one by two classes | A `size`/`variant` prop on the existing one |
| Untranslated literals, locale ternaries | `next-intl` keys in `en.json` and `ko.json` |

## Related

- `docs/architecture/frontend-structure.md` — where things live
- `apps/fe/src/styles/tokens.css`, `themes.css` — the values themselves
