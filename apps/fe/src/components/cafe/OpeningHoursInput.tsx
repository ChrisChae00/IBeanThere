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
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {t('opening_hours_label')}
        </label>
        <button
          type="button"
          onClick={handleToggle}
          className="px-4 py-2.5 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors min-h-[44px]"
        >
          + {t('opening_hours_toggle')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[var(--color-text)]">
          {t('opening_hours_label')}
        </label>
        <button
          type="button"
          onClick={handleToggle}
          className="text-sm text-[var(--color-error)] hover:underline"
        >
          {t('remove_hours')}
        </button>
      </div>
      
      <p className="text-xs text-[var(--color-text-secondary)]">
        {t('opening_hours_hint')}
      </p>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={applyToWeekdays}
          className="text-xs px-3 py-1.5 bg-[var(--color-surface)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
        >
          {t('apply_to_all_weekdays')}
        </button>
        <button
          type="button"
          onClick={applyToAllDays}
          className="text-xs px-3 py-1.5 bg-[var(--color-surface)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
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
            <div key={day} className="flex items-center gap-3">
              <div className="w-24 text-sm text-[var(--color-text)] font-medium">
                {t(`day_${day}` as any)}
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dayHours.closed}
                  onChange={(e) => handleDayChange(day, 'closed', e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text)]">{t('closed')}</span>
              </label>

              {!dayHours.closed && (
                <>
                  <input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                    className="px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] text-sm min-h-[40px]"
                  />
                  <span className="text-[var(--color-text-secondary)]">-</span>
                  <input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                    className="px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] text-sm min-h-[40px]"
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

