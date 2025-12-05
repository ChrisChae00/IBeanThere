import React from 'react';

interface InfoIconProps {
  size?: number;
  className?: string;
}

export default function InfoIcon({ size = 24, className = '' }: InfoIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle> 
      <path d="M12 17V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path> 
      <circle cx="12" cy="7" r="1" fill="currentColor"></circle> 
    </svg>
  );
}
