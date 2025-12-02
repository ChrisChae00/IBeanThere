import { forwardRef, useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes
} from 'react';

type InputElementProps = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface InputProps extends Omit<InputElementProps, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  endAdornment?: ReactNode;
  multiline?: boolean;
  fullWidth?: boolean;
}

const baseFieldClasses =
  'w-full rounded-2xl border bg-[var(--color-cardBackground)] text-[var(--color-cardText)] placeholder:text-[var(--color-cardTextSecondary)] focus:outline-none transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]';

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      icon,
      iconPosition = 'left',
      multiline = false,
      className = '',
      endAdornment,
      fullWidth = true,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const Component = multiline ? 'textarea' : 'input';
    const hasLeftIcon = Boolean(icon) && iconPosition === 'left';
    const hasRightIcon = Boolean(icon) && iconPosition === 'right';
    const needsRightPadding = hasRightIcon || Boolean(endAdornment);
    const paddingWithIcon = [
      hasLeftIcon ? 'pl-12' : 'pl-4',
      needsRightPadding ? 'pr-12' : 'pr-4'
    ].join(' ');
    const fieldClasses = [
      baseFieldClasses,
      'min-h-[48px] py-3',
      paddingWithIcon,
      fullWidth ? 'w-full' : '',
      error
        ? 'border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/30'
        : 'border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]/30',
      multiline ? 'resize-none leading-relaxed' : '',
      className
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label
        className={`flex flex-col gap-2 text-sm font-medium ${
          fullWidth ? 'w-full' : 'w-auto'
        }`}
        htmlFor={fieldId}
      >
        {label && (
          <span className="text-[var(--color-cardText)]">{label}</span>
        )}

        <div className="relative">
          {icon && (
            <span
              className={`absolute top-1/2 -translate-y-1/2 text-[var(--color-cardTextSecondary)] ${
                iconPosition === 'left' ? 'left-4' : 'right-4'
              }`}
            >
              {icon}
            </span>
          )}

          <Component
            id={fieldId}
            ref={ref as never}
            className={fieldClasses}
            rows={multiline ? rows : undefined}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {endAdornment}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <span
            className={`text-xs ${
              error
                ? 'text-[var(--color-error)]'
                : 'text-[var(--color-cardTextSecondary)]'
            }`}
          >
            {error || helperText}
          </span>
        )}
      </label>
    );
  }
);

Input.displayName = 'Input';

export default Input;

