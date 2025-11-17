'use client';

import { useTranslations } from 'next-intl';
import { CoffeeLog } from '@/types/api';
import StarRating from '@/components/ui/StarRating';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';

interface CoffeeLogCardProps {
  log: CoffeeLog;
  onEdit?: (log: CoffeeLog) => void;
  onDelete?: (logId: string) => void;
}

export default function CoffeeLogCard({ log, onEdit, onDelete }: CoffeeLogCardProps) {
  const t = useTranslations('cafe.log');
  const { user } = useAuth();
  const isOwner = user?.id === log.user_id;

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

  return (
    <div className="bg-[var(--color-cardBackground)] rounded-lg p-4 space-y-3 border border-[var(--color-border)]">
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
                className="text-sm text-[var(--color-primary)] hover:underline"
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
        <p className="text-sm text-[var(--color-cardText)] whitespace-pre-wrap">
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

