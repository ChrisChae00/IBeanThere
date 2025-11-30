'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui';

interface AdvancedSpaceSectionProps {
  wifiQuality: string;
  onWifiQualityChange: (value: string) => void;
  wifiRating: number | undefined;
  onWifiRatingChange: (value: number | undefined) => void;
  wifiComment: string;
  onWifiCommentChange: (value: string) => void;
  outletAvailability: string;
  onOutletAvailabilityChange: (value: string) => void;
  outletLocation: string;
  onOutletLocationChange: (value: string) => void;
  outletComment: string;
  onOutletCommentChange: (value: string) => void;
  furnitureComfort: string;
  onFurnitureComfortChange: (value: string) => void;
  noiseLevel: string;
  onNoiseLevelChange: (value: string) => void;
  temperatureLighting: string;
  onTemperatureLightingChange: (value: string) => void;
  parkingType: string;
  onParkingTypeChange: (value: string) => void;
  parkingPaid: boolean;
  onParkingPaidChange: (value: boolean) => void;
  parkingComment: string;
  onParkingCommentChange: (value: string) => void;
}

const renderStarRating = (
  value: number | undefined,
  onChange: (val: number) => void,
  label: string
) => (
  <div>
    <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-1">
      {label}
    </label>
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
          aria-label={`${label} ${star} out of 5`}
        >
          <svg
            className={`w-6 h-6 transition-colors ${
              value && value >= star
                ? 'text-[var(--color-starFilled)]'
                : 'text-[var(--color-starEmpty)]'
            }`}
            fill="currentColor"
            stroke={value && value >= star ? 'currentColor' : 'var(--color-starEmptyOutline)'}
            strokeWidth="1.5"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  </div>
);

const NOISE_LEVELS = [
  { value: 'quiet', labelKey: 'noise_level_quiet' },
  { value: 'moderate', labelKey: 'noise_level_moderate' },
  { value: 'lively', labelKey: 'noise_level_lively' },
  { value: 'loud', labelKey: 'noise_level_loud' }
];

const PARKING_TYPES = [
  { value: 'cafe_plaza', labelKey: 'parking_type_cafe_plaza' },
  { value: 'street', labelKey: 'parking_type_street' },
  { value: 'nearby', labelKey: 'parking_type_nearby' }
];

const OUTLET_AVAILABILITIES = [
  { value: 'none', labelKey: 'outlet_availability_none' },
  { value: 'limited', labelKey: 'outlet_availability_limited' },
  { value: 'moderate', labelKey: 'outlet_availability_moderate' },
  { value: 'many', labelKey: 'outlet_availability_many' }
];

const OUTLET_LOCATIONS = [
  { value: 'table', labelKey: 'outlet_location_table' },
  { value: 'wall', labelKey: 'outlet_location_wall' },
  { value: 'floor', labelKey: 'outlet_location_floor' },
  { value: 'mixed', labelKey: 'outlet_location_mixed' }
];

