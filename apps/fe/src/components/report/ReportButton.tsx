'use client';

import React from 'react';
import ReportIcon from '@/shared/ui/icons/ReportIcon';

interface ReportButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'full';
  label?: string;
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

/**
 * Reusable report button component.
 * Can be displayed as icon-only, text, or full button with icon + text.
 */
export default function ReportButton({
  onClick,
  size = 'md',
  variant = 'icon',
  label,
  className = '',
  disabled = false,
}: ReportButtonProps) {
  if (variant === 'text') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {label}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <ReportIcon size={iconSizes[size]} />
        {label && <span>{label}</span>}
      </button>
    );
  }

  // Default: icon only
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${sizeClasses[size]} rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={label}
      aria-label={label}
    >
      <ReportIcon size={iconSizes[size]} />
    </button>
  );
}
