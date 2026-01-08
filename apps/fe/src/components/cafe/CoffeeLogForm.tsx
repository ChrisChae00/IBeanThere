'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LogFormData, CoffeeLog } from '@/types/api';
import { ToggleButton } from '@/shared/ui';
import { Button } from '@/components/ui';
import BasicLoggingSection from './logging/BasicLoggingSection';
import AdvancedCoffeeSection from './logging/AdvancedCoffeeSection';
import AdvancedSpaceSection from './logging/AdvancedSpaceSection';

interface CoffeeLogFormProps {
  initialData?: CoffeeLog;
  onSubmit: (data: LogFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function CoffeeLogForm({ initialData, onSubmit, onCancel, isLoading }: CoffeeLogFormProps) {
  const t = useTranslations('cafe.log');
  
  // Basic logging state
  const [rating, setRating] = useState<number | undefined>(initialData?.rating);
  const [atmosphereTags, setAtmosphereTags] = useState<string[]>(initialData?.atmosphere_tags || []);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialData?.photo_urls || []);
  const [coffeeType, setCoffeeType] = useState(initialData?.coffee_type || '');
  const [dessert, setDessert] = useState(initialData?.dessert || '');
  const [price, setPrice] = useState<number | undefined>(initialData?.price);
  const [priceCurrency, setPriceCurrency] = useState<string>(() => {
    // Use initial data if available
    if (initialData?.price_currency) {
      return initialData.price_currency;
    }
    
    // Browser language-based default currency
    if (typeof window === 'undefined') return 'CAD'; // SSR fallback
    
    const lang = navigator.language || navigator.languages?.[0] || 'en';
    
    if (lang.startsWith('en-CA')) return 'CAD';
    if (lang.startsWith('en-US')) return 'USD';
    if (lang.startsWith('ko')) return 'KRW';
    if (lang.startsWith('ja')) return 'JPY';
    if (lang.startsWith('zh-CN')) return 'CNY';
    if (lang.startsWith('en-GB')) return 'GBP';
    if (lang.startsWith('en-AU')) return 'AUD';
    
    // Default to CAD for North America focus
    return 'CAD';
  });
  
  // Privacy settings
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const [anonymous, setAnonymous] = useState(initialData?.anonymous ?? false);
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Advanced Coffee & Taste state
  const [beanOrigin, setBeanOrigin] = useState(initialData?.bean_origin || '');
  const [processingMethod, setProcessingMethod] = useState(initialData?.processing_method || '');
  const [roastLevel, setRoastLevel] = useState(initialData?.roast_level || '');
  const [extractionMethod, setExtractionMethod] = useState(initialData?.extraction_method || '');
  const [extractionEquipment, setExtractionEquipment] = useState(initialData?.extraction_equipment || '');
  const [aromaRating, setAromaRating] = useState<number | undefined>(initialData?.aroma_rating);
  const [acidityRating, setAcidityRating] = useState<number | undefined>(initialData?.acidity_rating);
  const [bodyRating, setBodyRating] = useState<number | undefined>(initialData?.body_rating);
  const [sweetnessRating, setSweetnessRating] = useState<number | undefined>(initialData?.sweetness_rating);
  const [bitternessRating, setBitternessRating] = useState<number | undefined>(initialData?.bitterness_rating);
  const [aftertasteRating, setAftertasteRating] = useState<number | undefined>(initialData?.aftertaste_rating);

  // Advanced Space & Work Environment state
  const [wifiQuality, setWifiQuality] = useState(initialData?.wifi_quality || '');
  const [wifiRating, setWifiRating] = useState<number | undefined>(initialData?.wifi_rating);
  const [wifiComment, setWifiComment] = useState('');
  const [furnitureComfort, setFurnitureComfort] = useState(initialData?.furniture_comfort || '');
  
  // Outlet info state (structured)
  const parseOutletInfo = (outletInfo?: string) => {
    if (!outletInfo) return { availability: '', location: '', comment: '' };
    try {
      const parsed = JSON.parse(outletInfo);
      return {
        availability: parsed.availability || '',
        location: parsed.location || '',
        comment: parsed.comment || ''
      };
    } catch {
      // Legacy format: just a string
      return { availability: '', location: '', comment: outletInfo };
    }
  };
  
  const initialOutlet = parseOutletInfo(initialData?.outlet_info);
  const [outletAvailability, setOutletAvailability] = useState<string>(initialOutlet.availability);
  const [outletLocation, setOutletLocation] = useState<string>(initialOutlet.location);
  const [outletComment, setOutletComment] = useState<string>(initialOutlet.comment);
  const [noiseLevel, setNoiseLevel] = useState(initialData?.noise_level || '');
  const [temperatureLighting, setTemperatureLighting] = useState(initialData?.temperature_lighting || '');
  
  // Parking info state (structured)
  const parseParkingInfo = (parkingInfo?: string) => {
    if (!parkingInfo) return { type: '', paid: false, comment: '' };
    try {
      const parsed = JSON.parse(parkingInfo);
      return {
        type: parsed.type || '',
        paid: parsed.paid || false,
        comment: parsed.comment || ''
      };
    } catch {
      // Legacy format: just a string
      return { type: '', paid: false, comment: parkingInfo };
    }
  };
  
  const initialParking = parseParkingInfo(initialData?.parking_info);
  const [parkingType, setParkingType] = useState<string>(initialParking.type);
  const [parkingPaid, setParkingPaid] = useState<boolean>(initialParking.paid);
  const [parkingComment, setParkingComment] = useState<string>(initialParking.comment);

  const handleErrorClear = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
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
        atmosphere_tags: atmosphereTags.length > 0 ? atmosphereTags : undefined,
        comment: comment.trim() || undefined,
        photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        is_public: isPublic,
        anonymous,
        coffee_type: coffeeType || undefined,
        dessert: dessert.trim() || undefined,
        price: price || undefined,
        price_currency: priceCurrency || undefined,
        bean_origin: beanOrigin.trim() || undefined,
        processing_method: processingMethod || undefined,
        roast_level: roastLevel || undefined,
        extraction_method: extractionMethod.trim() || undefined,
        extraction_equipment: extractionEquipment.trim() || undefined,
        aroma_rating: aromaRating,
        acidity_rating: acidityRating,
        body_rating: bodyRating,
        sweetness_rating: sweetnessRating,
        bitterness_rating: bitternessRating,
        aftertaste_rating: aftertasteRating,
        wifi_quality: wifiQuality.trim() || undefined,
        wifi_rating: wifiRating,
        outlet_info: outletAvailability ? JSON.stringify({
          availability: outletAvailability,
          location: outletLocation || undefined,
          comment: outletComment.trim() || undefined
        }) : undefined,
        furniture_comfort: furnitureComfort.trim() || undefined,
        noise_level: noiseLevel || undefined,
        temperature_lighting: temperatureLighting.trim() || undefined,
        parking_info: parkingType ? JSON.stringify({
          type: parkingType,
          paid: parkingPaid,
          comment: parkingComment.trim() || undefined
        }) : undefined,
      });
    } catch (error) {
      console.error('Error submitting log:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Logging Section */}
      <BasicLoggingSection
        rating={rating}
        onRatingChange={setRating}
        atmosphereTags={atmosphereTags}
        onAtmosphereTagsChange={setAtmosphereTags}
        coffeeType={coffeeType}
        onCoffeeTypeChange={setCoffeeType}
        dessert={dessert}
        onDessertChange={setDessert}
        price={price}
        onPriceChange={setPrice}
        priceCurrency={priceCurrency}
        onPriceCurrencyChange={setPriceCurrency}
        comment={comment}
        onCommentChange={setComment}
        photoUrls={photoUrls}
        onPhotoUrlsChange={setPhotoUrls}
        errors={errors}
        onErrorClear={handleErrorClear}
      />

      {/* Advanced Coffee & Taste Section */}
      <AdvancedCoffeeSection
        beanOrigin={beanOrigin}
        onBeanOriginChange={setBeanOrigin}
        processingMethod={processingMethod}
        onProcessingMethodChange={setProcessingMethod}
        roastLevel={roastLevel}
        onRoastLevelChange={setRoastLevel}
        extractionMethod={extractionMethod}
        onExtractionMethodChange={setExtractionMethod}
        extractionEquipment={extractionEquipment}
        onExtractionEquipmentChange={setExtractionEquipment}
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

      {/* Advanced Space & Work Environment Section */}
      <AdvancedSpaceSection
        wifiQuality={wifiQuality}
        onWifiQualityChange={setWifiQuality}
        wifiRating={wifiRating}
        onWifiRatingChange={setWifiRating}
        wifiComment={wifiComment}
        onWifiCommentChange={setWifiComment}
        outletAvailability={outletAvailability}
        onOutletAvailabilityChange={setOutletAvailability}
        outletLocation={outletLocation}
        onOutletLocationChange={setOutletLocation}
        outletComment={outletComment}
        onOutletCommentChange={setOutletComment}
        furnitureComfort={furnitureComfort}
        onFurnitureComfortChange={setFurnitureComfort}
        noiseLevel={noiseLevel}
        onNoiseLevelChange={setNoiseLevel}
        temperatureLighting={temperatureLighting}
        onTemperatureLightingChange={setTemperatureLighting}
        parkingType={parkingType}
        onParkingTypeChange={setParkingType}
        parkingPaid={parkingPaid}
        onParkingPaidChange={setParkingPaid}
        parkingComment={parkingComment}
        onParkingCommentChange={setParkingComment}
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

      {/* Bean Drop Info Note */}
      {!initialData && (
        <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg border border-[var(--color-primary)]/20">
          <p className="text-sm text-[var(--color-primary)]">
            {t('bean_drop_note')}
          </p>
        </div>
      )}

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
