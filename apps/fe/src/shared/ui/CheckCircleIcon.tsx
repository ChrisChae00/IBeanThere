import React from 'react';

interface CheckCircleIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CheckCircleIcon({ size = 24, className = '', style }: CheckCircleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

