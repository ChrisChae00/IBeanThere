'use client';

import { useState, useEffect } from 'react';
import { CafeMapData } from '@/types/map';

interface VisitConfirmationProps {
  cafe: CafeMapData;
  duration: number;
  onConfirm: (cafe: CafeMapData, duration: number) => void;
  onDismiss: () => void;
  autoHideAfter?: number;
}

export default function VisitConfirmation({
  cafe,
  duration,
  onConfirm,
  onDismiss,
  autoHideAfter = 30000
}: VisitConfirmationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    
    const hideTimer = setTimeout(() => {
      handleDismiss();
    }, autoHideAfter);

    return () => clearTimeout(hideTimer);
  }, [autoHideAfter]);

  const handleConfirm = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onConfirm(cafe, duration);
    }, 200);
  };

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-8 md:max-w-md">
      <div
        className={`
          transform transition-all duration-300 ease-out
          ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
      >
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with icon */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">☕</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90">
                  Visit Detected
                </p>
                <p className="text-xs text-white/70">
                  {duration} minute{duration > 1 ? 's' : ''} at this location
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-[var(--color-text)] text-lg mb-1">
                {cafe.name}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                {cafe.address}
              </p>
              {cafe.rating && (
                <div className="flex items-center mt-2 space-x-1">
                  <span className="text-[var(--color-accent)]">⭐</span>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {cafe.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Question */}
            <p className="text-sm font-medium text-[var(--color-text)]">
              Did you visit this cafe?
            </p>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleConfirm}
                className="
                  flex-1 min-h-[44px] px-4 py-2.5
                  bg-[var(--color-primary)] text-white
                  rounded-lg font-medium
                  hover:opacity-90 active:scale-95
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
                "
              >
                ✓ Yes, I visited
              </button>
              <button
                onClick={handleDismiss}
                className="
                  flex-shrink-0 min-h-[44px] px-4 py-2.5
                  bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]
                  rounded-lg font-medium
                  hover:bg-[var(--color-border)] active:scale-95
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-border)] focus:ring-offset-2
                "
              >
                Not now
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[var(--color-surface-2)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)]/30 animate-progress"
              style={{
                animation: `shrink ${autoHideAfter}ms linear`
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-progress {
          animation: shrink ${autoHideAfter}ms linear;
        }
      `}</style>
    </div>
  );
}

