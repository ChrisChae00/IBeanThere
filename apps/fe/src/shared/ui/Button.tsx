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
  moves over. See "Phase 2b" in docs/archive/plans/ui-refactoring-roadmap.md.
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

/*
  This repo's variant names predate shadcn's; map rather than rename 19 files.
  `danger` maps to shadcn's own `outline`, not `destructive`: `destructive` is a 10% tint
  under `--destructive` text, the pairing design-language.md §4 measured at 2.4-3.5:1 and
  ruled out. `.btn-line-danger` below (this file's own class, not shadcn's) carries the
  actual colour -- a rule at rest, filled solid only on hover/press -- so `danger` needs
  shadcn's plainest base to draw over.
*/
const variantMap = {
  primary: 'default',
  secondary: 'secondary',
  danger: 'outline',
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
  State is carried by the fill, not by depth. An outline control inverts on hover
  (`control-flat`); a filled one presses inward (`btn-shade`) and keeps its brand fill,
  which is why the two are not the same class — putting `control-flat` on a filled
  button would repaint the fill it is supposed to keep. `danger` gets a third shape,
  `btn-line-danger`: an outline that fills solid in the danger colour, only on
  hover/press, the same mechanic as `btn-line` with its own colour pair. The variant's
  own colour-shifting hover is cancelled either way; tailwind-merge lets the later class
  win, and `.btn-line-danger`'s own hover carries `!important` for the one case that
  isn't a plain utility-vs-utility conflict (see its definition in globals.css).
*/
const shape = 'rounded-(--btn-radius) font-semibold gap-2';

function fillClassFor(variant: ButtonVariant): string {
  if (variant === 'primary') return 'btn-shade';
  if (variant === 'danger') return 'btn-line-danger';
  return 'control-flat';
}

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
          shape,
          fillClassFor(variant),
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
