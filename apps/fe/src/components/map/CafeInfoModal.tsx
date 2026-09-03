'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CafeMapData } from '@/types/map';
import { isOpenNow, getCurrentDayInTimezone } from '@/lib/utils/businessHours';

import CafeCardImage from '../cafe/CafeCardImage';
import CafeMapActions from '../cafe/CafeMapActions';

interface CafeInfoModalProps {
  cafe: CafeMapData;
  onClose: () => void;
}

/*
  The card that opens beside the pin. It is positioned by whoever renders it -- on the
  map that is next to the marker, so the reader keeps the place they tapped in view.

  It opens with the photograph, name over it, the way a listing does; a verified cafe
  carries no badge at all, because the pin already draws it differently and a row that
  says "Verified" on every second card is a row of nothing. Dropping a bean happens on
  the cafe's own page: this card answers "which place is this", not "log a visit".
*/
export default function CafeInfoModal({ cafe, onClose }: CafeInfoModalProps) {
  const t = useTranslations('cafe.modal');
  const params = useParams();
  const locale = params.locale as string;
  const [showAllHours, setShowAllHours] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // A card opened for a different cafe starts at the top, not wherever the last one was
  // left -- the browser keeps the scroll offset of the element it is reusing.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [cafe.id]);

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

  /* One scroll region, not two: a scrolling body inside a fixed frame put the first line
     of the address under the photograph the moment anything took focus. */
  return (
    <div
      ref={scrollRef}
      /* Scroll anchoring off: the photograph settles into place after mount, and Chrome
         "helpfully" scrolls the card to keep the shifted content still -- which put the
         first line of the address behind the image every time. */
      style={{ overflowAnchor: 'none' }}
      className="scrollbar-quiet max-h-[inherit] w-full overflow-y-auto rounded-(--radius-card) border border-edge-rule bg-surface-raised shadow-(--shadow-panel)"
    >
      <div className="relative">
        {/* The card image component owns the placeholder, so a cafe with no photograph
            gets the same quiet slot it gets in the grid. */}
        {/* `overflow-hidden`: the card image sets a 200px min-height of its own, and
            without a clip here it spills 40px over the address below it. */}
        <div className="h-40 overflow-hidden">
          <CafeCardImage imageUrl={cafe.main_image} alt={cafe.name} size="large" locale={locale} />
        </div>

        {/* A gradient, not a flat scrim: the name needs the bottom edge dark enough to
            read against any photograph, and the top of the image should stay the image. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{ background: 'linear-gradient(to top, var(--scrim-media), transparent)' }}
        />
        <h2 className="absolute bottom-3 left-4 right-4 line-clamp-2 font-sans text-lg font-semibold text-ink-on-media">
          {cafe.name}
        </h2>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          {cafe.status !== 'verified' && (
            <span className="landing-micro rounded-(--radius-pill) bg-scrim-media px-3 py-1.5 text-ink-on-media">
              {t('status_pending')}
            </span>
          )}
          {/* Sized to the badge beside it, not to its own 44px target -- the target is
              restored by the invisible band, the way the map links do it. */}
          <button
            onClick={onClose}
            className="relative flex h-7 w-7 items-center justify-center rounded-(--radius-pill) bg-scrim-media text-ink-on-media before:absolute before:-inset-2 before:content-['']"
            aria-label={t('close')}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* Address + the two ways out to a map */}
        {cafe.address && (
          <div className="space-y-1">
            <h3 className="landing-micro text-ink-secondary">{t('address')}</h3>
            <p className="text-sm text-ink-primary">{cafe.address}</p>
          </div>
        )}

        <CafeMapActions
          name={cafe.name}
          address={cafe.address}
          latitude={cafe.latitude}
          longitude={cafe.longitude}
          sourceUrl={cafe.source_url}
        />

        {/* Phone */}
        {cafe.phoneNumber && (
          <div className="space-y-1">
            <h3 className="landing-micro text-ink-secondary">{t('phone')}</h3>
            <a href={`tel:${cafe.phoneNumber}`} className="text-sm text-ink-primary hover:underline">
              {cafe.phoneNumber}
            </a>
          </div>
        )}

        {/* Website */}
        {cafe.website && (
          <div className="space-y-1">
            <h3 className="landing-micro text-ink-secondary">{t('website')}</h3>
            <a
              href={cafe.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all text-sm text-ink-primary hover:underline"
            >
              {cafe.website}
            </a>
          </div>
        )}

        {/* Opening Hours */}
        {cafe.businessHours && Object.keys(cafe.businessHours).length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="landing-micro text-ink-secondary">{t('opening_hours')}</h3>
              {/*
                The state colour is the dot, not the label: `--state-*` on its own tint
                measures 2.4-3.5:1 in three of the four themes, so the word itself is
                set in ink and the colour is left to carry emphasis.
              */}
              {todayHours && !todayHours.closed && (
                <span
                  className={`landing-micro flex items-center gap-1.5 rounded-(--radius-pill) px-3 py-1.5 text-ink-primary ${
                    isOpenNow(cafe.businessHours, cafe.timezone)
                      ? 'bg-state-success/12'
                      : 'bg-state-danger/12'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-(--radius-pill) ${
                      isOpenNow(cafe.businessHours, cafe.timezone) ? 'bg-state-success' : 'bg-state-danger'
                    }`}
                  />
                  {isOpenNow(cafe.businessHours, cafe.timezone) ? t('open_now') : t('closed_now')}
                </span>
              )}
            </div>

            {todayHours && (
              <button
                onClick={() => setShowAllHours(!showAllHours)}
                className="control-flat w-full rounded-(--radius-control) border border-edge-rule p-3 text-sm text-ink-primary"
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
                      className={`h-4 w-4 transition-transform ${showAllHours ? 'rotate-180' : ''}`}
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

            {showAllHours && (
              <div className="space-y-2 border-t border-edge-rule pt-2">
                {daysOfWeek.map((day) => {
                  const hours = cafe.businessHours?.[day];
                  if (!hours) return null;

                  return (
                    <div key={day} className="flex items-center justify-between py-1.5 text-sm">
                      <span
                        className={
                          day === today ? 'font-semibold text-ink-primary' : 'text-ink-secondary'
                        }
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
        ) : (
          <div className="space-y-1">
            <h3 className="landing-micro text-ink-secondary">{t('opening_hours')}</h3>
            <p className="text-sm text-ink-primary">{t('no_hours_available')}</p>
          </div>
        )}

        <Link
          href={cafe.slug ? `/${locale}/cafes/${cafe.slug}` : `/${locale}/cafes/${cafe.id}`}
          className="btn-shade flex min-h-11 w-full items-center justify-center gap-2 rounded-(--btn-radius) bg-brand px-4 font-semibold text-ink-on-brand"
          onClick={onClose}
        >
          {t('view_details')}
        </Link>
      </div>
    </div>
  );
}
