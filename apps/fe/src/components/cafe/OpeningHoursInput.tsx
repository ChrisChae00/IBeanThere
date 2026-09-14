'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/contexts/ToastContext';
import { BusinessHours } from '@/types/map';
import { hasDayHours, isTemporarilyClosed, setTemporarilyClosed } from '@/lib/utils/businessHours';

interface OpeningHoursInputProps {
  value: BusinessHours | undefined;
  onChange: (hours: BusinessHours | undefined) => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

function DaySelect({
  value,
  onChange,
  label
}: {
  value: typeof DAYS[number];
  onChange: (day: typeof DAYS[number]) => void;
  label: string;
}) {
  const t = useTranslations('cafe.register');

  return (
    <span className="relative inline-flex">
      {/* The arrow is an icon, not a data-URI with a colour baked into it. */}
      <ChevronDown
        size={12}
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-secondary"
      />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as typeof DAYS[number])}
        /*
          Content width, not a share of the row: a select sizes itself to its widest
          option, so both pickers stay the same width whichever day is chosen and
          neither carries empty space beside the word.
        */
        className="control-flat cursor-pointer appearance-none rounded-(--radius-pill) py-1.5 pl-3 pr-6 text-center text-sm"
      >
        {DAYS.map((day) => (
          <option key={day} value={day}>
            {t(`day_${day}` as any)}
          </option>
        ))}
      </select>
    </span>
  );
}

