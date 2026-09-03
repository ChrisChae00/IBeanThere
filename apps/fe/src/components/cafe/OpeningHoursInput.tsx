'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BusinessHours } from '@/types/map';

interface OpeningHoursInputProps {
  value: BusinessHours | undefined;
  onChange: (hours: BusinessHours | undefined) => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export default function OpeningHoursInput({ value, onChange }: OpeningHoursInputProps) {
  const t = useTranslations('cafe.register');
  const [showHours, setShowHours] = useState(!!value && Object.keys(value).length > 0);

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

  const applyToWeekdays = () => {
    if (!value || !value.monday) return;
    
    const mondayHours = value.monday;
    const updatedHours = { ...value };
    
    ['tuesday', 'wednesday', 'thursday', 'friday'].forEach((day) => {
      updatedHours[day] = { ...mondayHours };
    });
    
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
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={applyToWeekdays}
          className="rounded-(--radius-pill) border border-edge-rule px-3 py-1.5 text-xs text-ink-primary transition-colors hover:bg-surface-hover"
        >
          {t('apply_to_all_weekdays')}
        </button>
        <button
          type="button"
          onClick={applyToAllDays}
          className="rounded-(--radius-pill) border border-edge-rule px-3 py-1.5 text-xs text-ink-primary transition-colors hover:bg-surface-hover"
        >
          {t('apply_to_all_days')}
        </button>
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

