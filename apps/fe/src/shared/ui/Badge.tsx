import type { HTMLAttributes } from 'react';
import { Badge as BaseBadge } from './base/badge';
import { cn } from '@/lib/cn';

/*
  Wrapper over the shadcn badge, keeping this repo's variant names and the `size` /
  `pill` props the call sites use.

  MIGRATION: new code should import { Badge } from '@/shared/ui/base/badge'.
*/

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
}

/* base-nova fixes the badge at h-5; these sizes predate it and the call sites expect them. */
const sizeClasses: Record<BadgeSize, string> = {
  sm: 'h-auto text-[0.65rem] px-2 py-1',
  md: 'h-auto text-xs px-3 py-1.5'
};

/*
  Only `default` maps onto a shadcn variant. The four state badges are driven by state
  tokens, which shadcn has no vocabulary for, so they are expressed directly.
*/
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface text-surfaceText border-(--edge-default)',
  success: 'bg-success/15 text-success border-success/40',
  warning: 'bg-warning/15 text-warning border-warning/40',
  error: 'bg-error/15 text-error border-error/40',
  info: 'bg-primary/15 text-primary border-primary/30'
};

export default function Badge({
  variant = 'default',
  size = 'md',
  pill = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <BaseBadge
      variant="outline"
      className={cn(
        'font-semibold uppercase tracking-wide whitespace-nowrap',
        pill ? 'rounded-(--radius-pill)' : 'rounded-(--radius-control)',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </BaseBadge>
  );
}
