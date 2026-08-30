'use client';

/*
  The landing page.

  A broadsheet: type carries the structure, rules replace cards, and the only
  filled control on the page is the primary action. The content is the product's
  own -- five growth stages, cafe registration, three explorer types, one
  primary action.

  It uses the project's own tokens throughout. No new colour is introduced, so
  all four themes still work; the reference's single-accent-on-monochrome logic
  maps onto `--brand` sitting alone on `--surface-page`.

  The hero is the exception: it runs over the same moving backdrop as the live
  variant, so its type is set in `--ink-on-media` against the scrim rather than
  in page ink. The brand colour cannot mark anything up there -- Morning
  Coffee's brown measures 1.2:1 on the scrim -- so emphasis inside the headline
  is carried by opacity of one light ink, the same way the header does it.
*/

import { useAuth } from '@/hooks/useAuth';
import HeroMedia from './HeroMedia';
import { GlobeCanvas, type GlobeTheme } from './GlobeCanvas';
import { Map, BookOpen, Share2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  SeedIcon,
  SproutIcon,
  GrowingIcon,
  TreeIcon,
  HarvestIcon,
} from './GrowthJourneyIcons';
import type { CafeStats } from '@/lib/api/stats';
import Marquee from './Marquee';
import { Counter, Reveal, RevealWords } from './motion';

type Stage = {
  title: string;
  badge: string;
  description: string;
  highlights: string[];
};

export type LandingMessages = {
  heroLine1: string;
  heroLine2: string;
  heroLine3: string;
  /* Rich text: the product name inside it is set in the display face. */
  heroLede: ReactNode;
  heroCta: string;
  heroCtaLoggedIn: string;
  heroCtaSecondary: string;
  indexTitle: string;
  indexNote: string;
  registerTitle: string;
  registerLede: string;
  registerCta: string;
  /* Summary line and the detail behind it, one pair per disclosure. */
  registerNotes: { title: string; body: string }[];
  personasTitle: string;
  personasNote: string;
  closeLine1: string;
  closeLine2: string;
  closeNote: string;
  closeCta: string;
  closeCtaLoggedIn: string;
  marquee: string;
  /* Only the label under the hero figure; the rest of the stats copy is unused
     until the growth chart comes back. */
  stats: { cafes: string };
  stages: Stage[];
  personas: { title: string; description: string }[];
};

const STAGE_ICONS = [SeedIcon, SproutIcon, GrowingIcon, TreeIcon, HarvestIcon];

/*
  The globe, themed for the dark break it sits in.

  cobe takes plain RGB triples, not CSS colours, so these cannot come from the
  token layer. They are read against `--surface-inverse`, the darkest slot in
  all four themes, so one set holds everywhere.
*/
const DARK_GLOBE: GlobeTheme = {
  /*
    `dark: 0` lights the whole sphere: with a night side, half the land is in
    shadow at any moment and the globe reads as a mood rather than as a map.
  */
  dark: 0,
  // White ocean. cobe draws the landmass dots against the base colour, so a
  // white sphere is what makes the coastlines legible on a dark ground.
  baseColor: [1, 1, 1],
  markerColor: [0.55, 0.35, 0.23],
  glowColor: [0.32, 0.25, 0.2],
  /*
    Latitude the camera looks at, in radians. Equator-centred put the whole
    northern landmass -- Canada especially -- on the receding upper curve where
    the dots crowd together and stop reading. This is about 13 degrees north:
    enough to look down on the globe at a slight angle and open up the north,
    short of the shipped 0.3 which spends the top of the sphere on the Arctic.
  */
  theta: 0.23,
  // Eased back from Earth's real 23.5 degrees, then set by eye.
  tiltDeg: 23,
};

/*
  One mark per explorer type, in the shipped section's order: a map, a book, a
  share graph. The shipped section fills them at 48px in blue, amber and orange
  inside rounded cards -- three accent colours and a box, neither of which this
  page has. Here they are hairline drawings at 32px, set in page ink and picking
  up the brand only when the column they belong to is hovered, which is the same
  move the heading underneath already makes.
*/
const PERSONA_MARKS = [Map, BookOpen, Share2];

/*
  Indents for the three stepped hero lines, in character widths.

  All three are set by eye rather than by a formula -- the step widens as it
  descends, so the staircase leans into the last line instead of marching. The
  third carries the alignment that matters: the final "e" of "was once" sits
  over the end of "secret" on the line below, one space to the left of where
  that "e" would land exactly on the letter boundary. The numbers are measured
  in this face against this copy, and they move if either changes.
*/
const STEP_INDENTS_CH = [0, 1.64, 4.63];

