'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/*
  Token proof surface.

  Everything below is read back from the live cascade rather than imported from a
  TypeScript object, so what you see is what the app actually renders. If a token is
  missing or resolves to nothing, it shows up here as blank instead of silently
  inheriting somewhere in a feature page.

  This is also where relief gets tuned: the shadow values per theme cannot be judged by
  reading CSS.
*/

const SURFACES = ['page', 'raised', 'elevated', 'sunken', 'hover', 'inverse'] as const;
const INKS = ['primary', 'secondary', 'muted', 'on-accent', 'on-media', 'inverse'] as const;
const ACCENTS = ['accent', 'accent-hover', 'accent-muted'] as const;
const EDGES = ['edge-subtle', 'edge-default', 'edge-strong'] as const;
const STATES = ['success', 'warning', 'danger', 'pending'] as const;
const DOMAIN = [
  'star-filled', 'star-empty', 'star-empty-edge',
  'marker-cafe', 'marker-user', 'marker-pending',
] as const;

/** sRGB relative luminance, per WCAG 2.1. */
function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Resolves any CSS colour syntax (including color-mix) by letting the browser do it.
 * Returns the alpha too: several tokens are deliberately translucent, and measuring
 * their raw channels against a background reports a contrast they never actually have.
 */
function parseColor(value: string): [number, number, number, number] | null {
  if (!value) return null;
  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  const match = resolved.match(/(\d+(?:\.\d+)?)/g);
  if (!match || match.length < 3) return null;
  const alpha = match.length > 3 ? Number(match[3]) : 1;
  return [Number(match[0]), Number(match[1]), Number(match[2]), alpha];
}

/** Flattens a translucent foreground onto its background before measuring. */
function composite(
  fg: [number, number, number, number],
  bg: [number, number, number, number],
): [number, number, number] {
  return [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])) as [number, number, number];
}

function contrast(a: string, b: string): number | null {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return null;
  const la = luminance(composite(ca, cb));
  const lb = luminance([cb[0], cb[1], cb[2]]);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function Swatch({ token, label }: { token: string; label: string }) {
  const [value, setValue] = useState('');
  useEffect(() => setValue(readToken(token)), [token]);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-[var(--radius-control)] border border-edge-default"
        style={{ background: `var(${token})` }}
      />
      <div className="leading-tight">
        <div className="text-sm font-medium text-ink-primary">{label}</div>
        <code className="text-xs text-ink-secondary">{value || '— unresolved'}</code>
      </div>
    </div>
  );
}

function ContrastRow({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  const [ratio, setRatio] = useState<number | null>(null);
  useEffect(() => setRatio(contrast(readToken(fg), readToken(bg))), [fg, bg]);

  const passes = ratio !== null && ratio >= 4.5;
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-[var(--radius-control)] px-4 py-3"
      style={{ background: `var(${bg})`, color: `var(${fg})` }}
    >
      <span className="text-sm">{label}</span>
      <span className="text-sm font-semibold tabular-nums">
        {ratio === null ? '—' : `${ratio.toFixed(2)}:1 ${passes ? 'AA' : 'FAIL'}`}
      </span>
    </div>
  );
}

