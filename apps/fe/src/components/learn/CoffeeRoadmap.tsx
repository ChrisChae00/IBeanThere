'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { CoffeeCategory, CoffeeDrink, Locale } from '@/data/coffee/types';
import CoffeeNode from './CoffeeNode';
import { MARKER_BASE, stageLadder } from './stageStyles';

type Messages = {
  title: string;
  subtitle: string;
  eyebrow: string;
  stageCount: string;
  drinkCount: string;
};

type Props = {
  categories: CoffeeCategory[];
  drinksByCategory: Record<string, CoffeeDrink[]>;
  /** Category id → "Branches from Espresso", resolved server-side. */
  branchLabels: Record<string, string>;
  locale: string;
  messages: Messages;
};

/**
 * The rail is drawn per row, anchored to the marker column's own width, so it
 * stays centred under the marker at every viewport width. A branch reaching its
 * parent is dashed rather than forked — the geometry can't drift out of line.
 */
function Stage({
  category,
  drinks,
  branchLabel,
  locale,
  isLast,
  nextIsBranch,
}: {
  category: CoffeeCategory;
  drinks: CoffeeDrink[];
  branchLabel?: string;
  locale: string;
  isLast: boolean;
  nextIsBranch: boolean;
}) {
  const content = category.content[locale as Locale];
  const { marker, era } = stageLadder(category.accent, category.depth);
  const isDeepest = category.depth >= 3;

  return (
    <li className="relative grid grid-cols-[2.75rem_1fr] gap-x-4 pb-12 last:pb-0 sm:gap-x-6">
      {!isLast && (
        <span
          aria-hidden
          className={`absolute left-5.5 top-13 bottom-0 -translate-x-1/2 ${
            nextIsBranch
              ? 'border-l border-dashed border-[color-mix(in_srgb,var(--color-text)_28%,transparent)]'
              : 'w-px bg-[color-mix(in_srgb,var(--color-text)_20%,transparent)]'
          }`}
        />
      )}

      <span
        aria-hidden
        className={`${MARKER_BASE} ${marker} ${isDeepest ? 'text-primaryText' : ''}`}
      >
        {category.icon}
      </span>

      <div className="min-w-0 pt-1">
        <p className={`inline-flex rounded-full border px-2.5 py-0.5 ${era}`}>
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-textSecondary">
            {content.era}
          </span>
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-[-0.01em] text-text sm:text-2xl">
          {content.name}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-textSecondary">
          {content.subtitle}
        </p>
        {branchLabel && (
          <p className="mt-2 text-xs text-textSecondary">
            <span aria-hidden>↳ </span>
            {branchLabel}
          </p>
        )}

        <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {drinks.map(drink => (
            <li key={drink.slug}>
              <CoffeeNode
                drink={drink}
                locale={locale}
                accent={category.accent}
                depth={category.depth}
              />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function CoffeeRoadmap({
  categories,
  drinksByCategory,
  branchLabels,
  locale,
  messages,
}: Props) {
  const animate = !useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <motion.header
        initial={animate ? { opacity: 0, y: -12 } : false}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4 }}
        className="mb-14 max-w-xl"
      >
        <p className="type-caption">{messages.eyebrow}</p>
        <h1 className="mt-2 text-text">{messages.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-textSecondary">
          {messages.subtitle}
        </p>
        <p className="mt-5 text-xs uppercase tracking-[0.08em] text-textSecondary">
          {messages.stageCount}
          <span aria-hidden className="mx-2">
            ·
          </span>
          {messages.drinkCount}
        </p>
      </motion.header>

      {/* Stages are not gated behind a scroll reveal — this page is statically
          rendered for search, so its content must be visible without JS. */}
      <ol>
        {categories.map((category, i) => (
          <Stage
            key={category.id}
            category={category}
            drinks={drinksByCategory[category.id] ?? []}
            branchLabel={branchLabels[category.id]}
            locale={locale}
            isLast={i === categories.length - 1}
            nextIsBranch={Boolean(categories[i + 1]?.branchFrom)}
          />
        ))}
      </ol>
    </div>
  );
}