/* The page's one horizontal measure. Everything hangs off it. */
const MEASURE = 'mx-auto w-full max-w-[1400px] px-6 md:px-10';

export default function Landing({
  messages,
  locale,
  stats,
}: {
  messages: LandingMessages;
  locale: string;
  stats: CafeStats | null;
}) {
  const { user, isLoading } = useAuth();
  const isLoggedIn = !isLoading && !!user;

  const primaryHref = isLoggedIn ? `/${locale}/discover/dropbean` : `/${locale}/register`;

  return (
    <div className="bg-surface-page text-ink-primary">
      <LandingHero
        messages={messages}
        locale={locale}
        primaryHref={primaryHref}
        primaryLabel={isLoggedIn ? messages.heroCtaLoggedIn : messages.heroCta}
        stats={stats}
      />

      {/*
        The strip is a section, not a divider, so it is set in the display face
        at reading size. It butts straight onto the photograph -- the hero ends
        on its own rule and the strip picks it up -- and carries all of the air
        between itself and the index below.
      */}
      <Marquee
        text={messages.marquee}
        duration={60}
        size="display"
        className="mb-[56px] md:mb-[76px]"
      />

      <GrowthIndex messages={messages} />

      <WaveDivider from="var(--surface-page)" to="var(--surface-inverse)" />

      <RegisterSection messages={messages} locale={locale} />

      <WaveDivider from="var(--surface-inverse)" to="var(--surface-page)" />

      <Personas messages={messages} />

      <WaveDivider from="var(--surface-page)" to="var(--surface-elevated)" />

      <ClosingAction
        messages={messages}
        primaryHref={primaryHref}
        primaryLabel={isLoggedIn ? messages.closeCtaLoggedIn : messages.closeCta}
      />

      {/* Into the footer, which is a solid field of `--brand`. */}
      <WaveDivider from="var(--surface-elevated)" to="var(--brand)" />
    </div>
  );
}

/* ---------------------------------------------------------------- hero --- */

function LandingHero({
  messages,
  locale,
  primaryHref,
  primaryLabel,
  stats,
}: {
  messages: LandingMessages;
  locale: string;
  primaryHref: string;
  primaryLabel: string;
  stats: CafeStats | null;
}) {
  /*
    The three stepped lines, split out of the two copy lines the live hero sets
    as one. Splitting here rather than adding three more message keys keeps one
    copy of the words, so the two variants cannot drift apart.

    The split is on the first space, which reads correctly in both locales --
    "Every | good cafe" and "좋은 | 카페는".
  */
  const [firstWord, ...restWords] = messages.heroLine1.split(' ');
  const steps = [firstWord, restWords.join(' '), messages.heroLine2].filter(Boolean);

  return (
    /*
      Pulled up under the fixed header so the media runs behind it, exactly as
      the live hero does. `min-h-screen` so the backdrop is a full field rather
      than a band.
    */
    <header className="relative -mt-16 min-h-screen overflow-hidden">
      <HeroMedia />

      <div className={`relative ${MEASURE} flex min-h-screen flex-col justify-center pt-28 pb-20 md:pt-32`}>
        {/*
          A stepped headline. The first three lines each take one more indent
          than the last, and the fourth returns to the margin -- so the eye
          walks down the steps and lands on the line that carries the sentence.

          The indents are in `ch` -- one character width of the face at its
          current size -- so the staircase holds its shape at every size the
          clamp produces. A pixel indent would read as two characters at the top
          of the clamp and as four at the bottom.
        */}
        <h1 className="landing-display text-[clamp(2.5rem,8vw,7rem)] text-ink-on-media drop-shadow-lg break-keep">
          {steps.map((step, index) => (
            <span
              key={step}
              className="block"
              style={{ paddingLeft: `${STEP_INDENTS_CH[index]}ch` }}
            >
              <RevealWords text={step} stagger={0.07} />
            </span>
          ))}
          <span className="block">
            <RevealWords text={messages.heroLine3} stagger={0.06} />
          </span>
        </h1>

        <div className="mt-12 grid gap-10 border-t border-ink-on-media/20 pt-8 md:mt-16 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Reveal trigger="load" delay={0.2}>
            <p className="max-w-2xl text-lg leading-relaxed text-ink-on-media/85 drop-shadow-sm break-keep md:text-xl">
              {messages.heroLede}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/*
                The only filled control on the page. Its shadow is tinted with
                the brand rather than with grey, so the elevation belongs to the
                accent system instead of reading as generic UI depth.
              */}
              <a
                href={primaryHref}
                className="landing-micro inline-flex min-h-[52px] items-center rounded-control bg-brand px-8 text-ink-on-brand shadow-[0_8px_24px_-6px_var(--brand)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {primaryLabel}
              </a>
              <a
                href={`/${locale}/discover/explore-map`}
                className="landing-micro inline-flex min-h-[52px] items-center border-b border-ink-on-media pb-1 text-ink-on-media transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
              >
                {messages.heroCtaSecondary}
              </a>
            </div>
          </Reveal>

          {/*
            The headline figure. `leading-none` overrides the display face's
            0.88 line box -- at 0.88 the glyphs sit taller than their own block
            and the label underneath collides with the digits.
          */}
          <Reveal trigger="load" delay={0.3} className="md:text-right">
            <Counter
              value={stats?.total_cafes ?? 0}
              className="landing-display block text-[clamp(3rem,9vw,7rem)] leading-none text-ink-on-media tabular-nums"
            />
            <span className="landing-micro mt-4 block text-ink-on-media/70">{messages.stats.cafes}</span>
          </Reveal>
        </div>
      </div>
    </header>
  );
}

