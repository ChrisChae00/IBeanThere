import React from 'react';

interface AddToCollectionIconProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Add to Collection icon - Bookmark with plus sign
 * Used for adding cafes to custom collections
 */
export default function AddToCollectionIcon({ 
  size = 24, 
  className = '',
  color
}: AddToCollectionIconProps) {
  const iconColor = color || 'currentColor';
  
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
      {/* Bookmark outline */}
      <path
        d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
        fill={iconColor}
      />
      {/* Plus sign */}
      <path
        d="M12 7v6M9 10h6"
        stroke={iconColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
