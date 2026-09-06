'use client';

import React from 'react';
import { Button } from '@/shared/ui';
import ReportIcon from '@/shared/ui/icons/ReportIcon';

interface ReportButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
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
 * The report control: an icon on the shared ghost button, labelled for screen
 * readers and on hover.
 *
 * It had `text` and `full` variants as well, neither of which any page ever
 * asked for — the one call site is the public profile, on the default icon. They
 * are gone rather than carried into Phase 6, and the `text` one took the last
 * legacy colour name in this file with it.
 */
export default function ReportButton({
  onClick,
  size = 'md',
  label,
  className = '',
  disabled = false,
}: ReportButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="ghost"
      className={`min-h-0! px-2! py-2! ${className}`}
      title={label}
      aria-label={label}
    >
      <ReportIcon size={iconSizes[size]} />
    </Button>
  );
}
