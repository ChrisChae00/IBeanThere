'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lightbulb, MapPin } from 'lucide-react';
import type { CoffeeDrink, CoffeeCategory, Locale } from '@/data/coffee/types';
import CoffeeNode from './CoffeeNode';
import { MARKER_BASE, stageLadder } from './stageStyles';

type Messages = {
  backToRoadmap: string;
  origin: string;
  funFact: string;
  relatedDrinks: string;
  prevDrink: string;
  nextDrink: string;
};

type Props = {
  drink: CoffeeDrink;
  category: CoffeeCategory;
  relatedDrinks: CoffeeDrink[];
  prev?: CoffeeDrink;
  next?: CoffeeDrink;
  locale: string;
  messages: Messages;
};

const CARD =
  'rounded-3xl border border-border bg-cardBackground p-6 shadow-(--ibean-shadow-warm-sm)';

export default function CoffeeDrinkDetail({
  drink,
  category,
  relatedDrinks,
  prev,
  next,
  locale,
  messages,
}: Props) {
  const loc = locale as Locale;
  const content = drink.content[loc];
  const catContent = category.content[loc];
  const { marker, era } = stageLadder(category.accent, category.depth);
  const isDeepest = category.depth >= 3;
  const animate = !useReducedMotion();

  const rise = (delay: number) => ({
    initial: animate ? { opacity: 0, y: 16 } : false,
    animate: animate ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.4, delay },
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <motion.div
        initial={animate ? { opacity: 0, x: -12 } : false}
        animate={animate ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.3 }}
      >
        <Link
          href={`/${locale}/learn/coffee`}
          className="inline-flex items-center gap-1.5 rounded-lg text-sm text-textSecondary transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          {messages.backToRoadmap}
        </Link>
      </motion.div>

      {/* Hero — same marker + era pill as the stage it belongs to */}
      <motion.header {...rise(0.05)} className="mt-8">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`${MARKER_BASE} ${marker} ${isDeepest ? 'text-primaryText' : ''}`}
          >
            {category.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">
              {catContent.name}
            </p>
            <p className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 ${era}`}>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-textSecondary">
                {catContent.era}
              </span>
            </p>
          </div>
        </div>

        <h1 className="mt-6 text-text">{content.name}</h1>
        <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-textSecondary">
          {content.tagline}
        </p>
      </motion.header>

      <div className="mt-10 max-w-[65ch] space-y-4">
        {content.description.split('\n\n').map((paragraph, i) => (
          <p key={i} className="type-body text-text">
            {paragraph}
          </p>
        ))}
      </div>

      <section className={`mt-10 ${CARD}`}>
        <h2 className="flex items-center gap-2 text-base font-semibold text-cardText">
          <MapPin aria-hidden className="h-4 w-4 text-primary" />
          {messages.origin}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-cardTextSecondary">
          {content.origin}
        </p>
      </section>

      <section
        className="mt-4 rounded-3xl border border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] p-6"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold text-text">
          <Lightbulb aria-hidden className="h-4 w-4 text-primary" />
          {messages.funFact}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-textSecondary">
          {content.funFact}
        </p>
      </section>

      {(prev || next) && (
        <nav
          aria-label={catContent.name}
          className="mt-12 grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/${locale}/learn/coffee/${prev.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-cardBackground px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--ibean-shadow-warm-sm) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <ArrowLeft
                aria-hidden
                className="h-4 w-4 shrink-0 text-cardTextSecondary transition-transform group-hover:-translate-x-0.5"
              />
              <span className="min-w-0">
                <span className="block text-xs text-cardTextSecondary">
                  {messages.prevDrink}
                </span>
                <span className="block truncate text-sm font-medium text-cardText">
                  {prev.content[loc].name}
                </span>
              </span>
            </Link>
          ) : (
            <span aria-hidden />
          )}

          {next && (
            <Link
              href={`/${locale}/learn/coffee/${next.slug}`}
              className="group flex items-center justify-end gap-3 rounded-2xl border border-border bg-cardBackground px-4 py-3 text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--ibean-shadow-warm-sm) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span className="min-w-0">
                <span className="block text-xs text-cardTextSecondary">
                  {messages.nextDrink}
                </span>
                <span className="block truncate text-sm font-medium text-cardText">
                  {next.content[loc].name}
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-cardTextSecondary transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </nav>
      )}

      {relatedDrinks.length > 0 && (
        <section className="mt-12">
          <h2 className="type-caption">{messages.relatedDrinks}</h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {relatedDrinks.map(related => (
              <li key={related.slug}>
                <CoffeeNode
                  drink={related}
                  locale={locale}
                  accent={category.accent}
                  depth={category.depth}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
