import React from 'react';

interface BookmarkIconProps {
  filled?: boolean;
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Bookmark icon for Save for Later feature
 * Google Maps style bookmark/flag design
 * - Outline: Not saved
 * - Filled: Saved for later
 */
export default function BookmarkIcon({ 
  filled = false, 
  size = 24, 
  className = '',
  color
}: BookmarkIconProps) {
  const iconColor = color || 'currentColor';
  
  if (filled) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
          fill={iconColor}
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
        fill={iconColor}
      />
    </svg>
  );
}
