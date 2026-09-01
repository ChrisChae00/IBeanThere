'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CafeMapData } from '@/types/map';
import { isOpenNow, getCurrentDayInTimezone } from '@/lib/utils/businessHours';
import { Badge } from '@/shared/ui';
import { Button } from '@/shared/ui';

import DropBeanButton from '../cafe/DropBeanButton';
import NavigationButton from '../cafe/NavigationButton';

interface CafeInfoModalProps {
  cafe: CafeMapData;
  onClose: () => void;
}

export default function CafeInfoModal({ cafe, onClose }: CafeInfoModalProps) {
  const t = useTranslations('cafe.modal');
  const params = useParams();
  const locale = params.locale as string;
  const [showAllHours, setShowAllHours] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = getCurrentDayInTimezone(cafe.timezone);

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

  const getDayName = (day: string) => {
    return t(`day_${day}` as any);
  };

  const todayHours = getTodayHours();

  return (
    <div className="fixed inset-0 z-(--z-map-modal) flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-(--radius-card) border border-edge-rule bg-surface-raised shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-edge-rule bg-surface-raised px-6 py-4">
          {/* The name is data, not a headline -- body face, like the cards. */}
          <h2 className="line-clamp-1 flex-1 pr-4 font-sans text-xl font-semibold text-ink-primary">{cafe.name}</h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded-(--radius-control) p-2 transition-colors hover:bg-surface-hover"
            aria-label={t('close')}
          >
            <svg
              className="h-5 w-5 text-ink-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cafe Image */}
        {cafe.main_image && (
          <div className="h-40 w-full overflow-hidden bg-surface-sunken">
            <img
              src={cafe.main_image}
              alt={cafe.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={cafe.status === 'verified' ? 'success' : 'info'}
                size="sm"
                className="border border-edge-rule"
              >
                {cafe.status === 'verified' ? t('status_verified') : t('status_pending')}
              </Badge>
              {cafe.status !== 'verified' && cafe.verification_count && (
                <span className="text-sm text-ink-secondary">
                  {t('verifications', { count: cafe.verification_count })}
                </span>
              )}
            </div>
          </div>
          
          {/* Drop Bean Action */}
          <div className="flex items-center justify-between gap-4 rounded-(--radius-card) border border-edge-rule p-4">
            <div className="text-sm font-medium text-ink-primary">
              {t('visited_this_cafe')}
            </div>
            <DropBeanButton
              cafeId={cafe.id}
              cafeLat={cafe.latitude}
              cafeLng={cafe.longitude}
              size="sm"
              showGrowthInfo={true}
            />
          </div>

          {/* Address + Google Maps Link */}
          {cafe.address && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink-secondary">{t('address')}</h3>
              <p className="text-ink-primary">{cafe.address}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={
                    cafe.source_url && cafe.source_url.startsWith('https://www.google.com/maps')
                      ? cafe.source_url
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafe.name}, ${cafe.address || `${cafe.latitude},${cafe.longitude}`}`)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relief-control inline-flex min-h-11 items-center gap-1.5 rounded-(--radius-pill) border border-edge-rule px-4 text-xs font-medium text-ink-primary"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>{t('google_maps')}</span>
                </a>
                {cafe.latitude && cafe.longitude && (
                  <NavigationButton latitude={cafe.latitude} longitude={cafe.longitude} size="sm" />
                )}
              </div>
            </div>
          )}

          {/* Phone */}
          {cafe.phoneNumber && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink-secondary">{t('phone')}</h3>
              <a
                href={`tel:${cafe.phoneNumber}`}
                className="text-ink-primary hover:underline"
              >
                {cafe.phoneNumber}
              </a>
            </div>
          )}

          {/* Website */}
          {cafe.website && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink-secondary">{t('website')}</h3>
              <a
                href={cafe.website}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-ink-primary hover:underline"
              >
                {cafe.website}
              </a>
            </div>
          )}

          {/* Opening Hours */}
          {cafe.businessHours && Object.keys(cafe.businessHours).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-secondary">{t('opening_hours')}</h3>
                {todayHours && !todayHours.closed && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isOpenNow(cafe.businessHours, cafe.timezone)
                        ? 'bg-state-success/12 text-state-success'
                        : 'bg-state-danger/12 text-state-danger'
                    }`}
                  >
                    {isOpenNow(cafe.businessHours, cafe.timezone) ? t('open_now') : t('closed_now')}
                  </span>
                )}
              </div>

              {/* Today's Hours - Clickable Dropdown */}
              {todayHours && (
                <button
                  onClick={() => setShowAllHours(!showAllHours)}
                  className="relief-control w-full rounded-(--radius-control) border border-edge-rule p-3 text-ink-primary"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {t('today')} ({getDayName(today)})
                    </span>
                    <div className="flex items-center gap-2">
                      <span>
                        {todayHours.closed
                          ? t('closed')
                          : `${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${showAllHours ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>
              )}

              {/* All Week Hours */}
              {showAllHours && (
                <div className="space-y-2 border-t border-edge-rule pt-2">
                  {daysOfWeek.map((day) => {
                    const hours = cafe.businessHours?.[day];
                    if (!hours) return null;

                    return (
                      <div key={day} className="flex items-center justify-between text-sm py-2">
                        <span
                          className={`${
                            day === today
                              ? 'font-semibold text-ink-primary'
                              : 'text-ink-secondary'
                          }`}
                        >
                          {getDayName(day)}
                        </span>
                        <span className="text-ink-primary">
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
              <h3 className="text-sm font-semibold text-ink-secondary">{t('opening_hours')}</h3>
              <p className="text-sm text-ink-primary">{t('no_hours_available')}</p>
            </div>
          )}

          <div className="space-y-2">
            <Link
              href={cafe.slug ? `/${locale}/cafes/${cafe.slug}` : `/${locale}/cafes/${cafe.id}`}
              className="relief-control flex min-h-11 w-full items-center justify-center gap-2 rounded-(--btn-radius) bg-brand px-4 font-semibold text-ink-on-brand"
              onClick={onClose}
            >
              {t('view_details')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