function Section({ title, note, children }: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-1 text-2xl font-semibold text-ink-primary">{title}</h2>
      {note && <p className="text-sm text-ink-secondary">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ThemeDemoPage() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-ink-primary">Design tokens</h1>
        <p className="mt-2 max-w-2xl text-ink-secondary">
          Read live from the cascade, not from a palette object. Switch themes to tune
          relief and confirm every pairing still clears contrast.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {availableThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setTheme(theme.name)}
              className={`rounded-[var(--radius-pill)] px-5 py-2.5 text-sm font-medium transition-transform active:translate-y-px ${
                theme.name === currentTheme.name
                  ? 'relief-pressed bg-surface-raised text-ink-primary'
                  : 'relief-raised bg-surface-raised text-ink-secondary'
              }`}
            >
              {theme.displayName}
            </button>
          ))}
        </div>
      </header>

      <Section title="Surfaces">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {SURFACES.map((s) => (
            <Swatch key={s} token={`--surface-${s}`} label={s} />
          ))}
        </div>
      </Section>

      <Section title="Ink">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {INKS.map((s) => (
            <Swatch key={s} token={`--ink-${s}`} label={s} />
          ))}
        </div>
      </Section>

      <Section title="Accent, edges, state">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5">
          {ACCENTS.map((s) => <Swatch key={s} token={`--${s}`} label={s} />)}
          {EDGES.map((s) => <Swatch key={s} token={`--${s}`} label={s} />)}
          {STATES.map((s) => <Swatch key={s} token={`--state-${s}`} label={`state-${s}`} />)}
        </div>
      </Section>

      <Section title="Domain" note="Stars and map markers travel with the theme.">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {DOMAIN.map((s) => <Swatch key={s} token={`--${s}`} label={s} />)}
        </div>
      </Section>

      <Section
        title="Contrast"
        note="Every pairing here must clear 4.5:1 in all four themes. A FAIL is a blocker, not a note."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <ContrastRow label="ink-primary on surface-page" fg="--ink-primary" bg="--surface-page" />
          <ContrastRow label="ink-primary on surface-raised" fg="--ink-primary" bg="--surface-raised" />
          <ContrastRow label="ink-secondary on surface-raised" fg="--ink-secondary" bg="--surface-raised" />
          <ContrastRow label="ink-secondary on surface-page" fg="--ink-secondary" bg="--surface-page" />
          <ContrastRow label="ink-on-accent on accent" fg="--ink-on-accent" bg="--accent" />
          <ContrastRow label="ink-inverse on surface-inverse" fg="--ink-inverse" bg="--surface-inverse" />
        </div>
      </Section>

      <Section
        title="Relief"
        note="Controls only. Cards and sections stay flat — this is the whole neumorphism budget."
      >
        <div className="flex flex-wrap items-center gap-6 rounded-[var(--radius-card)] bg-surface-raised p-8">
          <button className="relief-raised rounded-[var(--btn-radius)] bg-surface-raised px-6 py-3 text-ink-primary">
            Raised
          </button>
          <button className="relief-pressed rounded-[var(--btn-radius)] bg-surface-raised px-6 py-3 text-ink-primary">
            Pressed
          </button>
          <input
            className="relief-pressed rounded-[var(--input-radius)] bg-surface-raised px-4 text-ink-primary outline-hidden"
            style={{ height: 'var(--input-height)' }}
            placeholder="Search field"
          />
          <div className="relief-raised grid size-12 place-items-center rounded-[var(--radius-pill)] bg-surface-raised text-ink-primary">
            &#9733;
          </div>
        </div>
      </Section>

      <Section title="Radius" note="Two values and a pill. Nothing else.">
        <div className="flex flex-wrap gap-6">
          {(['control', 'card', 'pill'] as const).map((r) => (
            <div key={r} className="flex flex-col items-center gap-2">
              <div
                className="size-24 border border-edge-default bg-surface-raised"
                style={{ borderRadius: `var(--radius-${r})` }}
              />
              <code className="text-xs text-ink-secondary">--radius-{r}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <div className="space-y-4">
          <h1 className="text-ink-primary">Heading one</h1>
          <h2 className="text-ink-primary">Heading two</h2>
          <h3 className="text-ink-primary">Heading three</h3>
          <p className="type-subtitle">Subtitle &mdash; the line under a section heading.</p>
          <p className="type-body text-ink-primary">
            Body copy. The editorial contrast is meant to come from the display and body
            split, not from stacking more weights onto one family.
          </p>
          <p className="type-caption">Caption / eyebrow</p>
        </div>
      </Section>
    </div>
  );
}
