'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BusinessHours } from '@/types/map';

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
        className="cursor-pointer appearance-none rounded-(--radius-pill) border border-edge-rule bg-surface-raised py-1.5 pl-3 pr-7 text-xs text-ink-primary transition-colors hover:bg-surface-hover"
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
  const [showHours, setShowHours] = useState(!!value && Object.keys(value).length > 0);
  const [rangeStart, setRangeStart] = useState<typeof DAYS[number]>('monday');
  const [rangeEnd, setRangeEnd] = useState<typeof DAYS[number]>('friday');

  // Sync showHours when value is set externally (e.g. Google Maps auto-fill)
  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      setShowHours(true);
    }
  }, [value]);

  const handleToggle = () => {
    if (showHours) {
      onChange(undefined);
      setShowHours(false);
    } else {
      const defaultHours: BusinessHours = {};
      DAYS.forEach((day) => {
        defaultHours[day] = { open: '09:00', close: '18:00', closed: false };
      });
      onChange(defaultHours);
      setShowHours(true);
    }
  };

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
  };

  const applyToAllDays = () => {
    if (!value || !value.monday) return;
    
    const mondayHours = value.monday;
    const updatedHours = { ...value };
    
    DAYS.forEach((day) => {
      updatedHours[day] = { ...mondayHours };
    });
    
    onChange(updatedHours);
  };

  if (!showHours) {
    return (
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-primary">
          {t('opening_hours_label')}
        </label>
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
      
      <p className="text-xs text-ink-secondary">
        {t('opening_hours_hint')}
      </p>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={applyToAllDays}
          className="rounded-(--radius-pill) border border-edge-rule px-3 py-1.5 text-xs text-ink-primary transition-colors hover:bg-surface-hover"
        >
          {t('apply_to_all_days')}
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          <DaySelect value={rangeStart} onChange={setRangeStart} label={t('range_from')} />
          <span className="text-xs text-ink-secondary">{t('range_to')}</span>
          <DaySelect value={rangeEnd} onChange={setRangeEnd} label={t('range_to')} />
          <button
            type="button"
            onClick={applyToRange}
            className="rounded-(--radius-pill) border border-edge-rule px-3 py-1.5 text-xs text-ink-primary transition-colors hover:bg-surface-hover"
          >
            {t('apply_to_range')}
          </button>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {DAYS.map((day) => {
          const dayHours = value?.[day];
          if (!dayHours) return null;

          return (
            <div key={day} className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="w-20 text-xs font-medium text-ink-primary sm:w-24 sm:text-sm">
                {t(`day_${day}` as any)}
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dayHours.closed}
                  onChange={(e) => handleDayChange(day, 'closed', e.target.checked)}
                  className="h-4 w-4 rounded-sm border-edge-rule accent-[var(--brand)] focus:ring-2 focus:ring-brand"
                />
                <span className="text-xs text-ink-primary sm:text-sm">{t('closed')}</span>
              </label>

              {!dayHours.closed && (
                <>
                  <input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                    className="min-h-11 w-[100px] rounded-(--input-radius) border border-edge-rule bg-surface px-3 text-sm text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-brand sm:w-auto"
                  />
                  <span className="text-ink-secondary">-</span>
                  <input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                    className="min-h-11 w-[100px] rounded-(--input-radius) border border-edge-rule bg-surface px-3 text-sm text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-brand sm:w-auto"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

