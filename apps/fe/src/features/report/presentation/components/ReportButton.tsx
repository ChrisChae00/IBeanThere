'use client';

import React from 'react';
import { Button } from '@/shared/ui';
import ReportIcon from '@/shared/ui/icons/ReportIcon';

interface ReportButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'full';
  label?: string;
  className?: string;
  disabled?: boolean;
}

const iconSizes = {
  sm: 16,
  md: 18,
  lg: 20,
};

/**
 * Reusable report button component.
 * Uses shared Button component for UI consistency.
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
      <Button
        onClick={onClick}
        disabled={disabled}
        size={size}
        variant="ghost"
        leftIcon={<ReportIcon size={iconSizes[size]} />}
        className={className}
      >
        {label}
      </Button>
    );
  }

  // Default: icon only - use ghost variant for consistency
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="ghost"
      className={`!min-h-0 !px-2 !py-2 ${className}`}
      title={label}
      aria-label={label}
    >
      <ReportIcon size={iconSizes[size]} />
    </Button>
  );
}
