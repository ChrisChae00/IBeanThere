'use client';

import { PendingCafe } from '@/lib/api/admin';
import { useTranslations } from 'next-intl';
import { Card, Badge, Button } from '@/components/ui';

interface PendingCafeCardProps {
  cafe: PendingCafe;
  onVerify: (cafeId: string) => void;
  onDelete: (cafeId: string) => void;
  isVerifying?: boolean;
  isDeleting?: boolean;
}

export default function PendingCafeCard({
  cafe,
  onVerify,
  onDelete,
  isVerifying = false,
  isDeleting = false,
}: PendingCafeCardProps) {
  const t = useTranslations('admin');

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
            {cafe.name}
          </h3>
          {cafe.address && (
            <p className="text-[var(--color-textSecondary)] text-sm mb-2">
              {cafe.address}
            </p>
          )}
          <div className="flex gap-4 text-sm text-[var(--color-textSecondary)]">
            <span>
              {t('verification_count')}: {cafe.verification_count}
            </span>
            <span>
              {t('created_at')}: {new Date(cafe.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
        <Badge variant="warning" size="sm">
          {t('pending')}
        </Badge>
      </div>

      {(cafe.phone || cafe.website || cafe.description) && (
        <div className="mb-4 space-y-2 text-sm text-[var(--color-textSecondary)]">
          {cafe.phone && (
            <p>
              <span className="font-medium">{t('phone')}:</span> {cafe.phone}
            </p>
          )}
          {cafe.website && (
            <p>
              <span className="font-medium">{t('website')}:</span>{' '}
              <a
                href={cafe.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline"
              >
                {cafe.website}
              </a>
            </p>
          )}
          {cafe.description && (
            <p>
              <span className="font-medium">{t('description')}:</span>{' '}
              {cafe.description}
            </p>
          )}
        </div>
      )}

      {cafe.navigator_id && (
        <div className="mb-4 p-3 bg-[var(--color-primary)]/10 rounded-lg">
          <p className="text-sm font-medium text-[var(--color-primary)] mb-1">
            {t('founding_crew')}
          </p>
          <p className="text-xs text-[var(--color-textSecondary)]">
            {t('navigator')}: {cafe.navigator_id.slice(0, 8)}...
          </p>
          {cafe.vanguard_ids && cafe.vanguard_ids.length > 0 && (
            <p className="text-xs text-[var(--color-textSecondary)]">
              {t('vanguards')}: {cafe.vanguard_ids.length}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button
          onClick={() => onVerify(cafe.id)}
          disabled={isDeleting}
          loading={isVerifying}
          className="flex-1"
        >
          {t('verify')}
        </Button>
        <Button
          onClick={() => onDelete(cafe.id)}
          disabled={isVerifying}
          loading={isDeleting}
          variant="danger"
          className="flex-1"
        >
          {t('delete')}
        </Button>
      </div>
    </Card>
  );
}

