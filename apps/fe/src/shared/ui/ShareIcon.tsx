import React from 'react';

interface ShareIconProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Share icon for sharing cafes and collections
 * Standard share/export arrow design
 */
export default function ShareIcon({ 
  size = 24, 
  className = '',
  color
}: ShareIconProps) {
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
      <path
        d="M18 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81c-.55-.49-1.27-.81-2.04-.81-1.66 0-3 1.34-3 3s1.34 3 3 3c.77 0 1.49-.32 2.04-.81l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3c-.77 0-1.49.32-2.04.81L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.55.49 1.27.81 2.04.81z"
        fill={iconColor}
      />
    </svg>
  );
}
