'use client';

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
} as const;

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-base',
} as const;

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: keyof typeof sizeClasses;
  showNumber?: boolean;
  className?: string;
  textColor?: 'default' | 'surface';
  /*
    Passing this makes the same stars the input. There used to be three hand-rolled
    copies of the interactive version scattered through the log form, each with its
    own markup and none of them reachable by keyboard.
  */
  onChange?: (value: number) => void;
  label?: string;
  starLabel?: (value: number) => string;
}

function Star({ fillPercentage, size }: { fillPercentage: number; size: keyof typeof sizeClasses }) {
  return (
    <span className="relative inline-block">
      <svg
        className={`${sizeClasses[size]} text-star-empty`}
        fill="currentColor"
        stroke="var(--star-empty-edge)"
        strokeWidth="1.5"
        viewBox="0 0 20 20"
        aria-hidden
      >
        <path d={STAR_PATH} />
      </svg>
      <span
        className="absolute left-0 top-0 overflow-hidden"
        style={{ width: `${fillPercentage}%` }}
      >
        <svg
          className={`${sizeClasses[size]} text-star-filled`}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path d={STAR_PATH} />
        </svg>
      </span>
    </span>
  );
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
  className = '',
  textColor = 'default',
  onChange,
  label,
  starLabel,
}: StarRatingProps) {
  const numberClass = `${textColor === 'surface' ? 'text-ink-secondary' : 'text-ink-secondary'} ${textSizeClasses[size]}`;

  if (onChange) {
    /*
      A radiogroup, not five toggle buttons: the five are one choice, and a reader on
      a screen reader should hear "3 of 5 selected", not five unrelated switches. The
      44px target lives on the button, so a small star still has a reachable one.
    */
    return (
      <div
        role="radiogroup"
        aria-label={label}
        className={`flex items-center gap-1 ${className}`}
      >
        {Array.from({ length: maxRating }, (_, index) => index + 1).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={starLabel ? starLabel(value) : `${value}`}
            onClick={() => onChange(value)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-(--radius-control) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
          >
            <Star fillPercentage={rating >= value ? 100 : 0} size={size} />
          </button>
        ))}
        {showNumber && rating > 0 && (
          <span className={numberClass}>
            {rating}/{maxRating}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => index + 1).map((value) => (
          <Star
            key={value}
            fillPercentage={Math.max(0, Math.min(100, (rating - (value - 1)) * 100))}
            size={size}
          />
        ))}
      </div>
      {showNumber && <span className={numberClass}>{rating.toFixed(1)}</span>}
    </div>
  );
}
