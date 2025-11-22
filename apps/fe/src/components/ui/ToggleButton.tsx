'use client';

import { useId } from 'react';

interface ToggleButtonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  disabled?: boolean;
  className?: string;
}

export default function ToggleButton({
  checked,
  onChange,
  onLabel = 'ON',
  offLabel = 'OFF',
  disabled = false,
  className = ''
}: ToggleButtonProps) {
  const id = useId();
  const toggleId = `toggle-${id}`;
  
  return (
    <div className={`relative inline-block ${className}`}>
      <input
        type="checkbox"
        id={toggleId}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <label
        htmlFor={toggleId}
        className={`
          relative inline-flex cursor-pointer select-none
          min-h-[32px] sm:min-h-[36px] h-auto
          py-1.5 sm:py-2
          rounded-full
          bg-transparent
          transition-all duration-300 ease-in-out
          items-center justify-center
          flex-shrink-0
          ${checked 
            ? 'w-[60px] sm:w-[80px] border-[var(--color-primary)] px-2.5' 
            : 'w-auto min-w-[60px] sm:min-w-[80px] border-[var(--color-border)] px-3'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          boxSizing: 'border-box'
        }}
      >
        <span
          className={`
            ${checked ? 'opacity-0 absolute' : 'opacity-100'}
            text-xs font-medium
            text-[var(--color-text-secondary)]
            pointer-events-none
            transition-opacity duration-300
            whitespace-nowrap
          `}
          style={{ 
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            maxWidth: checked ? '0' : 'none'
          }}
        >
          {offLabel}
        </span>
        <span
          className={`
            absolute
            rounded-full
            flex items-center justify-center
            text-xs font-medium
            transition-all duration-400 ease-in-out
            ${checked 
              ? 'bg-[var(--color-primary)] text-[var(--color-primaryText)] translate-x-0' 
              : 'bg-transparent w-5 -translate-x-[50px]'
            }
            overflow-hidden
            whitespace-nowrap
          `}
          style={{
            fontFamily: 'Arial, sans-serif',
            top: '1px',
            bottom: '1px',
            left: checked ? '1px' : 'auto',
            right: checked ? '1px' : '1px',
            height: 'calc(100% - 2px)',
            width: checked ? 'calc(100% - 2px)' : '28px',
            minWidth: checked ? 'calc(100% - 2px)' : '28px',
            textAlign: 'center',
            textIndent: checked ? '0' : '100px',
            transition: checked 
              ? 'all 0.4s, width 0.2s 0.4s linear, text-indent 0.3s 0.4s linear'
              : 'all 0.4s 0.2s, width 0.2s linear, text-indent 0.4s linear'
          }}
        >
          {onLabel}
        </span>
      </label>
    </div>
  );
}
