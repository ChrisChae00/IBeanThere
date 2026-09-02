'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CafeMapData } from '@/types/map';
import { CafeDetailResponse } from '@/types/api';
import { isOpenNow, getCurrentDayInTimezone } from '@/lib/utils/businessHours';
import FoundingCrewAvatars from './FoundingCrewAvatars';
import CafeMapActions from './CafeMapActions';

interface CafeInfoSectionProps {
  cafe: CafeMapData | CafeDetailResponse;
}

export default function CafeInfoSection({ cafe }: CafeInfoSectionProps) {
  const t = useTranslations('cafe.modal');
  const tCommon = useTranslations('common');
  const [showAllHours, setShowAllHours] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Get business hours and timezone from either CafeMapData or CafeDetailResponse
  const businessHours = 'businessHours' in cafe ? cafe.businessHours :
    ('business_hours' in cafe ? cafe.business_hours : undefined);
  const timezone = 'timezone' in cafe ? (cafe as any).timezone as string | undefined : undefined;

  const today = getCurrentDayInTimezone(timezone);

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

  // Normalize scouts: CafeMapData uses `scouts`, CafeDetailResponse (API raw) uses `vanguard`
  const scouts: Array<{ user_id: string; username?: string; display_name?: string; avatar_url?: string; role: 'scout_1' | 'scout_2' }> =
    foundingCrew?.scouts ||
    (foundingCrew?.vanguard || []).map((v: any) => ({
      ...v,
      role: (v.role === 'vanguard_2nd' ? 'scout_1' : 'scout_2') as 'scout_1' | 'scout_2',
    }));

  const sourceType = 'source_type' in cafe ? cafe.source_type : undefined;

  return (
    <div className="space-y-4">
      {/* Founding Crew Section */}
      {foundingCrew && (foundingCrew.navigator || scouts.length > 0) && (
        <FoundingCrewAvatars
          navigator={foundingCrew.navigator}
          scouts={scouts}
        />
      )}

      {/* App-seeded cafe (e.g. OSM import) with no navigator yet */}
      {sourceType === 'app_seed' && !foundingCrew?.navigator && (
        <p className="text-sm text-cardTextSecondary">{t('added_by_app')}</p>
      )}

      {/* Status Badge + Verification Count (only show count when not verified and no founding crew) */}
      {!foundingCrew && (
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border border-border ${
              cafe.status === 'verified'
                ? 'bg-success/10 text-success'
                : 'bg-pending/10 text-pending'
            }`}
          >
            {cafe.status === 'verified' ? t('status_verified') : t('status_pending')}
          </span>
          {cafe.status !== 'verified' && cafe.verification_count && (
            <span className="text-sm text-cardTextSecondary">
              {t('verifications', { count: cafe.verification_count })}
            </span>
          )}
        </div>
      )}

      {/* Address + Google Maps Link */}
      {cafe.address && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-cardTextSecondary">{t('address')}</h3>
          <p className="text-cardText">{cafe.address}</p>
          <div className="pt-1">
            <CafeMapActions
              name={cafe.name}
              address={cafe.address}
              latitude={cafe.latitude}
              longitude={cafe.longitude}
              sourceUrl={sourceUrl}
            />
          </div>
        </div>
      )}

      {/* Phone */}
      {phoneNumber && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-cardTextSecondary">{t('phone')}</h3>
          <a
            href={`tel:${phoneNumber}`}
            className="text-cardText hover:underline"
          >
            {phoneNumber}
          </a>
        </div>
      )}

      {/* Website */}
      {website && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-cardTextSecondary">{t('website')}</h3>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cardText hover:underline break-all"
          >
            {website}
          </a>
        </div>
      )}

      {/* Opening Hours */}
      {businessHours && Object.keys(businessHours).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-cardTextSecondary">{t('opening_hours')}</h3>
            {todayHours && !todayHours.closed && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isOpenNow(businessHours, timezone)
                    ? 'bg-success/10 text-success'
                    : 'bg-error/10 text-error'
                }`}
              >
                {isOpenNow(businessHours, timezone) ? t('open_now') : t('closed_now')}
              </span>
            )}
          </div>

          {/* Today's Hours - Clickable Dropdown */}
          {todayHours && (
            <button
              onClick={() => setShowAllHours(!showAllHours)}
              className="w-full p-3 bg-surface rounded-lg border border-border hover:bg-primary hover:text-primaryText transition-colors"
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
            <div className="space-y-2 pt-2 border-t border-border">
              {daysOfWeek.map((day) => {
                const hours = businessHours?.[day];
                if (!hours) return null;

                return (
                  <div key={day} className="flex items-center justify-between text-sm py-2">
                    <span
                      className={`${
                        day === today
                          ? 'font-semibold text-cardText'
                          : 'text-cardTextSecondary'
                      }`}
                    >
                      {getDayName(day)}
                    </span>
                    <span className="text-cardText">
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
          <h3 className="text-sm font-semibold text-cardTextSecondary">{t('opening_hours')}</h3>
          <p className="text-sm text-cardText">{t('no_hours_available')}</p>
        </div>
      )}

    </div>
  );
}

