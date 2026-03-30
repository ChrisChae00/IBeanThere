'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Badge from '@/shared/ui/Badge';
import type { CoffeeDrink, CoffeeCategory, Locale } from '@/data/coffee/types';
import CoffeeNode from './CoffeeNode';

type Messages = {
  backToRoadmap: string;
  origin: string;
  funFact: string;
  relatedDrinks: string;
  category: string;
};

type Props = {
  drink: CoffeeDrink;
  category: CoffeeCategory;
  relatedDrinks: CoffeeDrink[];
  locale: string;
  messages: Messages;
};

export default function CoffeeDrinkDetail({
  drink,
  category,
  relatedDrinks,
  locale,
  messages,
}: Props) {
  const loc = locale as Locale;
  const content = drink.content[loc];
  const catContent = category.content[loc];

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href={`/${locale}/learn/coffee`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text)]/60 hover:text-[var(--color-primary)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {messages.backToRoadmap}
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{category.icon}</span>
          <Badge variant="info" size="sm">
            {messages.category}: {catContent.name}
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-2">
          {content.name}
        </h1>
        <p className="text-[var(--color-text)]/70 text-lg leading-relaxed">
          {content.tagline}
        </p>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <p className="text-[var(--color-text)] text-base leading-relaxed whitespace-pre-wrap">
          {content.description}
        </p>
      </motion.div>

      {/* Origin */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cardBackground)] p-6"
      >
        <h2 className="font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
          <span>🗺️</span>
          {messages.origin}
        </h2>
        <p className="text-[var(--color-text)]/80 text-sm leading-relaxed">
          {content.origin}
        </p>
      </motion.div>

      {/* Fun Fact */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-10 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-6"
      >
        <h2 className="font-bold text-[var(--color-primary)] mb-3 flex items-center gap-2">
          <span>💡</span>
          {messages.funFact}
        </h2>
        <p className="text-[var(--color-text)]/80 text-sm leading-relaxed">
          {content.funFact}
        </p>
      </motion.div>

      {/* Related drinks */}
      {relatedDrinks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-bold text-[var(--color-text)] mb-3">
            {messages.relatedDrinks}
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedDrinks.map(related => (
              <CoffeeNode
                key={related.slug}
                drink={related}
                locale={locale}
                colorClass={category.colorClass}
              />
            ))}
          </div>
        </motion.div>
      )}
    </main>
  );
}
