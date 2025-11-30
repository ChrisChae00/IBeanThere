'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input, IntensitySlider } from '@/components/ui';

interface AdvancedCoffeeSectionProps {
  beanOrigin: string;
  onBeanOriginChange: (value: string) => void;
  processingMethod: string;
  onProcessingMethodChange: (value: string) => void;
  roastLevel: string;
  onRoastLevelChange: (value: string) => void;
  extractionMethod: string;
  onExtractionMethodChange: (value: string) => void;
  extractionEquipment: string;
  onExtractionEquipmentChange: (value: string) => void;
  aromaRating: number | undefined;
  onAromaRatingChange: (value: number | undefined) => void;
  acidityRating: number | undefined;
  onAcidityRatingChange: (value: number | undefined) => void;
  sweetnessRating: number | undefined;
  onSweetnessRatingChange: (value: number | undefined) => void;
  bitternessRating: number | undefined;
  onBitternessRatingChange: (value: number | undefined) => void;
  bodyRating: number | undefined;
  onBodyRatingChange: (value: number | undefined) => void;
  aftertasteRating: number | undefined;
  onAftertasteRatingChange: (value: number | undefined) => void;
}

const PROCESSING_METHODS = [
  { value: 'washed', labelKey: 'processing_method_washed' },
  { value: 'natural', labelKey: 'processing_method_natural' },
  { value: 'honey', labelKey: 'processing_method_honey' },
  { value: 'other', labelKey: 'processing_method_other' }
];

const ROAST_LEVELS = [
  { value: 'light', labelKey: 'roast_level_light' },
  { value: 'medium', labelKey: 'roast_level_medium' },
  { value: 'medium_dark', labelKey: 'roast_level_medium_dark' },
  { value: 'dark', labelKey: 'roast_level_dark' }
];


export default function AdvancedCoffeeSection({
  beanOrigin,
  onBeanOriginChange,
  processingMethod,
  onProcessingMethodChange,
  roastLevel,
  onRoastLevelChange,
  extractionMethod,
  onExtractionMethodChange,
  extractionEquipment,
  onExtractionEquipmentChange,
  aromaRating,
  onAromaRatingChange,
  acidityRating,
  onAcidityRatingChange,
  sweetnessRating,
  onSweetnessRatingChange,
  bitternessRating,
  onBitternessRatingChange,
  bodyRating,
  onBodyRatingChange,
  aftertasteRating,
  onAftertasteRatingChange
}: AdvancedCoffeeSectionProps) {
  const t = useTranslations('cafe.log');
  const [isExpanded, setIsExpanded] = useState(false);
  const [beanInfoExpanded, setBeanInfoExpanded] = useState(true);
  const [extractionInfoExpanded, setExtractionInfoExpanded] = useState(true);
  const [tastingNotesExpanded, setTastingNotesExpanded] = useState(true);

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[var(--color-background)] hover:bg-[var(--color-surfaceHover)] transition-colors"
        aria-expanded={isExpanded}
        aria-label={t('coffee_taste_advanced')}
      >
        <span className="font-medium text-[var(--color-text)]">{t('coffee_taste_advanced')}</span>
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
          {/* Bean Information */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setBeanInfoExpanded(!beanInfoExpanded)}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide hover:text-[var(--color-primary)] transition-colors"
              aria-expanded={beanInfoExpanded}
            >
              <span>Bean Information</span>
              <svg
                className={`w-3 h-3 transition-transform ${beanInfoExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {beanInfoExpanded && (
            <div className="space-y-4">
              <div>
                <Input
                  label={t('bean_origin')}
                  value={beanOrigin}
                  onChange={(e) => onBeanOriginChange(e.target.value)}
                  placeholder={t('bean_origin_placeholder')}
                  aria-label={t('bean_origin')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
                  {t('processing_method')}
                </label>
                <select
                  value={processingMethod}
                  onChange={(e) => onProcessingMethodChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  aria-label={t('processing_method')}
                >
                  <option value="">{t('optional')}</option>
                  {PROCESSING_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {t(method.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
                  {t('roast_level')}
                </label>
                <select
                  value={roastLevel}
                  onChange={(e) => onRoastLevelChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  aria-label={t('roast_level')}
                >
                  <option value="">{t('optional')}</option>
                  {ROAST_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {t(level.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--color-border)]"></div>

          {/* Extraction Information */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setExtractionInfoExpanded(!extractionInfoExpanded)}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide hover:text-[var(--color-primary)] transition-colors"
              aria-expanded={extractionInfoExpanded}
            >
              <span>Extraction Information</span>
              <svg
                className={`w-3 h-3 transition-transform ${extractionInfoExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {extractionInfoExpanded && (
            <div className="space-y-4">
              <div>
                <Input
                  label={t('extraction_method')}
                  value={extractionMethod}
                  onChange={(e) => onExtractionMethodChange(e.target.value)}
                  placeholder={t('extraction_method_placeholder')}
                  aria-label={t('extraction_method')}
                />
              </div>
              
              <div>
                <Input
                  label={t('extraction_equipment')}
                  value={extractionEquipment}
                  onChange={(e) => onExtractionEquipmentChange(e.target.value)}
                  placeholder={t('extraction_equipment_placeholder')}
                  aria-label={t('extraction_equipment')}
                />
              </div>
            </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--color-border)]"></div>

          {/* Tasting Notes */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setTastingNotesExpanded(!tastingNotesExpanded)}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide hover:text-[var(--color-primary)] transition-colors"
              aria-expanded={tastingNotesExpanded}
            >
              <span>Tasting Notes</span>
              <svg
                className={`w-3 h-3 transition-transform ${tastingNotesExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {tastingNotesExpanded && (
            <div className="space-y-4">
              <IntensitySlider
                value={aromaRating}
                onChange={onAromaRatingChange}
                label={t('aroma')}
                min={0}
                max={10}
                step={1}
              />
              <IntensitySlider
                value={acidityRating}
                onChange={onAcidityRatingChange}
                label={t('acidity')}
                min={0}
                max={10}
                step={1}
              />
              <IntensitySlider
                value={sweetnessRating}
                onChange={onSweetnessRatingChange}
                label={t('sweetness')}
                min={0}
                max={10}
                step={1}
              />
              <IntensitySlider
                value={bitternessRating}
                onChange={onBitternessRatingChange}
                label={t('bitterness')}
                min={0}
                max={10}
                step={1}
              />
              <IntensitySlider
                value={bodyRating}
                onChange={onBodyRatingChange}
                label={t('body')}
                min={0}
                max={10}
                step={1}
              />
              <IntensitySlider
                value={aftertasteRating}
                onChange={onAftertasteRatingChange}
                label={t('aftertaste')}
                min={0}
                max={10}
                step={1}
              />
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