/* --------------------------------------------------------------- index --- */

/*
  Where a row's emphasis sits across its travel through the viewport.

  `progress` is 0 when the row's top meets the bottom of the screen and 1 when
  its bottom leaves the top -- Motion's `["start end", "end start"]` window,
  written out: each pair names a point on the target and a point on the
  container, in that order. So it is exactly 0.5 when the row is centred, and
  the curve below comes up to full ink over the quarter before that, holds
  through the middle, and goes back down over the quarter after. Passing a
  stage puts it back at rest, which is the behaviour the list had before.
*/
const EMPHASIS_STOPS = [0.24, 0.42, 0.58, 0.76];

/** The curve above, sampled. 0 at rest, 1 at full emphasis. */
function emphasisAt(progress: number) {
  const [inStart, inEnd, outStart, outEnd] = EMPHASIS_STOPS;
  if (progress <= inStart || progress >= outEnd) return 0;
  if (progress < inEnd) return (progress - inStart) / (inEnd - inStart);
  if (progress <= outStart) return 1;
  return (outEnd - progress) / (outEnd - outStart);
}

/**
 * The five growth stages as an index. Each row carries its own badge in the
 * left column, so a stage and the words about it are always on the same line.
 *
 * An earlier pass put one oversized badge in a sticky column that swapped as
 * you scrolled. It read as a separate thing happening beside the list rather
 * than as the list's own marker -- there was no line connecting the badge on
 * screen to the row it belonged to. The scroll still drives which stage is
 * live; it drives emphasis instead of position.
 *
 * That emphasis is read from where each row sits, not from an intersection
 * event. The list used to pick one live row with an `IntersectionObserver` over
 * a band across the middle of the screen, which is a threshold: it fires when a
 * row crosses an edge and says nothing in between, so a fast flick could carry
 * two rows across the band inside one callback batch and leave the emphasis on
 * whichever entry the browser reported last. Position is not a threshold. Every
 * frame each row knows where it is, so scrolling at any speed lands on the
 * right stage, and the rows on either side are already partway there.
 *
 * The value is written to the row as a custom property and the children read it
 * out of the cascade, so a frame costs one style write per row and no React
 * render at all.
 */