export default function OpeningHoursInput({ value, onChange }: OpeningHoursInputProps) {
  const t = useTranslations('cafe.register');
  const { showToast } = useToast();
  const [showHours, setShowHours] = useState(hasDayHours(value));
  const [rangeStart, setRangeStart] = useState<typeof DAYS[number]>('monday');
  const [rangeEnd, setRangeEnd] = useState<typeof DAYS[number]>('friday');

  // Sync showHours when value is set externally (e.g. Google Maps auto-fill)
  useEffect(() => {
    if (hasDayHours(value)) {
      setShowHours(true);
    }
  }, [value]);

  const tempClosed = isTemporarilyClosed(value);

  const handleToggle = () => {
    if (showHours) {
      // Dropping the timetable is not the same as reopening: keep the closed-for-now
      // mark, which is about the shop rather than about its hours.
      onChange(setTemporarilyClosed(undefined, tempClosed));
      setShowHours(false);
    } else {
      const defaultHours: BusinessHours = {};
      DAYS.forEach((day) => {
        defaultHours[day] = { open: '09:00', close: '18:00', closed: false };
      });
      onChange(setTemporarilyClosed(defaultHours, tempClosed));
      setShowHours(true);
    }
  };

  const handleTempClosedChange = (closed: boolean) => {
    onChange(setTemporarilyClosed(value, closed));
  };

  /*
    Offered above the timetable and outside the `showHours` branch, because it applies
    to a shop whose hours nobody has recorded just as much as to one whose hours are
    known -- and because a reader who sees "temporarily closed" does not then need the
    hours to work out that the door is locked.
  */
  const temporarilyClosedToggle = (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={tempClosed}
        onChange={(e) => handleTempClosedChange(e.target.checked)}
        className="h-4 w-4 rounded-sm border-edge-rule accent-[var(--brand)]"
      />
      <span className="text-sm text-ink-primary">{t('temporarily_closed')}</span>
    </label>
  );

  const handleDayChange = (day: string, field: 'open' | 'close' | 'closed', newValue: string | boolean) => {
    if (!value) return;
    
    const updatedHours = { ...value };
    
    if (field === 'closed') {
      updatedHours[day] = {
        ...updatedHours[day],
        closed: newValue as boolean
      };
    } else {
      updatedHours[day] = {
        ...updatedHours[day],
        [field]: newValue as string
      };
    }
    
    onChange(updatedHours);
  };

  /*
    A range copies the hours of the day it starts on, the same way "apply to all"
    copies Monday's: the first day of a run is the one somebody has just filled in,
    and the rest of the run follows it. The range wraps, so Friday-to-Monday is four
    days, not an empty selection.
  */
  const applyToRange = () => {
    if (!value) return;

    const startIndex = DAYS.indexOf(rangeStart);
    const endIndex = DAYS.indexOf(rangeEnd);
    const source = value[rangeStart];
    if (!source) return;

    const span = (endIndex - startIndex + DAYS.length) % DAYS.length;
    const updatedHours = { ...value };
    for (let step = 0; step <= span; step += 1) {
      updatedHours[DAYS[(startIndex + step) % DAYS.length]] = { ...source };
    }

    onChange(updatedHours);
    showToast(t('hours_applied_range', {
      from: t(`day_${rangeStart}` as any),
      to: t(`day_${rangeEnd}` as any)
    }), 'success', 1400);
  };

  const applyToAllDays = () => {
    if (!value || !value.monday) return;
    
    const mondayHours = value.monday;
    const updatedHours = { ...value };
    
    DAYS.forEach((day) => {
      updatedHours[day] = { ...mondayHours };
    });
    
    onChange(updatedHours);
    showToast(t('hours_applied_all'), 'success', 1400);
  };

  if (!showHours) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-ink-primary">
          {t('opening_hours_label')}
        </label>
        {temporarilyClosedToggle}
        <button
          type="button"
          onClick={handleToggle}
          className="control-flat min-h-11 rounded-(--btn-radius) border border-edge-rule px-4 text-ink-primary"
        >
          + {t('opening_hours_toggle')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-ink-primary">
          {t('opening_hours_label')}
        </label>
        <button
          type="button"
          onClick={handleToggle}
          className="text-sm text-error hover:underline"
        >
          {t('remove_hours')}
        </button>
      </div>
      
      {temporarilyClosedToggle}

      {tempClosed ? (
        <p className="text-xs text-ink-secondary">{t('temporarily_closed_hint')}</p>
      ) : (
        <p className="text-xs text-ink-secondary">{t('opening_hours_hint')}</p>
      )}

      {/*
        On a phone this is three stacked rows -- copy Monday everywhere, pick a range,
        apply it -- because four controls on one line there leaves each of them too
        narrow to read. From `sm` it is the single line it was.
      */}
      {/*
        No viewport breakpoints anywhere in this section: the form is a column beside
        the map, so on a tablet it is narrow while the viewport is wide. These rows
        wrap on their own width instead.
      */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={applyToAllDays}
          className="control-flat rounded-(--radius-pill) px-3 py-1.5 text-sm"
        >
          {t('apply_to_all_days')}
        </button>

        <DaySelect value={rangeStart} onChange={setRangeStart} label={t('range_from')} />
        <span className="text-xs text-ink-secondary">{t('range_to')}</span>
        <DaySelect value={rangeEnd} onChange={setRangeEnd} label={t('range_to')} />

        <button
          type="button"
          onClick={applyToRange}
          className="control-flat rounded-(--radius-pill) px-3 py-1.5 text-sm"
        >
          {t('apply_to_range')}
        </button>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {DAYS.map((day) => {
          const dayHours = value?.[day];
          if (!dayHours) return null;

          return (
            <div
              key={day}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-edge-rule pb-3 last:border-0 last:pb-0"
            >
              <span className="w-20 shrink-0 text-sm font-medium text-ink-primary">
                {t(`day_${day}` as any)}
              </span>

              <label className="flex shrink-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={dayHours.closed}
                  onChange={(e) => handleDayChange(day, 'closed', e.target.checked)}
                  className="h-4 w-4 rounded-sm border-edge-rule accent-[var(--brand)]"
                />
                <span className="text-sm text-ink-primary">{t('closed')}</span>
              </label>

              {/*
                Fluid, not a fixed 100px: a 12-hour locale renders "06:00 PM" and the
                fixed width cut the meridiem off, so 18:00 read as 06:00. The pair keeps
                a floor so it drops to its own line rather than squeezing the clocks.
              */}
              {!dayHours.closed && (
                <div className="flex min-w-[15rem] flex-1 items-center gap-2">
                  <input
                    type="time"
                    aria-label={`${t(`day_${day}` as any)} ${t('open_time')}`}
                    value={dayHours.open}
                    onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                    className="min-h-11 w-full min-w-0 rounded-(--input-radius) border border-edge-rule bg-surface px-3 text-sm text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-brand"
                  />
                  <span className="shrink-0 text-ink-secondary">-</span>
                  <input
                    type="time"
                    aria-label={`${t(`day_${day}` as any)} ${t('close_time')}`}
                    value={dayHours.close}
                    onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                    className="min-h-11 w-full min-w-0 rounded-(--input-radius) border border-edge-rule bg-surface px-3 text-sm text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-brand"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

