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
}

export default function CoffeeLogCard({ log, onEdit, onDelete, cafeName }: CoffeeLogCardProps) {
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
  
  const hasAdvancedData = Boolean(
    log.dessert || log.price || log.bean_origin || log.processing_method || 
    log.roast_level || log.extraction_method || log.extraction_equipment || 
    log.aroma_rating || log.wifi_quality || log.wifi_rating || log.outlet_info ||
    log.furniture_comfort || log.noise_level || log.noise_rating || 
    log.temperature_lighting || log.facilities_info
  );

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

  return (
    <Card>
      {/* Cafe Name */}
      {cafe && (
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

      {/* Rating */}
      {log.rating && (
        <div className="inline-flex items-center gap-2 px-2 py-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <StarRating rating={log.rating} size="sm" textColor="surface" />
        </div>
      )}

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

      {/* Coffee Type */}
      {log.coffee_type && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-[var(--color-surface)] text-[var(--color-surfaceText)] rounded-full border border-[var(--color-border)]">
            {log.coffee_type}
          </span>
        </div>
      )}

      {/* Basic Info: Dessert & Price */}
      {(log.dessert || log.price) && (
        <div className="flex flex-wrap gap-2 mb-2">
          {log.dessert && (
            <span className="text-xs text-[var(--color-cardTextSecondary)]">
              {t('dessert')}: {log.dessert}
            </span>
          )}
          {log.price && (
            <span className="text-xs text-[var(--color-cardTextSecondary)]">
              {t('price')}: {log.price}
            </span>
          )}
        </div>
      )}

      {/* Comment */}
      {log.comment && (
        <p className="text-sm text-[var(--color-cardText)] whitespace-pre-wrap mb-4">
          {log.comment}
        </p>
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
                log.extraction_method || log.extraction_equipment || log.aroma_rating ||
                log.acidity_rating || log.sweetness_rating || log.bitterness_rating ||
                log.body_rating || log.aftertaste_rating) && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-[var(--color-cardText)]">{t('coffee_taste_advanced')}</h5>
                  <div className="space-y-1 text-[var(--color-cardTextSecondary)] pl-2">
                    {log.bean_origin && <div>{t('bean_origin')}: {log.bean_origin}</div>}
                    {log.processing_method && <div>{t('processing_method')}: {log.processing_method}</div>}
                    {log.roast_level && <div>{t('roast_level')}: {log.roast_level}</div>}
                    {log.extraction_method && <div>{t('extraction_method')}: {log.extraction_method}</div>}
                    {log.extraction_equipment && <div>{t('extraction_equipment')}: {log.extraction_equipment}</div>}
                    {log.aroma_rating && <div>{t('aroma')}: {log.aroma_rating}/10</div>}
                    {log.acidity_rating && <div>{t('acidity')}: {log.acidity_rating}/10</div>}
                    {log.sweetness_rating && <div>{t('sweetness')}: {log.sweetness_rating}/10</div>}
                    {log.bitterness_rating && <div>{t('bitterness')}: {log.bitterness_rating}/10</div>}
                    {log.body_rating && <div>{t('body')}: {log.body_rating}/10</div>}
                    {log.aftertaste_rating && <div>{t('aftertaste')}: {log.aftertaste_rating}/10</div>}
                  </div>
                </div>
              )}

              {/* Space & Work Environment */}
              {(log.wifi_quality || log.wifi_rating || log.outlet_info ||
                log.furniture_comfort || log.noise_level || log.noise_rating ||
                log.temperature_lighting || log.facilities_info) && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-[var(--color-cardText)]">{t('space_work_environment')}</h5>
                  <div className="space-y-1 text-[var(--color-cardTextSecondary)] pl-2">
                    {log.wifi_rating && <div>{t('wifi_rating')}: {log.wifi_rating}/5</div>}
                    {log.wifi_quality && <div>{t('wifi_quality')}: {log.wifi_quality}</div>}
                    {log.outlet_info && <div>{t('outlet_info')}: {log.outlet_info}</div>}
                    {log.furniture_comfort && <div>{t('furniture_comfort')}: {log.furniture_comfort}</div>}
                    {log.noise_rating && <div>{t('noise_rating')}: {log.noise_rating}/5</div>}
                    {log.noise_level && <div>{t('noise_level')}: {log.noise_level}</div>}
                    {log.temperature_lighting && <div>{t('temperature_lighting')}: {log.temperature_lighting}</div>}
                    {log.facilities_info && <div>{t('facilities_info')}: {log.facilities_info}</div>}
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

