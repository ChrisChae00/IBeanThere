import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button as BaseButton } from './base/button';
import { cn } from '@/lib/cn';
import LoadingSpinner from './LoadingSpinner';

/*
  Wrapper over the shadcn/Base UI button (`./base/button`). Base UI supplies the
  behaviour — focus-visible ring, disabled semantics, native button reset — while this
  file keeps the public API this repo already calls with, so none of the 19 files using
  <Button> had to change.

  MIGRATION: new code should import { Button } from '@/shared/ui/base/button' directly.
  This wrapper exists only for the existing call sites and is deleted once the last one
  moves over. See "Phase 2b" in docs/ui-refactoring-roadmap.md.
*/

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

/* This repo's variant names predate shadcn's; map rather than rename 19 files. */
const variantMap = {
  primary: 'default',
  secondary: 'secondary',
  danger: 'destructive',
  ghost: 'ghost',
  outline: 'outline'
} as const;

/*
  Sizes come from the component token layer, not from shadcn's scale — base-nova's
  default button is 32px tall against this system's 48px.
*/
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-(--btn-height-sm) px-4 text-sm',
  md: 'h-(--btn-height-md) px-5 text-base',
  lg: 'h-(--btn-height-lg) px-6 text-base md:text-lg'
};

/*
  Hover and press are carried by relief, not by a colour swap. That is not a style
  preference: Matcha Latte's green has no lighter shade left that still holds a legible
  label, so a colour-based hover would have to break either contrast or the theme
  (Phase 1). `relief-control` already handles hover, active and reduced-motion, so the
  variant's own colour-shifting hover is cancelled here — tailwind-merge lets the later
  class win.
*/
const reliefOverrides = 'relief-control rounded-(--btn-radius) font-semibold gap-2';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <BaseButton
        ref={ref}
        variant={variantMap[variant]}
        disabled={isDisabled}
        className={cn(
          reliefOverrides,
          sizeClasses[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-60 cursor-not-allowed shadow-none',
          className
        )}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" />}
        {!loading && leftIcon && (
          <span className="text-lg leading-none">{leftIcon}</span>
        )}
        <span className={loading ? 'opacity-60' : ''}>{children}</span>
        {!loading && rightIcon && (
          <span className="text-lg leading-none">{rightIcon}</span>
        )}
      </BaseButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
