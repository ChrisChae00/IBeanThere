'use client';

import { useTranslations } from 'next-intl';
import { IntensitySlider } from '@/shared/ui';

/*
  How it tasted, on seven sliders.

  Everything else this section used to hold is gone: bean origin, process and roast
  level are properties of a bean, not of one cup, so they belong to the catalogue
  row the log points at -- typed free-hand into every log they were seven spellings
  of the same coffee. Extraction method and equipment described the barista's work,
  which is not what this app asks anyone to remember.
*/

interface AdvancedCoffeeSectionProps {
  overallTasteRating: number | undefined;
  onOverallTasteRatingChange: (value: number | undefined) => void;
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

export default function AdvancedCoffeeSection({
  overallTasteRating,
  onOverallTasteRatingChange,
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
  onAftertasteRatingChange,
}: AdvancedCoffeeSectionProps) {
  const t = useTranslations('cafe.log');

  const sliders = [
    { label: t('aroma'), value: aromaRating, onChange: onAromaRatingChange },
    { label: t('acidity'), value: acidityRating, onChange: onAcidityRatingChange },
    { label: t('sweetness'), value: sweetnessRating, onChange: onSweetnessRatingChange },
    { label: t('bitterness'), value: bitternessRating, onChange: onBitternessRatingChange },
    { label: t('body'), value: bodyRating, onChange: onBodyRatingChange },
    { label: t('aftertaste'), value: aftertasteRating, onChange: onAftertasteRatingChange },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-ink-secondary">{t('tasting_notes')}</p>
      <IntensitySlider
        value={overallTasteRating}
        onChange={onOverallTasteRatingChange}
        label={t('overall_taste')}
        min={0}
        max={10}
        step={1}
      />
      <div className="border-t border-edge-rule" />
      {sliders.map((slider) => (
        <IntensitySlider
          key={slider.label}
          value={slider.value}
          onChange={slider.onChange}
          label={slider.label}
          min={0}
          max={10}
          step={1}
        />
      ))}
    </div>
  );
}
