'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { NearbyCafe } from '@/types/map';
import { calculateDistance } from '@/lib/utils/checkIn';
import { LoadingSpinner } from '@/shared/ui';
import { UserLocationIcon } from '@/shared/ui';

interface NearbyCafeAlertProps {
  cafes: NearbyCafe[];
  userLocation: { lat: number; lng: number };
  onCheckIn: (cafe: NearbyCafe) => void;
  onDismiss: () => void;
  autoHideAfter?: number;
  isCheckingIn?: boolean;
}

export default function NearbyCafeAlert({
  cafes,
  userLocation,
  onCheckIn,
  onDismiss,
  autoHideAfter = 120000,
  isCheckingIn = false
}: NearbyCafeAlertProps) {
  const t = useTranslations('visit');
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<NearbyCafe | null>(null);
  
  const sortedCafes = [...cafes].sort((a, b) => {
    const distanceA = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      a.latitude,
      a.longitude
    );
    const distanceB = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      b.latitude,
      b.longitude
    );
    return distanceA - distanceB;
  });

  useEffect(() => {
    setIsAnimating(true);
    
    const hideTimer = setTimeout(() => {
      handleDismiss();
    }, autoHideAfter);

    return () => clearTimeout(hideTimer);
  }, [autoHideAfter]);

  const handleCheckIn = (cafe: NearbyCafe) => {
    setSelectedCafe(cafe);
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onCheckIn(cafe);
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
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
          {/* Header with icon */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <UserLocationIcon size={24} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90">
                    {t('nearby_cafes_found')}
                  </p>
                  <p className="text-xs text-white/70">
                    {sortedCafes.length} {sortedCafes.length === 1 ? 'cafe' : 'cafes'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label={t('dismiss')}
              >
                <span className="text-white text-lg">×</span>
              </button>
            </div>
          </div>

          {/* Cafe List */}
          <div className="overflow-y-auto flex-1">
            <div className="p-4 space-y-3">
              {sortedCafes.map((cafe) => {
                const distance = Math.round(
                  calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    cafe.latitude,
                    cafe.longitude
                  )
                );
                
                return (
                  <div
                    key={cafe.id}
                    className="bg-[var(--color-surface-2)] rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="font-semibold text-[var(--color-text)] text-base mb-1 line-clamp-1">
                          {cafe.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                          {cafe.address}
                        </p>
                        <div className="flex items-center space-x-3 text-xs">
                          {cafe.rating && (
                            <div className="flex items-center space-x-1">
                              <span className="text-[var(--color-accent)]">⭐</span>
                              <span className="text-[var(--color-text)]">
                                {cafe.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <span className="text-[var(--color-text-secondary)]">
                              {t('distance')}:
                            </span>
                            <span className="font-medium text-[var(--color-text)]">
                              {distance}{t('meters')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCheckIn(cafe)}
                      disabled={selectedCafe !== null || isCheckingIn}
                      className="
                        w-full min-h-[44px] px-4 py-2.5
                        bg-[var(--color-primary)] text-white
                        rounded-lg font-medium
                        hover:opacity-90 active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
                        flex items-center justify-center gap-2
                      "
                    >
                      {isCheckingIn && selectedCafe?.id === cafe.id ? (
                        <LoadingSpinner size="sm" className="text-white" />
                      ) : selectedCafe?.id === cafe.id ? (
                        '✓ '
                      ) : null}
                      {t('check_in_button')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[var(--color-surface-2)] overflow-hidden flex-shrink-0">
            <div
              className="h-full bg-[var(--color-primary)]/30"
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
      `}</style>
    </div>
  );
}

