import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined';
type CardPadding = 'sm' | 'md' | 'lg' | 'none';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  header?: ReactNode;
  footer?: ReactNode;
  bleed?: boolean;
}

const baseClasses =
  'relative rounded-3xl border text-[var(--color-cardText)] bg-[var(--color-cardBackground)] transition-all duration-200';

const variantClasses: Record<CardVariant, string> = {
  default:
    'border-[var(--color-border)] shadow-[0_12px_35px_rgba(26,18,11,0.12)]',
  elevated:
    'border-transparent shadow-[0_20px_45px_rgba(26,18,11,0.18)] hover:-translate-y-1',
  outlined:
    'border-[var(--color-border)] bg-transparent backdrop-blur-sm shadow-none'
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
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
    <div
      className={[
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        bleed ? 'overflow-visible' : 'overflow-hidden',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {header && (
        <div className="mb-4 border-b border-[var(--color-border)]/60 pb-4">
          {header}
        </div>
      )}

      <div className="space-y-4">{children}</div>

      {footer && (
        <div className="mt-6 border-t border-[var(--color-border)]/60 pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}

