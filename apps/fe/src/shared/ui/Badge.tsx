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
    'bg-surface text-surfaceText border border-border',
  success:
    'bg-success/15 text-success border border-success/40',
  warning:
    'bg-warning/15 text-warning border border-warning/40',
  error:
    'bg-error/15 text-error border border-error/40',
  info:
    'bg-primary/15 text-primary border border-primary/30'
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

