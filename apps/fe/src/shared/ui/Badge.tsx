import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
}

const baseClasses =
  'inline-flex items-center font-semibold uppercase tracking-wide';

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[0.65rem] px-2 py-1 rounded-xl',
  md: 'text-xs px-3 py-1.5 rounded-2xl'
};

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--color-surface)] text-[var(--color-surfaceText)] border border-[var(--color-border)]',
  success:
    'bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/40',
  warning:
    'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border border-[var(--color-warning)]/40',
  error:
    'bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/40',
  info:
    'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30'
};

export default function Badge({
  variant = 'default',
  size = 'md',
  pill = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const composedClassName = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    pill ? 'rounded-full' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={composedClassName} {...props}>
      {children}
    </span>
  );
}

