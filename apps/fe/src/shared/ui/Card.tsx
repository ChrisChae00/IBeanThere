import type { HTMLAttributes, ReactNode } from 'react';
import { Card as BaseCard } from './base/card';
import { cn } from '@/lib/cn';

/*
  Wrapper over the shadcn card. Keeps this repo's `variant` / `padding` / `header` /
  `footer` props so no calling page changed.

  Cards stay FLAT — no shadow (decision #7). Depth is not part of this system;
  spreading it to cards is what makes neumorphism read as muddy, and the low-contrast
  surfaces it produces fail WCAG.

  MIGRATION: new code should use the compound API from '@/shared/ui/base/card'
  (Card / CardHeader / CardContent / CardFooter). This wrapper is deleted with its
  last call site.
*/

type CardVariant = 'default' | 'elevated' | 'outlined';
type CardPadding = 'sm' | 'md' | 'lg' | 'none';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  header?: ReactNode;
  footer?: ReactNode;
  bleed?: boolean;
}

/*
  base-nova's card carries its own ring, radius and vertical rhythm. All three are
  replaced by the component token layer so a card matches the rest of the system.
*/
const resetBase =
  'gap-0 py-0 ring-0 rounded-(--card-radius) border bg-(--card-surface) text-(--color-ink-primary)';

const variantClasses: Record<CardVariant, string> = {
  default: 'border-(--card-edge)',
  elevated: 'border-transparent shadow-lg transition-transform hover:-translate-y-1',
  outlined: 'border-(--card-edge) bg-transparent'
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-(--card-pad)',
  lg: 'p-8'
};

export default function Card({
  variant = 'default',
  padding = 'md',
  header,
  footer,
  className = '',
  children,
  bleed = false,
  ...props
}: CardProps) {
  return (
    <BaseCard
      className={cn(
        resetBase,
        variantClasses[variant],
        paddingClasses[padding],
        bleed ? 'overflow-visible' : 'overflow-hidden',
        className
      )}
      {...props}
    >
      {header && (
        <div className="mb-4 border-b border-(--card-edge) pb-4">{header}</div>
      )}

      <div className="space-y-4">{children}</div>

      {footer && (
        <div className="mt-6 border-t border-(--card-edge) pt-4">{footer}</div>
      )}
    </BaseCard>
  );
}
