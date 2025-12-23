'use client';

import { useTranslations } from 'next-intl';
import { PhotoUpload } from '@/shared/ui';
import { Input } from '@/components/ui';

interface BasicLoggingSectionProps {
  rating: number | undefined;
  onRatingChange: (value: number) => void;
  atmosphereTags: string[];
  onAtmosphereTagsChange: (tags: string[]) => void;
  coffeeType: string;
  onCoffeeTypeChange: (value: string) => void;
  dessert: string;
  onDessertChange: (value: string) => void;
  price: number | undefined;
  onPriceChange: (value: number | undefined) => void;
  priceCurrency: string;
  onPriceCurrencyChange: (value: string) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  photoUrls: string[];
  onPhotoUrlsChange: (urls: string[]) => void;
  errors: Record<string, string>;
  onErrorClear: (field: string) => void;
}

const COFFEE_TYPES = [
  'Espresso',
  'Americano',
  'Latte',
  'Cappuccino',
  'Macchiato',
  'Cortado',
  'Mocha',
  'Flat White',
  'Cold Brew',
  'Iced Coffee',
  'Other'
];

const CURRENCIES = [
  { value: 'USD', labelKey: 'currency_usd' },
  { value: 'KRW', labelKey: 'currency_krw' },
  { value: 'EUR', labelKey: 'currency_eur' },
  { value: 'JPY', labelKey: 'currency_jpy' },
  { value: 'GBP', labelKey: 'currency_gbp' },
  { value: 'CNY', labelKey: 'currency_cny' },
  { value: 'AUD', labelKey: 'currency_aud' },
  { value: 'CAD', labelKey: 'currency_cad' }
];

const ATMOSPHERE_TAGS = [
  { value: 'cozy', labelKey: 'atmosphere_cozy' },
  { value: 'modern', labelKey: 'atmosphere_modern' },
  { value: 'minimalist', labelKey: 'atmosphere_minimalist' },
  { value: 'casual', labelKey: 'atmosphere_casual' },
  { value: 'industrial', labelKey: 'atmosphere_industrial' },
  { value: 'vintage', labelKey: 'atmosphere_vintage' },
  { value: 'bright', labelKey: 'atmosphere_bright' },
  { value: 'spacious', labelKey: 'atmosphere_spacious' },
  { value: 'artistic', labelKey: 'atmosphere_artistic' }
];

export default function BasicLoggingSection({
  rating,
  onRatingChange,
  atmosphereTags,
  onAtmosphereTagsChange,
  coffeeType,
  onCoffeeTypeChange,
  dessert,
  onDessertChange,
  price,
  onPriceChange,
  priceCurrency,
  onPriceCurrencyChange,
  comment,
  onCommentChange,
  photoUrls,
  onPhotoUrlsChange,
  errors,
  onErrorClear
}: BasicLoggingSectionProps) {
  const t = useTranslations('cafe.log');

  const handleRatingClick = (value: number) => {
    onRatingChange(value);
    onErrorClear('rating');
  };

  return (
    <div className="space-y-6">
      {/* Photo Upload - First */}
      <PhotoUpload
        photos={photoUrls}
        onChange={onPhotoUrlsChange}
        maxPhotos={5}
      />

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
          {t('rating')} <span className="text-[var(--color-error)]">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRatingClick(value)}
              className="focus:outline-none"
              aria-label={`Rate ${value} out of 5`}
            >
              <svg
                className={`w-8 h-8 transition-colors ${
                  rating && rating >= value
                    ? 'text-[var(--color-starFilled)]'
                    : 'text-[var(--color-starEmpty)]'
                }`}
                fill="currentColor"
                stroke={rating && rating >= value ? 'currentColor' : 'var(--color-starEmptyOutline)'}
                strokeWidth="1.5"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating && (
            <span className="text-sm text-[var(--color-surfaceTextSecondary)] ml-2">
              {rating}/5
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="text-sm text-[var(--color-error)] mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Atmosphere Tags */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
          {t('atmosphere_tags')} {atmosphereTags.length > 0 && (
            <span className="text-xs text-[var(--color-surfaceTextSecondary)]">
              ({atmosphereTags.length}/3)
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {ATMOSPHERE_TAGS.map((tag) => {
            const isSelected = atmosphereTags.includes(tag.value);
            const isDisabled = !isSelected && atmosphereTags.length >= 3;
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onAtmosphereTagsChange(atmosphereTags.filter(t => t !== tag.value));
                  } else if (atmosphereTags.length < 3) {
                    onAtmosphereTagsChange([...atmosphereTags, tag.value]);
                  }
                }}
                disabled={isDisabled}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-[var(--color-primaryText)] border-2 border-[var(--color-primary)]'
                    : isDisabled
                    ? 'bg-[var(--color-surface)] text-[var(--color-surfaceTextSecondary)] border-2 border-[var(--color-border)] opacity-50 cursor-not-allowed'
                    : 'bg-[var(--color-surface)] text-[var(--color-surfaceText)] border-2 border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }`}
                aria-label={t(tag.labelKey)}
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
              >
                {t(tag.labelKey)}
              </button>
            );
          })}
        </div>
        {atmosphereTags.length >= 3 && (
          <p className="text-xs text-[var(--color-surfaceTextSecondary)] mt-1">
            {t('atmosphere_tags_max_reached') || 'Maximum 3 tags selected'}
          </p>
        )}
      </div>

      {/* Coffee Type */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
          {t('coffee_type')} ({t('optional')})
        </label>
        <input
          list="coffee-types"
          value={coffeeType}
          onChange={(e) => onCoffeeTypeChange(e.target.value)}
          placeholder={t('coffee_type_placeholder')}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          aria-label={t('coffee_type')}
        />
        <datalist id="coffee-types">
          {COFFEE_TYPES.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
      </div>

      {/* Dessert */}
      <div>
        <Input
          label={`${t('dessert')} (${t('optional')})`}
          value={dessert}
          onChange={(e) => onDessertChange(e.target.value)}
          placeholder={t('dessert_placeholder')}
          aria-label={t('dessert')}
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
          {t('price')} ({t('optional')})
        </label>
        <div className="flex gap-2">
          <div className="w-36">
            <select
              value={priceCurrency}
              onChange={(e) => onPriceCurrencyChange(e.target.value)}
              className="w-full rounded-2xl border bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] h-[48px] py-3 pl-4 pr-12 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]/30 appearance-none cursor-pointer"
              aria-label={t('price_currency')}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {t(currency.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Input
              type="number"
              value={price?.toString() || ''}
              onChange={(e) => {
                const value = e.target.value;
                onPriceChange(value ? parseFloat(value) : undefined);
              }}
              placeholder={t('price_placeholder')}
              min="0"
              step="0.01"
              aria-label={t('price')}
            />
          </div>
        </div>
      </div>

      {/* Comment */}
      <div>
        <Input
          multiline
          label={`${t('comment')} (${t('optional')})`}
          value={comment}
          onChange={(e) => {
            onCommentChange(e.target.value);
            onErrorClear('comment');
          }}
          rows={4}
          maxLength={1000}
          placeholder={t('comment_placeholder')}
          error={errors.comment}
          aria-label={t('comment')}
        />
        <div className="mt-1 text-right text-xs text-[var(--color-surfaceTextSecondary)]">
          {comment.length}/1000
        </div>
      </div>
    </div>
  );
}

