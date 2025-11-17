'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { LogFormData, CoffeeLog } from '@/types/api';
import StarRating from '@/components/ui/StarRating';
import PhotoUpload from '@/components/ui/PhotoUpload';
import ToggleButton from '@/components/ui/ToggleButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
      });
    } catch (error) {
      console.error('Error submitting log:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-cardTextSecondary)] mb-2">
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
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating && (
            <span className="text-sm text-[var(--color-cardTextSecondary)] ml-2">
              {rating}/5
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="text-sm text-[var(--color-error)] mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Coffee Type */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-cardTextSecondary)] mb-2">
          {t('coffee_type')} ({t('optional')})
        </label>
        <select
          value={coffeeType}
          onChange={(e) => setCoffeeType(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value="">{t('select_coffee_type')}</option>
          {COFFEE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-cardTextSecondary)] mb-2">
          {t('comment')} ({t('optional')})
        </label>
        <textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setErrors(prev => ({ ...prev, comment: '' }));
          }}
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-cardBackground)] text-[var(--color-cardText)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          placeholder={t('comment_placeholder')}
        />
        <div className="flex justify-between mt-1">
          {errors.comment && (
            <p className="text-sm text-[var(--color-error)]">{errors.comment}</p>
          )}
          <p className="text-xs text-[var(--color-cardTextSecondary)] ml-auto">
            {comment.length}/1000
          </p>
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
          <label className="text-sm font-medium text-[var(--color-cardTextSecondary)]">
            {t('public')}
          </label>
          <ToggleButton
            checked={isPublic}
            onChange={setIsPublic}
            className="public-toggle"
          />
        </div>
        <p className="text-xs text-[var(--color-cardTextSecondary)]">
          {t('public_description')}
        </p>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--color-cardTextSecondary)]">
            {t('anonymous')}
          </label>
          <ToggleButton
            checked={anonymous}
            onChange={setAnonymous}
            className="anonymous-toggle"
          />
        </div>
        <p className="text-xs text-[var(--color-cardTextSecondary)]">
          {t('anonymous_description')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-cardText)] hover:bg-[var(--color-surface)] transition-colors"
            disabled={isLoading}
          >
            {t('cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !rating}
          className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              {t('submitting')}
            </>
          ) : (
            t('submit')
          )}
        </button>
      </div>
    </form>
  );
}