function GrowthIndex({ messages }: { messages: LandingMessages }) {
  const rowsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // With motion off, every row stays at the full ink it renders with.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rows = rowsRef.current.filter(Boolean) as HTMLLIElement[];
    if (rows.length === 0) return;

    let frame = 0;

    const paint = () => {
      frame = 0;
      const viewport = window.innerHeight;
      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        const travel = rect.height + viewport;
        const progress = Math.min(1, Math.max(0, (viewport - rect.top) / travel));
        row.style.setProperty('--emphasis', emphasisAt(progress).toFixed(3));
      }
    };

    // Coalesced to one paint per frame: scroll fires far more often than that.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <section className={`${MEASURE} pb-20 md:pb-28`}>
      <Reveal>
        {/*
          Not held to a 3xl column: at that width the line broke in two for the
          sake of a measure nothing else on the page is keeping.
        */}
        <h2 className="landing-display text-[clamp(2.5rem,6vw,5rem)] break-keep">
          {messages.indexTitle}
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-secondary break-keep">
          {messages.indexNote}
        </p>
      </Reveal>

      <ol className="mt-16 grid gap-px bg-edge-subtle">
        {messages.stages.map((stage, index) => {
          const Icon = STAGE_ICONS[index] ?? STAGE_ICONS[0];
          return (
            <li
              key={stage.title}
              ref={(node) => {
                rowsRef.current[index] = node;
              }}
              /*
                Starts at 1, so the server's markup and a browser with motion
                turned off both read as a plain, fully legible list.
              */
              style={{ '--emphasis': 1 } as React.CSSProperties}
              /*
                One centred column rather than badge-left / words-right. The
                stages are read one at a time as they come up the screen, and a
                centred stack puts the badge, the name and the sentence on the
                same axis instead of asking the eye to cross the row.
              */
              className="flex flex-col items-center gap-6 bg-surface-page py-12 text-center md:py-16"
            >
              <div className="flex flex-col items-center gap-4">
                {/*
                  Scale and opacity, not colour -- the four themes have four inks
                  and a fixed muted colour is wrong in at least two of them.
                */}
                <span
                  className="block shrink-0 origin-center"
                  style={{ transform: 'scale(calc(0.82 + 0.18 * var(--emphasis)))' }}
                >
                  <Icon className="h-16 w-16 md:h-24 md:w-24" />
                </span>
                <p className="landing-micro" style={{ opacity: EMPHASIS_OPACITY }}>
                  {stage.badge}
                </p>
              </div>

              <div style={{ opacity: EMPHASIS_OPACITY }}>
                <h3 className="landing-display text-[clamp(1.75rem,4vw,3rem)] break-keep">
                  {stage.title}
                </h3>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-secondary break-keep md:text-lg">
                  {stage.description}
                </p>
                <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
                  {stage.highlights.map((highlight) => (
                    <li key={highlight} className="landing-micro text-ink-secondary">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* A row at rest still reads; it just stops asking to be read. */
const EMPHASIS_OPACITY = 'calc(0.45 + 0.55 * var(--emphasis))';

/* ------------------------------------------------------------ register --- */

function RegisterSection({ messages, locale }: { messages: LandingMessages; locale: string }) {
  return (
    // The dark editorial break. Full-bleed on purpose: it is the page turning
    // over, so it must not sit inside the measure.
    <section className="bg-surface-inverse text-ink-inverse">
      <div className={`${MEASURE} py-24 md:py-32`}>
        {/*
          The globe column has to be at least as wide as the canvas it holds:
          the canvas sizes itself in pixels and stretches to its cell, so a
          narrower column squashes the sphere into an ellipse instead of
          scaling it down.

          Which is why the split waits for `xl` rather than `md`. On a tablet
          the fixed 29rem column was taking two thirds of the row and leaving
          the headline to set itself one word per line in what was left. Below
          that width the two stack, at full measure each, and the globe keeps
          its size.
        */}
        <div className="grid items-center gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(29rem,30rem)] xl:gap-16">
          <Reveal>
            {/* Smaller than the page's other headings: this one shares its row. */}
            <h2 className="landing-display text-[clamp(2.25rem,5.5vw,4.5rem)] break-keep">
              {messages.registerTitle}
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-relaxed opacity-80 break-keep">
              {messages.registerLede}
            </p>

            {/*
              The three facts used to sit open under a paragraph that said the
              same things again at length. They are now the paragraph: each one
              is a line you can read at a glance and open only if you want the
              detail behind it.

              `details`/`summary` rather than state and buttons -- the element
              is a disclosure already, keyboard-operable and announced as one,
              and it does not need the section to hold open/closed state.
            */}
            <ul className="mt-10 grid gap-px bg-ink-inverse/20">
              {messages.registerNotes.map((note, index) => (
                <li key={note.title} className="bg-surface-inverse">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-4 py-4 transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
                      {/*
                        A shape per row rather than a number. Three facts, not
                        three steps -- an ordinal would promise an order that
                        does not exist.
                      */}
                      <NoteMark index={index} />
                      <span className="text-sm leading-relaxed break-keep">{note.title}</span>
                      {/*
                        A plus that becomes a minus: the crossbar is the one
                        that turns. Drawn rather than a glyph so it inherits the
                        stroke weight of the rules around it.
                      */}
                      <svg
                        aria-hidden
                        viewBox="0 0 12 12"
                        className="ml-auto h-3 w-3 shrink-0 opacity-60"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <line x1="1" y1="6" x2="11" y2="6" />
                        <line
                          x1="6"
                          y1="1"
                          x2="6"
                          y2="11"
                          className="origin-center transition-transform duration-300 group-open:rotate-90 group-open:opacity-0"
                        />
                      </svg>
                    </summary>
                    {/*
                      Full ink, not a dimmed one: the body only exists once
                      someone has opened it, and setting it back from the line
                      that opened it makes the answer harder to read than the
                      question.
                    */}
                    <p className="pb-5 pl-[1.625rem] text-sm leading-relaxed break-keep">
                      {note.body}
                    </p>
                  </details>
                </li>
              ))}
            </ul>

            <a
              href={`/${locale}/discover/register-cafe`}
              className="landing-micro mt-10 inline-flex min-h-[52px] items-center rounded-control border border-current px-8 transition-colors duration-200 hover:bg-ink-inverse hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              {messages.registerCta}
            </a>
          </Reveal>

          {/*
            The globe, in place of the cropped interior shot that was here. The
            point being made is "a cafe anywhere", which a turning planet says
            and a photograph of one room does not. Same component and same dark
            theming as the live variant uses.
          */}
          <Reveal delay={0.12} className="flex justify-center xl:justify-end">
            <GlobeCanvas theme={DARK_GLOBE} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Row marker for the register notes: circle, triangle, square, in that order.
 *
 * Drawn as SVG rather than as a glyph so the vertices can be rounded. The
 * triangle and the square are stroked in their own fill colour with a round
 * line join, which is what rounds the corners -- `rx` only does that for a
 * rectangle, and nothing does it for a polygon.
 */
function NoteMark({ index }: { index: number }) {
  const shape = index % 3;

  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="h-2.5 w-2.5 shrink-0"
      fill="var(--brand-muted)"
      stroke="var(--brand-muted)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    >
      {shape === 0 ? <circle cx="6" cy="6" r="4.2" stroke="none" /> : null}
      {/* Equilateral, centred on the box: height = side * sqrt(3) / 2. */}
      {shape === 1 ? <path d="M6 2.2 L9.9 8.9 L2.1 8.9 Z" /> : null}
      {shape === 2 ? <rect x="2.4" y="2.4" width="7.2" height="7.2" /> : null}
    </svg>
  );
}

/* ------------------------------------------------------------ personas --- */

function Personas({ messages }: { messages: LandingMessages }) {
  return (
    <section className={`${MEASURE} py-20 md:py-28`}>
      {/*
        Stacked rather than headline-left / note-right: side by side, the note
        took enough of the row that the headline set itself over two lines for
        no reason. On its own line it fits, and the note reads as its subtitle.
      */}
      <Reveal className="border-b border-edge-default pb-8">
        <h2 className="landing-display text-[clamp(2.5rem,7vw,5.5rem)] break-keep">
          {messages.personasTitle}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-ink-secondary break-keep">
          {messages.personasNote}
        </p>
      </Reveal>

      {/*
        No cards, no icons, no hover-scale. Three columns of type separated by
        rules — on this page a bordered box would be the one piece of chrome
        that broke the metaphor.
      */}
      <div className="mt-px grid grid-cols-1 gap-px bg-edge-subtle md:grid-cols-3">
        {messages.personas.map((persona, index) => {
          const Mark = PERSONA_MARKS[index] ?? PERSONA_MARKS[0];
          return (
          <Reveal key={persona.title} delay={index * 0.08} className="group bg-surface-page py-10 md:px-8">
            {/*
              `strokeWidth` 1, not lucide's 2: at the weight it ships with, the
              glyph reads as a UI icon sitting on an editorial page. At 1 it is
              the same hairline as the rules around it and belongs to the page.
            */}
            <Mark
              aria-hidden
              strokeWidth={1}
              className="mb-6 h-8 w-8 text-ink-secondary transition-colors duration-300 group-hover:text-brand"
            />
            <h3 className="landing-display text-[clamp(1.75rem,3vw,2.5rem)] transition-colors duration-300 group-hover:text-brand break-keep">
              {persona.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary break-keep">
              {persona.description}
            </p>
          </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- close --- */

function ClosingAction({
  messages,
  primaryHref,
  primaryLabel,
}: {
  messages: LandingMessages;
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <section className="bg-surface-elevated">
      <div className={`${MEASURE} py-24 md:py-32`}>
        <h2 className="landing-display text-[clamp(3rem,10vw,9rem)] break-keep">
          <span className="block">
            <RevealWords text={messages.closeLine1} />
          </span>
          <span className="block text-brand">
            <RevealWords text={messages.closeLine2} stagger={0.07} />
          </span>
        </h2>

        <Reveal delay={0.2} className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <a
            href={primaryHref}
            className="landing-micro inline-flex min-h-[56px] w-fit items-center rounded-control bg-brand px-10 text-ink-on-brand shadow-[0_8px_24px_-6px_var(--brand)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {primaryLabel}
          </a>
          <p className="max-w-md text-sm italic leading-relaxed text-ink-secondary break-keep">
            {messages.closeNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- wave --- */

/*
  The line where one section's colour becomes the next one's, drawn as a wave
  instead of as a straight edge -- the surface of a cup rather than a ruled
  boundary. Four of them: the page rising into the hero photograph, the page
  turning dark for registration, back to light after it, and up onto the raised
  surface the closing action sits on.

  The shape is different on every load. It is generated on the client after
  mount rather than during render, which is the whole reason there is a fixed
  starting path: a `Math.random()` read while rendering produces one shape on
  the server and a different one in the browser, and React discards the markup
  it just streamed. The first path is a real wave, so the swap is a shape
  settling, not a divider appearing.
*/

const WAVE_W = 1200;
const WAVE_H = 120;
/* Four segments: enough for two crests, few enough to stay a calm surface. */
const WAVE_SEGMENTS = 4;

/**
 * A wave whose crest heights come from `next`, filled downwards.
 *
 * Each segment is a cubic with both handles pulled fully to the horizontal, so
 * every joint is flat -- that is what keeps the curve smooth across the seams
 * instead of showing a corner at each control point.
 */
function wavePath(next: () => number) {
  const step = WAVE_W / WAVE_SEGMENTS;
  const heights = Array.from(
    { length: WAVE_SEGMENTS + 1 },
    () => WAVE_H * 0.5 + (next() * 2 - 1) * WAVE_H * 0.34,
  );

  let d = `M0 ${heights[0].toFixed(1)}`;
  for (let index = 0; index < WAVE_SEGMENTS; index += 1) {
    const left = index * step;
    const right = left + step;
    const handle = step / 2;
    d += ` C${(left + handle).toFixed(1)} ${heights[index].toFixed(1)},`;
    d += ` ${(right - handle).toFixed(1)} ${heights[index + 1].toFixed(1)},`;
    d += ` ${right.toFixed(1)} ${heights[index + 1].toFixed(1)}`;
  }
  return `${d} L${WAVE_W} ${WAVE_H} L0 ${WAVE_H} Z`;
}

/* Rendered on the server and for the first client paint. */
const WAVE_STILL = wavePath(
  (() => {
    const fixed = [0.62, 0.28, 0.74, 0.34, 0.58];
    let cursor = 0;
    return () => fixed[cursor++ % fixed.length];
  })(),
);

function WaveDivider({
  from,
  to,
}: {
  /** Colour above the line. */
  from: string;
  /** Colour below the line -- the section the wave is pouring into. */
  to: string;
}) {
  const [path, setPath] = useState(WAVE_STILL);

  useEffect(() => setPath(wavePath(Math.random)), []);

  return (
    <div
      aria-hidden
      className="pointer-events-none w-full"
      /* Scales with the page so the wave is never a hairline on a phone nor a
         band on a wide screen. */
      style={{ background: from, height: 'clamp(56px, 8vw, 128px)' }}
    >
      {/* `none`: the wave stretches to the viewport rather than keeping its
          own 10:1 ratio and leaving the colour unresolved at the sides. */}
      <svg
        viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
        preserveAspectRatio="none"
        /* One pixel taller than the box: the fill lands on a fractional
           device pixel at most zoom levels, and stopping exactly on the
           boundary leaves a hairline of the wrong colour under the wave. */
        className="block w-full"
        style={{ height: 'calc(100% + 1px)' }}
      >
        <path d={path} fill={to} style={{ transition: 'd 900ms ease-out' }} />
      </svg>
    </div>
  );
}