export default function AdvancedSpaceSection({
  wifiQuality,
  onWifiQualityChange,
  wifiRating,
  onWifiRatingChange,
  wifiComment,
  onWifiCommentChange,
  outletAvailability,
  onOutletAvailabilityChange,
  outletLocation,
  onOutletLocationChange,
  outletComment,
  onOutletCommentChange,
  furnitureComfort,
  onFurnitureComfortChange,
  noiseLevel,
  onNoiseLevelChange,
  temperatureLighting,
  onTemperatureLightingChange,
  parkingType,
  onParkingTypeChange,
  parkingPaid,
  onParkingPaidChange,
  parkingComment,
  onParkingCommentChange
}: AdvancedSpaceSectionProps) {
  const t = useTranslations('cafe.log');
  const [isExpanded, setIsExpanded] = useState(false);
  const [productivityExpanded, setProductivityExpanded] = useState(true);
  const [environmentExpanded, setEnvironmentExpanded] = useState(true);

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[var(--color-background)] hover:bg-[var(--color-surfaceHover)] transition-colors"
        aria-expanded={isExpanded}
        aria-label={t('space_work_environment')}
      >
        <span className="font-medium text-[var(--color-text)]">{t('space_work_environment')}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-6 bg-[var(--color-cardBackground)]">
          {/* Productivity Infrastructure */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setProductivityExpanded(!productivityExpanded)}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide hover:text-[var(--color-primary)] transition-colors"
              aria-expanded={productivityExpanded}
            >
              <span>{t('productivity_infrastructure')}</span>
              <svg
                className={`w-3 h-3 transition-transform ${productivityExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {productivityExpanded && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  {t('wifi_quality')}
                </label>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => onWifiRatingChange(star)}
                        className="focus:outline-none"
                        aria-label={`WiFi Rating ${star} out of 5`}
                      >
                        <svg
                          className={`w-6 h-6 transition-colors ${
                            wifiRating && wifiRating >= star
                              ? 'text-[var(--color-starFilled)]'
                              : 'text-[var(--color-starEmpty)]'
                          }`}
                          fill="currentColor"
                          stroke={wifiRating && wifiRating >= star ? 'currentColor' : 'var(--color-starEmptyOutline)'}
                          strokeWidth="1.5"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Input
                  multiline
                  value={wifiComment}
                  onChange={(e) => onWifiCommentChange(e.target.value)}
                  placeholder={t('wifi_comment_placeholder')}
                  rows={2}
                  aria-label={t('wifi_comment')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
                  {t('outlet_info')}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[var(--color-surfaceTextSecondary)] mb-1">
                      {t('outlet_availability')}
                    </label>
                    <select
                      value={outletAvailability}
                      onChange={(e) => onOutletAvailabilityChange(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      aria-label={t('outlet_availability')}
                    >
                      <option value="">{t('optional')}</option>
                      {OUTLET_AVAILABILITIES.map((availability) => (
                        <option key={availability.value} value={availability.value}>
                          {t(availability.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {outletAvailability && outletAvailability !== 'none' && (
                    <div>
                      <label className="block text-xs text-[var(--color-surfaceTextSecondary)] mb-1">
                        {t('outlet_location')}
                      </label>
                      <select
                        value={outletLocation}
                        onChange={(e) => onOutletLocationChange(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        aria-label={t('outlet_location')}
                      >
                        <option value="">{t('optional')}</option>
                        {OUTLET_LOCATIONS.map((location) => (
                          <option key={location.value} value={location.value}>
                            {t(location.labelKey)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {outletAvailability && (
                    <Input
                      multiline
                      label={t('outlet_comment')}
                      value={outletComment}
                      onChange={(e) => onOutletCommentChange(e.target.value)}
                      placeholder={t('outlet_comment_placeholder')}
                      rows={2}
                      aria-label={t('outlet_comment')}
                    />
                  )}
                </div>
              </div>
              
              <div>
                <Input
                  multiline
                  label={t('furniture_comfort')}
                  value={furnitureComfort}
                  onChange={(e) => onFurnitureComfortChange(e.target.value)}
                  placeholder={t('furniture_comfort_placeholder')}
                  rows={2}
                  aria-label={t('furniture_comfort')}
                />
              </div>
            </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--color-border)]"></div>

          {/* Environment Factors */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setEnvironmentExpanded(!environmentExpanded)}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide hover:text-[var(--color-primary)] transition-colors"
              aria-expanded={environmentExpanded}
            >
              <span>{t('environment_factors')}</span>
              <svg
                className={`w-3 h-3 transition-transform ${environmentExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {environmentExpanded && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
                  {t('noise_level')}
                </label>
                <select
                  value={noiseLevel}
                  onChange={(e) => onNoiseLevelChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  aria-label={t('noise_level')}
                >
                  <option value="">{t('optional')}</option>
                  {NOISE_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {t(level.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Input
                  multiline
                  label={t('temperature_lighting')}
                  value={temperatureLighting}
                  onChange={(e) => onTemperatureLightingChange(e.target.value)}
                  placeholder={t('temperature_lighting_placeholder')}
                  rows={2}
                  aria-label={t('temperature_lighting')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
                  {t('parking_availability')}
                </label>
                <select
                  value={parkingType}
                  onChange={(e) => onParkingTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] mb-3"
                  aria-label={t('parking_type')}
                >
                  <option value="">{t('parking_not_specified')}</option>
                  {PARKING_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {t(type.labelKey)}
                    </option>
                  ))}
                </select>
                
                {parkingType && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="parking-paid"
                        checked={parkingPaid}
                        onChange={(e) => onParkingPaidChange(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <label htmlFor="parking-paid" className="text-sm text-[var(--color-surfaceTextSecondary)]">
                        {t('parking_paid')}
                      </label>
                    </div>
                    
                    <Input
                      multiline
                      label={t('parking_comment')}
                      value={parkingComment}
                      onChange={(e) => onParkingCommentChange(e.target.value)}
                      placeholder={t('parking_comment_placeholder')}
                      rows={2}
                      aria-label={t('parking_comment')}
                    />
                  </>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

