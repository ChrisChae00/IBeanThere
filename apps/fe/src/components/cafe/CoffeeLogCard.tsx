'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CoffeeLog } from '@/types/api';
import { Card } from '@/components/ui';
import StarRating from '@/components/ui/StarRating';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { getCafeDetail } from '@/lib/api/cafes';
import { getCafePath } from '@/lib/utils/slug';

interface CoffeeLogCardProps {
  log: CoffeeLog;
  onEdit?: (log: CoffeeLog) => void;
  onDelete?: (logId: string) => void;
  cafeName?: string;
  hideCafeName?: boolean;
}

export default function CoffeeLogCard({ log, onEdit, onDelete, cafeName, hideCafeName = false }: CoffeeLogCardProps) {
  const t = useTranslations('cafe.log');
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const isOwner = user?.id === log.user_id;
  const [cafe, setCafe] = useState<{ name: string; slug?: string } | null>(
    cafeName ? { name: cafeName } : null
  );
  const [isLoadingCafe, setIsLoadingCafe] = useState(!cafeName);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const hasAdvancedData = (() => {
    // Check if outlet_info has actual data (could be JSON string)
    const hasOutletInfo = (() => {
      if (!log.outlet_info) return false;
      try {
        const parsed = JSON.parse(log.outlet_info);
        return parsed.availability || parsed.location || parsed.comment;
      } catch {
        return Boolean(log.outlet_info);
      }
    })();
    
    // Check if parking_info has actual data (could be JSON string)
    const hasParkingInfo = (() => {
      if (!log.parking_info) return false;
      try {
        const parsed = JSON.parse(log.parking_info);
        return parsed.type;
      } catch {
        return Boolean(log.parking_info);
      }
    })();
    
    return Boolean(
      log.bean_origin || log.processing_method || 
      log.roast_level || log.extraction_method || log.extraction_equipment || 
      log.aroma_rating !== undefined || log.acidity_rating !== undefined || 
      log.sweetness_rating !== undefined || log.bitterness_rating !== undefined ||
      log.body_rating !== undefined || log.aftertaste_rating !== undefined ||
      log.wifi_quality || log.wifi_rating || hasOutletInfo ||
      log.furniture_comfort || log.noise_level || log.noise_rating || 
      log.temperature_lighting || hasParkingInfo
    );
  })();

  useEffect(() => {
    if (cafeName || !log.cafe_id) {
      if (cafeName) {
        setCafe({ name: cafeName });
        setIsLoadingCafe(false);
      }
      return;
    }

    const fetchCafe = async () => {
      try {
        setIsLoadingCafe(true);
        const cafeData = await getCafeDetail(log.cafe_id);
        setCafe({ name: cafeData.name, slug: cafeData.slug });
      } catch (error) {
        console.error('Failed to fetch cafe:', error);
        setCafe({ name: 'Unknown Cafe' });
      } finally {
        setIsLoadingCafe(false);
      }
    };

    fetchCafe();
  }, [log.cafe_id, cafeName]);

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return t('today');
    } else if (diffDays === 1) {
      return t('yesterday');
    } else if (diffDays < 7) {
      return t('days_ago', { count: diffDays });
    } else {
      return date.toLocaleDateString();
    }
  };

  const cafePath = cafe ? getCafePath({ id: log.cafe_id, slug: cafe.slug }, locale) : null;

  const formatPrice = (price: number | undefined, currency?: string) => {
    if (price === undefined || price === null) return null;
    
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'KRW': '₩',
      'EUR': '€',
      'JPY': '¥',
      'GBP': '£',
      'CNY': '¥',
      'AUD': '$',
      'CAD': '$'
    };
    
    // If currency is provided, use it
    if (currency && currencySymbols[currency]) {
      return `${currencySymbols[currency]}${price}`;
    }
    
    // If currency is provided but not in our list, use it as-is
    if (currency) {
      return `${currency} ${price}`;
    }
    
    // Default: use browser language to determine currency
    if (typeof window !== 'undefined') {
      const lang = navigator.language || navigator.languages?.[0] || 'en';
      let defaultCurrency = 'USD';
      
      if (lang.startsWith('en-CA')) defaultCurrency = 'CAD';
      else if (lang.startsWith('en-US')) defaultCurrency = 'USD';
      else if (lang.startsWith('ko')) defaultCurrency = 'KRW';
      else if (lang.startsWith('ja')) defaultCurrency = 'JPY';
      else if (lang.startsWith('zh-CN')) defaultCurrency = 'CNY';
      else if (lang.startsWith('en-GB')) defaultCurrency = 'GBP';
      else if (lang.startsWith('en-AU')) defaultCurrency = 'AUD';
      
      return `${currencySymbols[defaultCurrency]}${price}`;
    }
    
    // Fallback: just show the number
    return price.toString();
  };

  return (
    <Card>
      {/* Cafe Name */}
      {!hideCafeName && cafe && (
        <div className="pb-2 border-b border-[var(--color-border)]">
          {cafePath ? (
            <Link
              href={cafePath}
              className="text-base font-semibold text-[var(--color-cardText)] hover:text-[var(--color-secondary)] transition-colors"
            >
              {cafe.name}
            </Link>
          ) : (
            <p className="text-base font-semibold text-[var(--color-cardText)]">
              {isLoadingCafe ? 'Loading...' : cafe.name}
            </p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            alt={log.anonymous ? 'Anonymous' : (log.author_display_name || 'User')}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-[var(--color-cardText)]">
              {log.anonymous ? t('anonymous') : (log.author_display_name || 'User')}
            </p>
            <p className="text-xs text-[var(--color-cardTextSecondary)]">
              {formatRelativeDate(log.visited_at)}
            </p>
          </div>
        </div>
        {isOwner && (onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(log)}
                className="text-sm text-[var(--color-cardText)] hover:text-[var(--color-secondary)] hover:underline transition-colors"
              >
                {t('edit')}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(log.id)}
                className="text-sm text-[var(--color-error)] hover:underline"
              >
                {t('delete')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rating & Atmosphere Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {log.rating && (
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
            <StarRating rating={log.rating} size="sm" textColor="surface" />
          </div>
        )}
        {(() => {
          // Parse atmosphere_tags if it's a string (JSONB from database)
          let tags = log.atmosphere_tags;
          if (typeof tags === 'string') {
            try {
              tags = JSON.parse(tags);
            } catch {
              tags = [];
            }
          }
          if (Array.isArray(tags) && tags.length > 0) {
            return (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-1 text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full border border-[var(--color-primary)]/30"
                  >
                    {t(`atmosphere_${tag}`)}
                  </span>
                ))}
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Photos */}
      {log.photo_urls && log.photo_urls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {log.photo_urls.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={url}
                alt={`${t('photo')} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Coffee Type & Price */}
      {(log.coffee_type || log.price) && (
        <div className="flex items-center gap-3 mb-3">
          {log.coffee_type && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-[var(--color-surface)] text-[var(--color-surfaceText)] rounded-full border border-[var(--color-border)]">
              {log.coffee_type}
            </span>
          )}
          {log.price !== undefined && log.price !== null && (
            <span className="text-sm font-medium text-[var(--color-cardText)]">
              {formatPrice(log.price, log.price_currency) ?? log.price}
            </span>
          )}
        </div>
      )}

      {/* Dessert */}
      {log.dessert && (
        <div className="mb-3">
          <span className="text-xs text-[var(--color-cardTextSecondary)]">
            {t('dessert')}: {log.dessert}
          </span>
        </div>
      )}

      {/* Comment */}
      {log.comment && (
        <div className="mb-4 p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-cardText)] whitespace-pre-wrap">
            {log.comment}
          </p>
        </div>
      )}

      {/* Advanced Logging Section */}
      {hasAdvancedData && (
        <div className="border-t border-[var(--color-border)] pt-4 mt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-sm text-[var(--color-cardTextSecondary)] hover:text-[var(--color-cardText)] transition-colors"
            aria-expanded={showAdvanced}
          >
            <span>{t('detailed_review')}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4 text-sm">
              {/* Coffee & Taste Advanced */}
              {(log.bean_origin || log.processing_method || log.roast_level || 
                log.extraction_method || log.extraction_equipment || 
                log.aroma_rating !== undefined || log.acidity_rating !== undefined || 
                log.sweetness_rating !== undefined || log.bitterness_rating !== undefined ||
                log.body_rating !== undefined || log.aftertaste_rating !== undefined) && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-[var(--color-cardText)]">{t('coffee_taste_advanced')}</h5>
                  <div className="space-y-1 text-[var(--color-cardTextSecondary)] pl-2">
                    {log.bean_origin && <div>{t('bean_origin')}: {log.bean_origin}</div>}
                    {log.processing_method && <div>{t('processing_method')}: {log.processing_method}</div>}
                    {log.roast_level && <div>{t('roast_level')}: {log.roast_level}</div>}
                    {log.extraction_method && <div>{t('extraction_method')}: {log.extraction_method}</div>}
                    {log.extraction_equipment && <div>{t('extraction_equipment')}: {log.extraction_equipment}</div>}
                    {log.aroma_rating !== undefined && log.aroma_rating !== null && <div>{t('aroma')}: {log.aroma_rating}/10</div>}
                    {log.acidity_rating !== undefined && log.acidity_rating !== null && <div>{t('acidity')}: {log.acidity_rating}/10</div>}
                    {log.sweetness_rating !== undefined && log.sweetness_rating !== null && <div>{t('sweetness')}: {log.sweetness_rating}/10</div>}
                    {log.bitterness_rating !== undefined && log.bitterness_rating !== null && <div>{t('bitterness')}: {log.bitterness_rating}/10</div>}
                    {log.body_rating !== undefined && log.body_rating !== null && <div>{t('body')}: {log.body_rating}/10</div>}
                    {log.aftertaste_rating !== undefined && log.aftertaste_rating !== null && <div>{t('aftertaste')}: {log.aftertaste_rating}/10</div>}
                  </div>
                </div>
              )}

              {/* Space & Work Environment */}
              {(() => {
                // Check if outlet_info has actual data
                const hasOutletInfo = (() => {
                  if (!log.outlet_info) return false;
                  try {
                    const parsed = JSON.parse(log.outlet_info);
                    return parsed.availability || parsed.location || parsed.comment;
                  } catch {
                    return Boolean(log.outlet_info);
                  }
                })();
                
                // Check if parking_info has actual data
                const hasParkingInfo = (() => {
                  if (!log.parking_info) return false;
                  try {
                    const parsed = JSON.parse(log.parking_info);
                    return parsed.type;
                  } catch {
                    return Boolean(log.parking_info);
                  }
                })();
                
                return Boolean(
                  log.wifi_quality || log.wifi_rating || hasOutletInfo ||
                  log.furniture_comfort || log.noise_level || log.noise_rating ||
                  log.temperature_lighting || hasParkingInfo
                );
              })() && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-[var(--color-cardText)]">{t('space_work_environment')}</h5>
                  <div className="space-y-1 text-[var(--color-cardTextSecondary)] pl-2">
                    {log.wifi_rating && <div>{t('wifi_rating')}: {log.wifi_rating}/5</div>}
                    {log.wifi_quality && <div>{t('wifi_quality')}: {log.wifi_quality}</div>}
                    {log.outlet_info && (() => {
                      try {
                        const outlet = JSON.parse(log.outlet_info);
                        if (outlet.availability) {
                          const availabilityLabel = t(`outlet_availability_${outlet.availability}`);
                          const locationLabel = outlet.location ? ` - ${t(`outlet_location_${outlet.location}`)}` : '';
                          const commentLabel = outlet.comment ? ` (${outlet.comment})` : '';
                          return <div>{t('outlet_info')}: {availabilityLabel}{locationLabel}{commentLabel}</div>;
                        }
                      } catch {
                        // Legacy format: just display as-is
                        return <div>{t('outlet_info')}: {log.outlet_info}</div>;
                      }
                      return null;
                    })()}
                    {log.furniture_comfort && <div>{t('furniture_comfort')}: {log.furniture_comfort}</div>}
                    {log.noise_rating && <div>{t('noise_rating')}: {log.noise_rating}/5</div>}
                    {log.noise_level && <div>{t('noise_level')}: {log.noise_level}</div>}
                    {log.temperature_lighting && <div>{t('temperature_lighting')}: {log.temperature_lighting}</div>}
                    {log.parking_info && (() => {
                      try {
                        const parking = JSON.parse(log.parking_info);
                        if (parking.type) {
                          const typeLabel = t(`parking_type_${parking.type}`);
                          const paidLabel = parking.paid ? ` (${t('parking_paid')})` : '';
                          const commentLabel = parking.comment ? ` - ${parking.comment}` : '';
                          return <div>{t('parking_availability')}: {typeLabel}{paidLabel}{commentLabel}</div>;
                        }
                      } catch {
                        // Legacy format: just display as-is
                        return <div>{t('parking_availability')}: {log.parking_info}</div>;
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

