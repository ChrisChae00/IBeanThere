'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CoffeeLog } from '@/types/api';
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
    <div className="bg-[var(--color-cardBackground)] rounded-lg p-4 space-y-3 border border-[var(--color-border)]">
      {/* Cafe Name */}
      {cafe && (
        <div className="pb-2 border-b border-[var(--color-border)]">
          {cafePath ? (
            <Link
              href={cafePath}
              className="text-base font-semibold text-[var(--color-text)] hover:text-[var(--color-secondary)] transition-colors"
            >
              {cafe.name}
            </Link>
          ) : (
            <p className="text-base font-semibold text-[var(--color-text)]">
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
            <p className="text-sm font-medium text-[var(--color-text)]">
              {log.anonymous ? t('anonymous') : (log.author_display_name || 'User')}
            </p>
            <p className="text-xs text-[var(--color-textSecondary)]">
              {formatRelativeDate(log.visited_at)}
            </p>
          </div>
        </div>
        {isOwner && (onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(log)}
                className="text-sm text-[var(--color-text)] hover:text-[var(--color-secondary)] hover:underline transition-colors"
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
        <div>
          <StarRating rating={log.rating} size="sm" />
        </div>
      )}

      {/* Coffee Type */}
      {log.coffee_type && (
        <div>
          <span className="inline-block px-2 py-1 text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
            {log.coffee_type}
          </span>
        </div>
      )}

      {/* Comment */}
      {log.comment && (
        <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">
          {log.comment}
        </p>
      )}

      {/* Photos */}
      {log.photo_urls && log.photo_urls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
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
    </div>
  );
}

