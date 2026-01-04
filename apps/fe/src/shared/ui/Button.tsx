import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

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

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-5 py-3 text-base min-h-[48px]',
  lg: 'px-6 py-4 text-base md:text-lg min-h-[56px]'
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-primaryText)] shadow-[0_12px_30px_rgba(26,18,11,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(26,18,11,0.28)] active:translate-y-0 disabled:shadow-none',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-[0_10px_25px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:bg-[var(--color-surface)]/90',
  danger:
    'bg-[var(--color-error)] text-white shadow-[0_12px_30px_rgba(244,67,54,0.25)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(244,67,54,0.35)] active:translate-y-0 disabled:shadow-none',
  ghost:
    'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]/70 border border-transparent',
  outline:
    'bg-transparent text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]/60'
};

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
    const composedClassName = [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? 'w-full' : '',
      isDisabled ? 'opacity-60 cursor-not-allowed translate-y-0' : '',
      className
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={composedClassName}
        disabled={isDisabled}
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
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

