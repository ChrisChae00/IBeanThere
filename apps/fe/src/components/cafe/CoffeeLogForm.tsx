'use client';

import { useState } from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import { useTranslations } from 'next-intl';
import { LogFormData, CoffeeLog } from '@/types/api';
import { Button, Input, PhotoUpload, StarRating } from '@/shared/ui';
import { useAuth } from '@/hooks/useAuth';
import AdvancedCoffeeSection from './logging/AdvancedCoffeeSection';
import BeanPicker, { BeanSelection, EMPTY_SELECTION } from './logging/BeanPicker';

/*
  One screen, two things a person can record here: a cup they drank, or a bag they
  bought. The mode is the first control because it changes what the rest of the form
  is asking for -- a drink wants a rating, a purchase wants to know which bean.

  What is visible without expanding is what the app actually wants back: photo,
  the one required field for the chosen mode, would-you-again, and who can see it.
  Everything else is behind "add details", because a form that asks eleven questions
  to record one coffee gets abandoned at the fourth.
*/

interface CoffeeLogFormProps {
  initialData?: CoffeeLog;
  onSubmit: (data: LogFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const COFFEE_TYPES = [
  'Espresso', 'Americano', 'Latte', 'Cappuccino', 'Macchiato',
  'Cortado', 'Mocha', 'Flat White', 'Cold Brew', 'Iced Coffee', 'Other',
];

const CURRENCIES = ['CAD', 'USD', 'KRW', 'EUR', 'JPY', 'GBP', 'CNY', 'AUD'];

const ATMOSPHERE_TAGS = [
  'cozy', 'modern', 'minimalist', 'casual',
  'industrial', 'vintage', 'bright', 'spacious', 'artistic',
];

function defaultCurrency() {
  if (typeof window === 'undefined') return 'CAD';
  const lang = navigator.language || navigator.languages?.[0] || 'en';
  if (lang.startsWith('en-US')) return 'USD';
  if (lang.startsWith('ko')) return 'KRW';
  if (lang.startsWith('ja')) return 'JPY';
  if (lang.startsWith('zh-CN')) return 'CNY';
  if (lang.startsWith('en-GB')) return 'GBP';
  if (lang.startsWith('en-AU')) return 'AUD';
  return 'CAD';
}

/* Three states of one decision, not two independent switches. Two toggles let a
   reader set "not public" and "anonymous" together and then wonder which won. */
type Visibility = 'public' | 'anonymous' | 'private';

function visibilityOf(log?: CoffeeLog): Visibility {
  if (!log) return 'public';
  if (!log.is_public) return 'private';
  return log.anonymous ? 'anonymous' : 'public';
}

function Segmented<T extends string>({ value, options, onChange, label }: {
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full -space-x-px">
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
          className={`control-flat min-h-11 flex-1 px-3 text-sm ${
            index === 0 ? 'rounded-l-(--radius-pill)' : ''
          } ${index === options.length - 1 ? 'rounded-r-(--radius-pill)' : ''} ${
            value === option.id ? 'is-active' : ''
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function CoffeeLogForm({ initialData, onSubmit, onCancel, isLoading }: CoffeeLogFormProps) {
  const t = useTranslations('cafe.log');
  const { user } = useAuth();

  const [mode, setMode] = useState<'drink' | 'purchase'>(initialData?.mode || 'drink');
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialData?.photo_urls || []);
  const [coffeeType, setCoffeeType] = useState(initialData?.coffee_type || '');
  const [wantAgain, setWantAgain] = useState<boolean | undefined>(initialData?.want_again ?? undefined);
  const [visibility, setVisibility] = useState<Visibility>(visibilityOf(initialData));

  const [bean, setBean] = useState<BeanSelection>(() =>
    initialData?.bean
      ? {
          roaster: initialData.bean.roaster_name
            ? { id: '', name: initialData.bean.roaster_name }
            : null,
          bean: initialData.bean,
          beanText: '',
        }
      : { ...EMPTY_SELECTION, beanText: initialData?.bean_name_raw || '' }
  );

  const [comment, setComment] = useState(initialData?.comment || '');
  const [dessert, setDessert] = useState(initialData?.dessert || '');
  const [atmosphereTags, setAtmosphereTags] = useState<string[]>(initialData?.atmosphere_tags || []);
  const [price, setPrice] = useState<number | undefined>(initialData?.price);
  const [priceCurrency, setPriceCurrency] = useState<string>(initialData?.price_currency || defaultCurrency);

  const [overallTasteRating, setOverallTasteRating] = useState<number | undefined>(initialData?.overall_taste_rating);
  const [aromaRating, setAromaRating] = useState<number | undefined>(initialData?.aroma_rating);
  const [acidityRating, setAcidityRating] = useState<number | undefined>(initialData?.acidity_rating);
  const [bodyRating, setBodyRating] = useState<number | undefined>(initialData?.body_rating);
  const [sweetnessRating, setSweetnessRating] = useState<number | undefined>(initialData?.sweetness_rating);
  const [bitternessRating, setBitternessRating] = useState<number | undefined>(initialData?.bitterness_rating);
  const [aftertasteRating, setAftertasteRating] = useState<number | undefined>(initialData?.aftertaste_rating);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) =>
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: Record<string, string> = {};
    if (mode === 'drink' && !rating) newErrors.rating = t('rating_required');
    if (comment.length > 1000) newErrors.comment = t('comment_too_long');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const linkedBeanId = bean.bean && 'id' in bean.bean && bean.bean.id ? bean.bean.id : null;

    try {
      await onSubmit({
        mode,
        rating: rating || undefined,
        photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        coffee_type: coffeeType || undefined,
        want_again: wantAgain,
        is_public: visibility !== 'private',
        anonymous: visibility === 'anonymous',
        /* Explicit null so clearing the picker actually unlinks: leaving the key
           out means "keep what is stored", which is the opposite instruction. */
        bean_id: linkedBeanId,
        bean_name_raw: linkedBeanId ? undefined : bean.beanText.trim() || undefined,
        comment: comment.trim() || undefined,
        dessert: dessert.trim() || undefined,
        atmosphere_tags: atmosphereTags.length > 0 ? atmosphereTags : undefined,
        price: price || undefined,
        price_currency: price ? priceCurrency : undefined,
        overall_taste_rating: overallTasteRating,
        aroma_rating: aromaRating,
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

  const priceField = (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink-secondary" htmlFor="log-price">
        {t('price')} ({t('optional')})
      </label>
      <div className="flex gap-2">
        <select
          value={priceCurrency}
          onChange={(event) => setPriceCurrency(event.target.value)}
          aria-label={t('price_currency')}
          className="min-h-11 w-28 rounded-(--radius-control) border border-edge-rule bg-surface-raised px-3 text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
        <div className="flex-1">
          <Input
            id="log-price"
            type="number"
            value={price?.toString() || ''}
            onChange={(event) => setPrice(event.target.value ? parseFloat(event.target.value) : undefined)}
            placeholder={t('price_placeholder')}
            min="0"
            step="0.01"
            aria-label={t('price')}
          />
        </div>
      </div>
    </div>
  );

  const commentField = (
    <div>
      <Input
        multiline
        label={`${t('comment')} (${t('optional')})`}
        value={comment}
        onChange={(event) => {
          setComment(event.target.value);
          clearError('comment');
        }}
        rows={4}
        maxLength={1000}
        placeholder={t('comment_placeholder')}
        error={errors.comment}
        aria-label={t('comment')}
      />
      <div className="mt-1 text-right text-xs text-ink-secondary">{comment.length}/1000</div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Segmented
        value={mode}
        label={t('mode')}
        onChange={(next) => {
          setMode(next);
          clearError('rating');
        }}
        options={[
          { id: 'drink', label: t('mode_drink') },
          { id: 'purchase', label: t('mode_purchase') },
        ]}
      />

      <PhotoUpload
        photos={photoUrls}
        onChange={setPhotoUrls}
        userId={user?.id || ''}
        maxPhotos={5}
      />

      {mode === 'drink' ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-secondary" htmlFor="log-coffee-type">
              {t('coffee_type')} ({t('optional')})
            </label>
            <input
              id="log-coffee-type"
              list="coffee-types"
              value={coffeeType}
              onChange={(event) => setCoffeeType(event.target.value)}
              placeholder={t('coffee_type_placeholder')}
              className="min-h-11 w-full rounded-(--radius-control) border border-edge-rule bg-surface-raised px-3 text-ink-primary placeholder:text-ink-secondary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
            />
            <datalist id="coffee-types">
              {COFFEE_TYPES.map((type) => <option key={type} value={type} />)}
            </datalist>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink-secondary">
              {t('rating')} <span className="text-state-danger">*</span>
            </label>
            <StarRating
              rating={rating}
              size="xl"
              onChange={(value) => {
                setRating(value);
                clearError('rating');
              }}
              label={t('rating')}
              starLabel={(value) => t('rate_n', { n: value })}
            />
            {errors.rating && <p className="mt-1 text-sm text-state-danger">{errors.rating}</p>}
          </div>
        </>
      ) : (
        /* Purchase puts the bean on the first screen. Which bag was bought is the
           whole content of the log -- burying it under "add details" is what made
           purchases go unrecorded. */
        <BeanPicker value={bean} onChange={setBean} />
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-ink-secondary">{t('want_again')}</label>
        <Segmented
          value={wantAgain === undefined ? 'unset' : wantAgain ? 'yes' : 'no'}
          label={t('want_again')}
          onChange={(next) => setWantAgain(next === 'unset' ? undefined : next === 'yes')}
          options={[
            { id: 'yes', label: t('want_again_yes') },
            { id: 'no', label: t('want_again_no') },
            { id: 'unset', label: t('want_again_unset') },
          ]}
        />
      </div>

      <Collapsible.Root>
        <Collapsible.Trigger className="control-flat min-h-11 w-full rounded-(--radius-control) px-4 text-sm">
          {t('add_details')}
        </Collapsible.Trigger>
        <Collapsible.Panel className="space-y-6 pt-6">
          {mode === 'drink' ? (
            <>
              <BeanPicker value={bean} onChange={setBean} />
              <AdvancedCoffeeSection
                overallTasteRating={overallTasteRating}
                onOverallTasteRatingChange={setOverallTasteRating}
                aromaRating={aromaRating}
                onAromaRatingChange={setAromaRating}
                acidityRating={acidityRating}
                onAcidityRatingChange={setAcidityRating}
                sweetnessRating={sweetnessRating}
                onSweetnessRatingChange={setSweetnessRating}
                bitternessRating={bitternessRating}
                onBitternessRatingChange={setBitternessRating}
                bodyRating={bodyRating}
                onBodyRatingChange={setBodyRating}
                aftertasteRating={aftertasteRating}
                onAftertasteRatingChange={setAftertasteRating}
              />
              {commentField}
              {priceField}
              <Input
                label={`${t('dessert')} (${t('optional')})`}
                value={dessert}
                onChange={(event) => setDessert(event.target.value)}
                placeholder={t('dessert_placeholder')}
                aria-label={t('dessert')}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-ink-secondary">
                  {t('atmosphere_tags')}{' '}
                  {atmosphereTags.length > 0 && (
                    <span className="text-xs text-ink-secondary">({atmosphereTags.length}/3)</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {ATMOSPHERE_TAGS.map((tag) => {
                    const selected = atmosphereTags.includes(tag);
                    const disabled = !selected && atmosphereTags.length >= 3;
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={disabled}
                        aria-pressed={selected}
                        onClick={() =>
                          setAtmosphereTags(
                            selected
                              ? atmosphereTags.filter((each) => each !== tag)
                              : [...atmosphereTags, tag]
                          )
                        }
                        className={`control-flat min-h-11 rounded-(--radius-pill) px-3 text-sm ${selected ? 'is-active' : ''}`}
                      >
                        {t(`atmosphere_${tag}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-ink-secondary">
                  {t('rating')} ({t('optional')})
                </label>
                <StarRating
                  rating={rating}
                  size="xl"
                  onChange={setRating}
                  label={t('rating')}
                  starLabel={(value) => t('rate_n', { n: value })}
                />
              </div>
              {commentField}
              {priceField}
            </>
          )}
        </Collapsible.Panel>
      </Collapsible.Root>

      {/* Directly above Save, because the default is public and nobody should find
          that out after pressing it. */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink-secondary">{t('visibility')}</label>
        <Segmented
          value={visibility}
          label={t('visibility')}
          onChange={setVisibility}
          options={[
            { id: 'public', label: t('visibility_public') },
            { id: 'anonymous', label: t('visibility_anonymous') },
            { id: 'private', label: t('visibility_private') },
          ]}
        />
        <p className="landing-micro text-ink-secondary">{t(`visibility_${visibility}_note`)}</p>
      </div>

      {!initialData && <p className="landing-micro text-ink-secondary">{t('bean_drop_note')}</p>}

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline" className="flex-1" disabled={isLoading}>
            {t('cancel')}
          </Button>
        )}
        <Button type="submit" className="flex-1" loading={isLoading}>
          {t('submit')}
        </Button>
      </div>
    </form>
  );
}
