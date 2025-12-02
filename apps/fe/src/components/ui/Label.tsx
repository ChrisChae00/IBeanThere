import type { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: string;
  description?: ReactNode;
}

export default function Label({
  children,
  className = '',
  required = false,
  error,
  description,
  ...props
}: LabelProps) {
  return (
    <label
      className={[
        'flex flex-col gap-1 text-sm font-semibold text-[var(--color-cardText)]',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {children}
        {required && (
          <span className="text-[var(--color-error)] text-xs" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {(description || error) && (
        <span
          className={`text-xs font-normal ${
            error
              ? 'text-[var(--color-error)]'
              : 'text-[var(--color-cardTextSecondary)]'
          }`}
        >
          {error || description}
        </span>
      )}
    </label>
  );
}

