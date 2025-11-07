'use client';

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
  return (
    <div className={`relative inline-block ${className}`}>
      <input
        type="checkbox"
        id="location-toggle"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <label
        htmlFor="location-toggle"
        className={`
          relative block cursor-pointer select-none
          h-8 rounded-full
          bg-transparent
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${checked 
            ? 'border-[var(--color-primary)]' 
            : 'border-[var(--color-border)]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          minWidth: '110px',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}
      >
        <span
          className={`
            absolute inset-0
            flex items-center justify-center
            text-xs font-medium
            text-[var(--color-text-secondary)]
            pointer-events-none
            transition-opacity duration-300
            ${checked ? 'opacity-0' : 'opacity-100'}
          `}
          style={{ fontFamily: 'Arial, sans-serif' }}
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
              ? 'bg-[var(--color-primary)] text-[var(--color-primaryText)] left-0.5 right-0.5 translate-x-0' 
              : 'bg-transparent right-0.5 w-5 -translate-x-[50px]'
            }
            overflow-hidden
          `}
          style={{
            fontFamily: 'Arial, sans-serif',
            top: '3px',
            height: '24px',
            width: checked ? 'calc(100% - 4px)' : '28px',
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
