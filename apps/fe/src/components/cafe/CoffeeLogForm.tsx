'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { LogFormData, CoffeeLog } from '@/types/api';
import StarRating from '@/components/ui/StarRating';
import PhotoUpload from '@/components/ui/PhotoUpload';
import ToggleButton from '@/components/ui/ToggleButton';
import { Button, Input } from '@/components/ui';

interface CoffeeLogFormProps {
  initialData?: CoffeeLog;
  onSubmit: (data: LogFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const COFFEE_TYPES = [
  'Espresso',
  'Americano',
  'Latte',
  'Cappuccino',
  'Macchiato',
  'Mocha',
  'Flat White',
  'Cold Brew',
  'Iced Coffee',
  'Other'
];

export default function CoffeeLogForm({ initialData, onSubmit, onCancel, isLoading }: CoffeeLogFormProps) {
  const t = useTranslations('cafe.log');
  const [rating, setRating] = useState<number | undefined>(initialData?.rating);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialData?.photo_urls || []);
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const [anonymous, setAnonymous] = useState(initialData?.anonymous ?? false);
  const [coffeeType, setCoffeeType] = useState(initialData?.coffee_type || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detailed Review State
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [atmosphereRating, setAtmosphereRating] = useState<number | undefined>(initialData?.atmosphere_rating);
  const [parkingInfo, setParkingInfo] = useState(initialData?.parking_info || '');
  const [acidityRating, setAcidityRating] = useState<number | undefined>(initialData?.acidity_rating);
  const [bodyRating, setBodyRating] = useState<number | undefined>(initialData?.body_rating);
  const [sweetnessRating, setSweetnessRating] = useState<number | undefined>(initialData?.sweetness_rating);
  const [bitternessRating, setBitternessRating] = useState<number | undefined>(initialData?.bitterness_rating);
  const [aftertasteRating, setAftertasteRating] = useState<number | undefined>(initialData?.aftertaste_rating);

  const handleRatingClick = (value: number) => {
    setRating(value);
    setErrors(prev => ({ ...prev, rating: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!rating) {
      newErrors.rating = t('rating_required');
    }
    
    if (comment.length > 1000) {
      newErrors.comment = t('comment_too_long');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit({
        rating,
        comment: comment.trim() || undefined,
        photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        is_public: isPublic,
        anonymous,
        coffee_type: coffeeType || undefined,
        atmosphere_rating: atmosphereRating,
        parking_info: parkingInfo || undefined,
        acidity_rating: acidityRating,
        body_rating: bodyRating,
        sweetness_rating: sweetnessRating,
        bitterness_rating: bitternessRating,
        aftertaste_rating: aftertasteRating,
      });
    } catch (error) {
      console.error('Error submitting log:', error);
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Coffee Type - Custom Input */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)] mb-2">
          {t('coffee_type')} ({t('optional')})
        </label>
        <input
          list="coffee-types"
          value={coffeeType}
          onChange={(e) => setCoffeeType(e.target.value)}
          placeholder={t('coffee_type_placeholder')}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <datalist id="coffee-types">
          {COFFEE_TYPES.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
      </div>

      {/* Detailed Review Section */}
      <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetailedReview(!showDetailedReview)}
          className="w-full px-4 py-3 flex items-center justify-between bg-[var(--color-background)] hover:bg-[var(--color-surfaceHover)] transition-colors"
        >
          <span className="font-medium text-[var(--color-text)]">{t('detailed_review')}</span>
          <svg
            className={`w-5 h-5 transition-transform ${showDetailedReview ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showDetailedReview && (
          <div className="p-4 space-y-6 bg-[var(--color-cardBackground)]">
            {/* Cafe Atmosphere Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide">
                {t('cafe_atmosphere')}
              </h4>
              <div className="space-y-4">
                {renderStarRating(atmosphereRating, setAtmosphereRating, t('atmosphere'))}
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-surfaceTextSecondary)]">
                    {t('parking_availability')}
                  </label>
                  <select
                    value={parkingInfo}
                    onChange={(e) => setParkingInfo(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">{t('parking_not_specified')}</option>
                    <option value="free_parking">{t('parking_free')}</option>
                    <option value="street_paid">{t('parking_street_paid')}</option>
                    <option value="street_free">{t('parking_street_free')}</option>
                    <option value="unknown">{t('parking_unknown')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-border)]"></div>

            {/* Coffee Taste Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide">
                {t('coffee_taste')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderStarRating(acidityRating, setAcidityRating, t('acidity'))}
                {renderStarRating(bodyRating, setBodyRating, t('body'))}
                {renderStarRating(sweetnessRating, setSweetnessRating, t('sweetness'))}
                {renderStarRating(bitternessRating, setBitternessRating, t('bitterness'))}
                <div className="md:col-span-2">
                  {renderStarRating(aftertasteRating, setAftertasteRating, t('aftertaste'))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comment */}
      <div>
        <Input
          multiline
          label={`${t('comment')} (${t('optional')})`}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setErrors(prev => ({ ...prev, comment: '' }));
          }}
          rows={4}
          maxLength={1000}
          placeholder={t('comment_placeholder')}
          error={errors.comment}
        />
        <div className="mt-1 text-right text-xs text-[var(--color-surfaceTextSecondary)]">
          {comment.length}/1000
        </div>
      </div>

      {/* Photo Upload */}
      <PhotoUpload
        photos={photoUrls}
        onChange={setPhotoUrls}
        maxPhotos={5}
      />

      {/* Privacy Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--color-surfaceTextSecondary)]">
            {t('public')}
          </label>
          <ToggleButton
            checked={isPublic}
            onChange={setIsPublic}
            className="public-toggle"
          />
        </div>
        <p className="text-xs text-[var(--color-surfaceTextSecondary)]">
          {t('public_description')}
        </p>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--color-surfaceTextSecondary)]">
            {t('anonymous')}
          </label>
          <ToggleButton
            checked={anonymous}
            onChange={setAnonymous}
            className="anonymous-toggle"
          />
        </div>
        <p className="text-xs text-[var(--color-surfaceTextSecondary)]">
          {t('anonymous_description')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          loading={isLoading}
          disabled={!rating}
        >
          {t('submit')}
        </Button>
      </div>
    </form>
  );
}

