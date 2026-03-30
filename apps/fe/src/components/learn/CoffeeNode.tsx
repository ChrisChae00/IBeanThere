'use client';

import Link from 'next/link';
import type { CoffeeDrink, Locale } from '@/data/coffee/types';

type Props = {
  drink: CoffeeDrink;
  locale: string;
  colorClass: string;
};

const colorStyles: Record<string, { node: string; text: string }> = {
  brewing: {
    node: 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/70',
    text: 'text-[var(--color-primary)]',
  },
  espresso: {
    node: 'bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/40 hover:bg-[var(--color-secondary)]/20 hover:border-[var(--color-secondary)]/70',
    text: 'text-[var(--color-secondary)]',
  },
  milk: {
    node: 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/20 hover:border-[var(--color-accent)]/70',
    text: 'text-[var(--color-accent)]',
  },
  cold: {
    node: 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/70',
    text: 'text-[var(--color-primary)]',
  },
  signature: {
    node: 'bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/40 hover:bg-[var(--color-secondary)]/20 hover:border-[var(--color-secondary)]/70',
    text: 'text-[var(--color-secondary)]',
  },
};

export default function CoffeeNode({ drink, locale, colorClass }: Props) {
  const loc = locale as Locale;
  const styles = colorStyles[colorClass] ?? colorStyles.brewing;

  return (
    <Link
      href={`/${locale}/learn/coffee/${drink.slug}`}
      className={`border rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-[var(--ibean-shadow-warm-sm)] ${styles.node} ${styles.text}`}
    >
      {drink.content[loc].name}
    </Link>
  );
}
