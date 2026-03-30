'use client';

import { motion } from 'framer-motion';
import type { CoffeeCategory, CoffeeDrink, Locale } from '@/data/coffee/types';
import CoffeeNode from './CoffeeNode';

type Messages = {
  title: string;
  subtitle: string;
};

type Props = {
  categories: CoffeeCategory[];
  drinksByCategory: Record<string, CoffeeDrink[]>;
  locale: string;
  messages: Messages;
};

const categoryColors: Record<string, { border: string; header: string; bg: string }> = {
  brewing: {
    border: 'border-[var(--color-primary)]/40',
    header: 'text-[var(--color-primary)]',
    bg: 'bg-[var(--color-primary)]/5',
  },
  espresso: {
    border: 'border-[var(--color-secondary)]/40',
    header: 'text-[var(--color-secondary)]',
    bg: 'bg-[var(--color-secondary)]/5',
  },
  'milk-variations': {
    border: 'border-[var(--color-accent)]/40',
    header: 'text-[var(--color-accent)]',
    bg: 'bg-[var(--color-accent)]/5',
  },
  'cold-brew': {
    border: 'border-[var(--color-primary)]/40',
    header: 'text-[var(--color-primary)]',
    bg: 'bg-[var(--color-primary)]/5',
  },
  signature: {
    border: 'border-[var(--color-secondary)]/40',
    header: 'text-[var(--color-secondary)]',
    bg: 'bg-[var(--color-secondary)]/5',
  },
};

function Connector({ from, to }: { from: string; to: string }) {
  const fromColor = categoryColors[from]?.border ?? 'border-[var(--color-border)]';
  const toColor = categoryColors[to]?.border ?? 'border-[var(--color-border)]';
  return (
    <div className="flex justify-center">
      <div
        className={`w-0.5 h-8 bg-gradient-to-b ${fromColor.replace('border-', 'from-')} ${toColor.replace('border-', 'to-')}`}
        style={{
          background: `linear-gradient(to bottom, var(--color-border), var(--color-border))`,
          opacity: 0.5,
        }}
      />
    </div>
  );
}

function CategoryBlock({
  category,
  drinks,
  locale,
}: {
  category: CoffeeCategory;
  drinks: CoffeeDrink[];
  locale: string;
}) {
  const loc = locale as Locale;
  const colors = categoryColors[category.id] ?? categoryColors.brewing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-5 w-full`}
    >
      <div className="flex flex-col items-center gap-1 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <span className={`font-bold text-base ${colors.header}`}>
            {category.content[loc].name}
          </span>
        </div>
        <span className="text-[var(--color-text)]/50 text-xs">
          {category.content[loc].subtitle}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {drinks.map(drink => (
          <CoffeeNode
            key={drink.slug}
            drink={drink}
            locale={locale}
            colorClass={category.colorClass}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function CoffeeRoadmap({ categories, drinksByCategory, locale, messages }: Props) {
  const brewing = categories.find(c => c.id === 'brewing')!;
  const espresso = categories.find(c => c.id === 'espresso')!;
  const milk = categories.find(c => c.id === 'milk-variations')!;
  const cold = categories.find(c => c.id === 'cold-brew')!;
  const signature = categories.find(c => c.id === 'signature')!;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3">
          {messages.title}
        </h1>
        <p className="text-[var(--color-text)]/60 text-base max-w-lg mx-auto">
          {messages.subtitle}
        </p>
      </motion.div>

      {/* Roadmap */}
      <div className="flex flex-col items-center gap-0">
        {/* Brewing */}
        <CategoryBlock
          category={brewing}
          drinks={drinksByCategory[brewing.id] ?? []}
          locale={locale}
        />

        {/* Connector */}
        <div className="w-0.5 h-8 bg-gradient-to-b from-[var(--color-border)] to-[var(--color-border)] opacity-50" />

        {/* Espresso */}
        <CategoryBlock
          category={espresso}
          drinks={drinksByCategory[espresso.id] ?? []}
          locale={locale}
        />

        {/* Fork connector */}
        <div className="relative w-full max-w-2xl h-8 my-0">
          {/* Vertical down from espresso center */}
          <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-[var(--color-border)] opacity-50 -translate-x-1/2" />
          {/* Horizontal bar */}
          <div className="absolute left-[25%] right-[25%] top-4 h-0.5 bg-[var(--color-border)] opacity-50" />
          {/* Left drop */}
          <div className="absolute left-[25%] top-4 w-0.5 h-4 bg-[var(--color-border)] opacity-50 -translate-x-1/2" />
          {/* Right drop */}
          <div className="absolute right-[25%] top-4 w-0.5 h-4 bg-[var(--color-border)] opacity-50 translate-x-1/2" />
        </div>

        {/* Milk + Cold side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <CategoryBlock
            category={milk}
            drinks={drinksByCategory[milk.id] ?? []}
            locale={locale}
          />
          <CategoryBlock
            category={cold}
            drinks={drinksByCategory[cold.id] ?? []}
            locale={locale}
          />
        </div>

        {/* Merge connector */}
        <div className="relative w-full max-w-2xl h-8 my-0">
          {/* Left rise */}
          <div className="absolute left-[25%] bottom-4 w-0.5 h-4 bg-[var(--color-border)] opacity-50 -translate-x-1/2" />
          {/* Right rise */}
          <div className="absolute right-[25%] bottom-4 w-0.5 h-4 bg-[var(--color-border)] opacity-50 translate-x-1/2" />
          {/* Horizontal bar */}
          <div className="absolute left-[25%] right-[25%] bottom-4 h-0.5 bg-[var(--color-border)] opacity-50" />
          {/* Vertical down to signature */}
          <div className="absolute left-1/2 bottom-0 w-0.5 h-4 bg-[var(--color-border)] opacity-50 -translate-x-1/2" />
        </div>

        {/* Signature */}
        <CategoryBlock
          category={signature}
          drinks={drinksByCategory[signature.id] ?? []}
          locale={locale}
        />
      </div>
    </div>
  );
}
