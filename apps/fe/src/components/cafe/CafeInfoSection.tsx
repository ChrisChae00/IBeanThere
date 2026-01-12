'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CafeMapData } from '@/types/map';
import { CafeDetailResponse } from '@/types/api';
import FoundingCrewAvatars from './FoundingCrewAvatars';

interface CafeInfoSectionProps {
  cafe: CafeMapData | CafeDetailResponse;
}

export default function CafeInfoSection({ cafe }: CafeInfoSectionProps) {
  const t = useTranslations('cafe.modal');
  const tCommon = useTranslations('common');
  const [showAllHours, setShowAllHours] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Get business hours from either businessHours (CafeMapData) or business_hours (CafeDetailResponse)
  const businessHours = 'businessHours' in cafe ? cafe.businessHours : 
    ('business_hours' in cafe ? cafe.business_hours : undefined);

  const getTodayHours = () => {
    if (!businessHours || !businessHours[today]) {
      return null;
    }
    return businessHours[today];
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
  const phoneNumber = 'phoneNumber' in cafe ? cafe.phoneNumber : 
    ('phone' in cafe ? cafe.phone : undefined);
  const website = cafe.website;
  const sourceUrl = 'source_url' in cafe ? cafe.source_url : undefined;

  const foundingCrew = 'founding_crew' in cafe ? cafe.founding_crew : 
    ('foundingCrew' in cafe ? (cafe as any).foundingCrew : undefined);

  return (
    <div className="space-y-4">
      {/* Founding Crew Section */}
      {foundingCrew && (foundingCrew.navigator || (foundingCrew.vanguard && foundingCrew.vanguard.length > 0)) && (
        <FoundingCrewAvatars
          navigator={foundingCrew.navigator}
          vanguard={foundingCrew.vanguard}
        />
      )}

      {/* Status Badge + Verification Count (only show count when not verified and no founding crew) */}
      {!foundingCrew && (
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-border)] ${
              cafe.status === 'verified'
                ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                : 'bg-[var(--color-pending)]/10 text-[var(--color-pending)]'
            }`}
          >
            {cafe.status === 'verified' ? t('status_verified') : t('status_pending')}
          </span>
          {cafe.status !== 'verified' && cafe.verification_count && (
            <span className="text-sm text-[var(--color-cardTextSecondary)]">
              {t('verifications', { count: cafe.verification_count })}
            </span>
          )}
        </div>
      )}

      {/* Address + Google Maps Link */}
      {cafe.address && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[var(--color-cardTextSecondary)]">{t('address')}</h3>
          <p className="text-[var(--color-cardText)]">{cafe.address}</p>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[var(--color-cardText)] hover:underline"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>{t('google_maps')}</span>
            </a>
          )}
        </div>
      )}

      {/* Phone */}
      {phoneNumber && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[var(--color-cardTextSecondary)]">{t('phone')}</h3>
          <a
            href={`tel:${phoneNumber}`}
            className="text-[var(--color-cardText)] hover:underline"
          >
            {phoneNumber}
          </a>
        </div>
      )}

      {/* Website */}
      {website && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[var(--color-cardTextSecondary)]">{t('website')}</h3>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-cardText)] hover:underline break-all"
          >
            {website}
          </a>
        </div>
      )}

      {/* Opening Hours */}
      {businessHours && Object.keys(businessHours).length > 0 && (
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

          {/* Today's Hours - Clickable Dropdown */}
          {todayHours && (
            <button
              onClick={() => setShowAllHours(!showAllHours)}
              className="w-full p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primaryText)] transition-colors"
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
            <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
              {daysOfWeek.map((day) => {
                const hours = businessHours?.[day];
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

      {!businessHours && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[var(--color-cardTextSecondary)]">{t('opening_hours')}</h3>
          <p className="text-sm text-[var(--color-cardText)]">{t('no_hours_available')}</p>
        </div>
      )}

    </div>
  );
}

