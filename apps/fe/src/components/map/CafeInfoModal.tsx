'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CafeMapData } from '@/types/map';

interface CafeInfoModalProps {
  cafe: CafeMapData;
  onClose: () => void;
}

export default function CafeInfoModal({ cafe, onClose }: CafeInfoModalProps) {
  const t = useTranslations('cafe.modal');
  const [showAllHours, setShowAllHours] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const getTodayHours = () => {
    if (!cafe.businessHours || !cafe.businessHours[today]) {
      return null;
    }
    return cafe.businessHours[today];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const isOpenNow = () => {
    const todayHours = getTodayHours();
    if (!todayHours || todayHours.closed) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const getDayName = (day: string) => {
    return t(`day_${day}` as any);
  };

  const todayHours = getTodayHours();

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="relative bg-[var(--color-cardBackground)] rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--color-cardBackground)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-cardText)]">{cafe.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            aria-label={t('close')}
          >
            <svg
              className="w-5 h-5 text-[var(--color-cardText)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                cafe.status === 'verified'
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : 'bg-[var(--color-pending)]/10 text-[var(--color-pending)]'
              }`}
            >
              {cafe.status === 'verified' ? t('status_verified') : t('status_pending')}
            </span>
            {cafe.verification_count && (
              <span className="text-sm text-[var(--color-cardTextSecondary)]">
                {t('verifications', { count: cafe.verification_count })}
              </span>
            )}
          </div>

          {/* Address */}
          {cafe.address && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[var(--color-cardTextSecondary)]">{t('address')}</h3>
              <p className="text-[var(--color-cardText)]">{cafe.address}</p>
            </div>
          )}

          {/* Phone */}
          {cafe.phoneNumber && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[var(--color-cardTextSecondary)]">{t('phone')}</h3>
              <a
                href={`tel:${cafe.phoneNumber}`}
                className="text-[var(--color-primary)] hover:underline"
              >
                {cafe.phoneNumber}
              </a>
            </div>
          )}

          {/* Website */}
          {cafe.website && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[var(--color-cardTextSecondary)]">{t('website')}</h3>
              <a
                href={cafe.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline break-all"
              >
                {cafe.website}
              </a>
            </div>
          )}

          {/* Opening Hours */}
          {cafe.businessHours && Object.keys(cafe.businessHours).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-cardTextSecondary)]">{t('opening_hours')}</h3>
                {todayHours && !todayHours.closed && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isOpenNow()
                        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                        : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                    }`}
                  >
                    {isOpenNow() ? t('open_now') : t('closed_now')}
                  </span>
                )}
              </div>

              {/* Today's Hours */}
              {todayHours && (
                <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--color-text)]">
                      {t('today')} ({getDayName(today)})
                    </span>
                    <span className="text-[var(--color-text)]">
                      {todayHours.closed
                        ? t('closed')
                        : `${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Show All Hours Button */}
              <button
                onClick={() => setShowAllHours(!showAllHours)}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-[var(--color-primaryText)] bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 rounded-lg transition-colors"
              >
                <span>{showAllHours ? t('hide_hours') : t('show_all_hours')}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showAllHours ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* All Week Hours */}
              {showAllHours && (
                <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                  {daysOfWeek.map((day) => {
                    const hours = cafe.businessHours?.[day];
                    if (!hours) return null;

                    return (
                      <div key={day} className="flex items-center justify-between text-sm py-2">
                        <span
                          className={`${
                            day === today
                              ? 'font-semibold text-[var(--color-cardText)]'
                              : 'text-[var(--color-cardTextSecondary)]'
                          }`}
                        >
                          {getDayName(day)}
                        </span>
                        <span className="text-[var(--color-cardText)]">
                          {hours.closed
                            ? t('closed')
                            : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!cafe.businessHours && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[var(--color-cardTextSecondary)]">{t('opening_hours')}</h3>
              <p className="text-sm text-[var(--color-cardTextSecondary)]">{t('no_hours_available')}</p>
            </div>
          )}

          {/* Google Maps Link */}
          {cafe.source_url && (
            <a
              href={cafe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-lg hover:opacity-90 transition-opacity min-h-[44px]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {t('google_maps')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

