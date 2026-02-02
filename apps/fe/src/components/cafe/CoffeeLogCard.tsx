'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CoffeeLog } from '@/types/api';
import { Card } from '@/components/ui';
import { StarRating, ImageLightbox } from '@/shared/ui';
import { Avatar } from '@/shared/ui';
import { useAuth } from '@/hooks/useAuth';
import { getCafeDetail } from '@/lib/api/cafes';
import { getCafePath } from '@/lib/utils/slug';

interface CoffeeLogCardProps {
  log: CoffeeLog;
  onEdit?: (log: CoffeeLog) => void;
  onDelete?: (logId: string) => void;
  cafeName?: string;
  hideCafeName?: boolean;
  hideUserInfo?: boolean;
}

export default function CoffeeLogCard({ log, onEdit, onDelete, cafeName, hideCafeName = false, hideUserInfo = false }: CoffeeLogCardProps) {
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const hasAdvancedData = (() => {
    // Check if outlet_info has actual data (could be JSON string)
    const hasOutletInfo = (() => {
      if (!log.outlet_info) return false;
      try {
        const parsed = JSON.parse(log.outlet_info);
        return parsed.availability || parsed.location || parsed.comment;
      } catch {
        return Boolean(log.outlet_info && log.outlet_info.trim());
      }
    })();
    
    // Check if parking_info has actual data (could be JSON string)
    const hasParkingInfo = (() => {
      if (!log.parking_info) return false;
      try {
        const parsed = JSON.parse(log.parking_info);
        return parsed.type;
      } catch {
        return Boolean(log.parking_info && log.parking_info.trim());
      }
    })();
    
    // Check Coffee & Taste data
    const hasCoffeeTasteData = Boolean(
      (log.bean_origin && log.bean_origin.trim()) ||
      (log.processing_method && log.processing_method.trim()) ||
      (log.roast_level && log.roast_level.trim()) ||
      (log.extraction_method && log.extraction_method.trim()) ||
      (log.extraction_equipment && log.extraction_equipment.trim()) ||
      (log.aroma_rating !== undefined && log.aroma_rating !== null) ||
      (log.acidity_rating !== undefined && log.acidity_rating !== null) ||
      (log.sweetness_rating !== undefined && log.sweetness_rating !== null) ||
      (log.bitterness_rating !== undefined && log.bitterness_rating !== null) ||
      (log.body_rating !== undefined && log.body_rating !== null) ||
      (log.aftertaste_rating !== undefined && log.aftertaste_rating !== null)
    );
    
    // Check Space & Work Environment data
    const hasSpaceWorkData = Boolean(
      (log.wifi_quality && log.wifi_quality.trim()) ||
      (log.wifi_rating !== undefined && log.wifi_rating !== null) ||
      hasOutletInfo ||
      (log.furniture_comfort && log.furniture_comfort.trim()) ||
      (log.noise_level && log.noise_level.trim()) ||
      (log.noise_rating !== undefined && log.noise_rating !== null) ||
      (log.temperature_lighting && log.temperature_lighting.trim()) ||
      hasParkingInfo
    );
    
    return hasCoffeeTasteData || hasSpaceWorkData;
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
      return date.toISOString().split('T')[0];
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
          {!hideUserInfo && (
            log.anonymous || !log.author_username ? (
              <>
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
              </>
            ) : (
              <>
                <Link href={`/${locale}/profile/${log.author_username}`}>
                  <Avatar
                    src={log.author_avatar_url}
                    alt={log.author_display_name || 'User'}
                    size="sm"
                    className="cursor-pointer hover:ring-2 hover:ring-[var(--color-primary)] transition-all"
                  />
                </Link>
                <div>
                  <Link 
                    href={`/${locale}/profile/${log.author_username}`}
                    className="text-sm font-medium text-[var(--color-cardText)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {log.author_display_name || 'User'}
                  </Link>
                  <p className="text-xs text-[var(--color-cardTextSecondary)]">
                    {formatRelativeDate(log.visited_at)}
                  </p>
                </div>
              </>
            )
          )}
          {hideUserInfo && (
            <p className="text-xs text-[var(--color-cardTextSecondary)]">
              {formatRelativeDate(log.visited_at)}
            </p>
          )}
        </div>        {isOwner && (onEdit || onDelete) && (
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
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-[var(--color-surface)] rounded-lg">
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
                    className="inline-block px-2 py-1 text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full border border-[var(--color-border)]"
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
            <button
              key={index}
              type="button"
              onClick={() => {
                setLightboxIndex(index);
                setLightboxOpen(true);
              }}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <img
                src={url}
                alt={`${t('photo')} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Coffee Type & Price */}
      {(log.coffee_type || log.price) && (
        <div className="flex items-center gap-3 mb-3">
          {log.coffee_type && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-lg">
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 142 96" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path d="M27.15 88.25 c-3.50 -1.50 -4.10 -6.45 -1.10 -8.95 l1.55 -1.30 45.45 0 c48.90 0 47.60 -0.05 48.95 2.45 1 1.95 0.60 4.90 -0.95 6.65 l-1.45 1.65 -45.45 0.10 c-38.30 0.10 -45.65 0 -47 -0.60z" fill="currentColor"/>
                <path d="M53.65 72 c-4.05 -0.85 -8.30 -3.65 -10.40 -7 -2.60 -4.15 -2.75 -5.55 -2.75 -27.80 0 -12.20 0.20 -21.15 0.50 -21.90 0.25 -0.70 1.20 -1.75 2.10 -2.30 1.60 -0.95 2.55 -1 35.40 -1 19 0 35 0.20 36.65 0.50 16.30 2.65 23.90 21.55 13.90 34.65 -4.25 5.60 -9.45 8.15 -17.70 8.75 l-5.10 0.35 -0.35 2.40 c-0.90 6.50 -6.45 12.10 -13.10 13.30 -3.50 0.65 -35.95 0.65 -39.15 0.05z m61.05 -27.55 c4.70 -1.20 7.80 -5.45 7.80 -10.80 0 -6.30 -5.05 -10.65 -12.30 -10.65 l-3.65 0 -0.15 10.80 c-0.10 5.95 -0.05 10.90 0.05 11 0.45 0.40 6.20 0.20 8.25 -0.35z" fill="currentColor"/>
              </svg>
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
              {(() => {
                const hasCoffeeTasteData = Boolean(
                  (log.bean_origin && log.bean_origin.trim()) ||
                  (log.processing_method && log.processing_method.trim()) ||
                  (log.roast_level && log.roast_level.trim()) ||
                  (log.extraction_method && log.extraction_method.trim()) ||
                  (log.extraction_equipment && log.extraction_equipment.trim()) ||
                  (log.aroma_rating !== undefined && log.aroma_rating !== null) ||
                  (log.acidity_rating !== undefined && log.acidity_rating !== null) ||
                  (log.sweetness_rating !== undefined && log.sweetness_rating !== null) ||
                  (log.bitterness_rating !== undefined && log.bitterness_rating !== null) ||
                  (log.body_rating !== undefined && log.body_rating !== null) ||
                  (log.aftertaste_rating !== undefined && log.aftertaste_rating !== null)
                );
                
                if (!hasCoffeeTasteData) return null;
                
                return (
                  <div className="space-y-2">
                    <h5 className="font-semibold text-[var(--color-cardText)]">{t('coffee_taste_advanced')}</h5>
                    <div className="space-y-1 text-[var(--color-cardTextSecondary)] pl-2">
                      {log.bean_origin && log.bean_origin.trim() && <div>{t('bean_origin')}: {log.bean_origin}</div>}
                      {log.processing_method && log.processing_method.trim() && <div>{t('processing_method')}: {log.processing_method}</div>}
                      {log.roast_level && log.roast_level.trim() && <div>{t('roast_level')}: {log.roast_level}</div>}
                      {log.extraction_method && log.extraction_method.trim() && <div>{t('extraction_method')}: {log.extraction_method}</div>}
                      {log.extraction_equipment && log.extraction_equipment.trim() && <div>{t('extraction_equipment')}: {log.extraction_equipment}</div>}
                      {log.aroma_rating !== undefined && log.aroma_rating !== null && <div>{t('aroma')}: {log.aroma_rating}/10</div>}
                      {log.acidity_rating !== undefined && log.acidity_rating !== null && <div>{t('acidity')}: {log.acidity_rating}/10</div>}
                      {log.sweetness_rating !== undefined && log.sweetness_rating !== null && <div>{t('sweetness')}: {log.sweetness_rating}/10</div>}
                      {log.bitterness_rating !== undefined && log.bitterness_rating !== null && <div>{t('bitterness')}: {log.bitterness_rating}/10</div>}
                      {log.body_rating !== undefined && log.body_rating !== null && <div>{t('body')}: {log.body_rating}/10</div>}
                      {log.aftertaste_rating !== undefined && log.aftertaste_rating !== null && <div>{t('aftertaste')}: {log.aftertaste_rating}/10</div>}
                    </div>
                  </div>
                );
              })()}

              {/* Space & Work Environment */}
              {(() => {
                // Check if outlet_info has actual data
                const hasOutletInfo = (() => {
                  if (!log.outlet_info) return false;
                  try {
                    const parsed = JSON.parse(log.outlet_info);
                    return parsed.availability || parsed.location || parsed.comment;
                  } catch {
                    return Boolean(log.outlet_info && log.outlet_info.trim());
                  }
                })();
                
                // Check if parking_info has actual data
                const hasParkingInfo = (() => {
                  if (!log.parking_info) return false;
                  try {
                    const parsed = JSON.parse(log.parking_info);
                    return parsed.type;
                  } catch {
                    return Boolean(log.parking_info && log.parking_info.trim());
                  }
                })();
                
                const hasSpaceWorkData = Boolean(
                  (log.wifi_quality && log.wifi_quality.trim()) ||
                  (log.wifi_rating !== undefined && log.wifi_rating !== null) ||
                  hasOutletInfo ||
                  (log.furniture_comfort && log.furniture_comfort.trim()) ||
                  (log.noise_level && log.noise_level.trim()) ||
                  (log.noise_rating !== undefined && log.noise_rating !== null) ||
                  (log.temperature_lighting && log.temperature_lighting.trim()) ||
                  hasParkingInfo
                );
                
                if (!hasSpaceWorkData) return null;
                
                return (
                  <div className="space-y-2">
                    <h5 className="font-semibold text-[var(--color-cardText)]">{t('space_work_environment')}</h5>
                    <div className="space-y-1 text-[var(--color-cardTextSecondary)] pl-2">
                      {log.wifi_rating !== undefined && log.wifi_rating !== null && <div>{t('wifi_rating')}: {log.wifi_rating}/5</div>}
                      {log.wifi_quality && log.wifi_quality.trim() && <div>{t('wifi_quality')}: {log.wifi_quality}</div>}
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
                          if (log.outlet_info && log.outlet_info.trim()) {
                            return <div>{t('outlet_info')}: {log.outlet_info}</div>;
                          }
                        }
                        return null;
                      })()}
                      {log.furniture_comfort && log.furniture_comfort.trim() && <div>{t('furniture_comfort')}: {log.furniture_comfort}</div>}
                      {log.noise_rating !== undefined && log.noise_rating !== null && <div>{t('noise_rating')}: {log.noise_rating}/5</div>}
                      {log.noise_level && log.noise_level.trim() && <div>{t('noise_level')}: {log.noise_level}</div>}
                      {log.temperature_lighting && log.temperature_lighting.trim() && <div>{t('temperature_lighting')}: {log.temperature_lighting}</div>}
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
                          if (log.parking_info && log.parking_info.trim()) {
                            return <div>{t('parking_availability')}: {log.parking_info}</div>;
                          }
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Photo Lightbox */}
      {log.photo_urls && log.photo_urls.length > 0 && (
        <ImageLightbox
          images={log.photo_urls.map((url, index) => ({
            url,
            alt: `${t('photo')} ${index + 1}`
          }))}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </Card>
  );
}


