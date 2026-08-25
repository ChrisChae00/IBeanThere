import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { CategoryAccent, CoffeeDrink, Locale } from '@/data/coffee/types';
import { stageLadder } from './stageStyles';

type Props = {
  drink: CoffeeDrink;
  locale: string;
  accent: CategoryAccent;
  depth: number;
};

export default function CoffeeNode({ drink, locale, accent, depth }: Props) {
  const content = drink.content[locale as Locale];
  const { bar } = stageLadder(accent, depth);

  return (
    <Link
      href={`/${locale}/learn/coffee/${drink.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-cardBackground px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-primary)_55%,transparent)] hover:shadow-(--ibean-shadow-warm-sm) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span aria-hidden className={`h-7 w-1 shrink-0 rounded-full ${bar}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-cardText">
          {content.name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-cardTextSecondary">
          {content.tagline}
        </span>
      </span>
      <ChevronRight
        aria-hidden
        className="h-4 w-4 shrink-0 text-cardTextSecondary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
      />
    </Link>
  );
}
