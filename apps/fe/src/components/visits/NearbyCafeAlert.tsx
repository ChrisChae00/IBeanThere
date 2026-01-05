'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { NearbyCafe } from '@/types/map';
import DropBeanButton from '../cafe/DropBeanButton';
import { calculateDistance } from '@/lib/utils/checkIn';
import { UserLocationIcon } from '@/shared/ui';

interface NearbyCafeAlertProps {
  cafes: NearbyCafe[];
  userLocation: { lat: number; lng: number };
  onDismiss: () => void;
  autoHideAfter?: number;
}

export default function NearbyCafeAlert({
  cafes,
  userLocation,
  onDismiss,
  autoHideAfter = 120000,
}: NearbyCafeAlertProps) {
  const t = useTranslations('visit');
  const tDrop = useTranslations('drop_bean');
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  
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

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-8 md:max-w-sm">
      <div
        className={`
          transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${isAnimating ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}
        `}
      >
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header with icon */}
          <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark,var(--color-secondary))] p-5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
                  <UserLocationIcon size={24} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white tracking-tight">
                    {t('nearby_cafes_found')}
                  </p>
                  <p className="text-xs text-white/80 font-medium">
                    {sortedCafes.length} {sortedCafes.length === 1 ? 'cafe' : 'cafes'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors text-white"
                aria-label={t('dismiss')}
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
          </div>

          {/* Cafe List */}
          <div className="max-h-[40vh] overflow-y-auto flex-1 custom-scrollbar">
            <div className="p-4 space-y-4">
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
                    className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 transition-all hover:border-[var(--color-primary)]/30 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--color-text)] text-base mb-1 line-clamp-1">
                          {cafe.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-2 italic">
                          {cafe.address}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--color-surface-2)] rounded-full text-[10px] font-bold text-[var(--color-text-secondary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span>
                            {distance}{t('meters')}
                          </div>
                          {cafe.rating && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-accent)]">
                              <span>⭐</span>
                              <span>{cafe.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DropBeanButton
                      cafeId={cafe.id}
                      cafeLat={cafe.latitude}
                      cafeLng={cafe.longitude}
                      size="md"
                      showGrowthInfo={false}
                      onSuccess={() => {
                        // Small delay before dismissing to show success state
                        setTimeout(handleDismiss, 2000);
                      }}
                    />
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

