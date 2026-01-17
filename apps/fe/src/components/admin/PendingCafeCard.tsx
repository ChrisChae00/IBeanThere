'use client';

import { useState } from 'react';
import { PendingCafe } from '@/lib/api/admin';
import { useTranslations } from 'next-intl';
import { Card, Badge, Button } from '@/components/ui';
import { BusinessHours } from '@/types/map';
import OpeningHoursInput from '@/components/cafe/OpeningHoursInput';

interface PendingCafeCardProps {
  cafe: PendingCafe;
  onVerify: (cafeId: string) => void;
  onDelete: (cafeId: string) => void;
  onEdit: (cafeId: string, data: EditCafeData) => void;
  isVerifying?: boolean;
  isDeleting?: boolean;
  isEditing?: boolean;
}

export interface EditCafeData {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  business_hours?: BusinessHours;
}

export default function PendingCafeCard({
  cafe,
  onVerify,
  onDelete,
  onEdit,
  isVerifying = false,
  isDeleting = false,
  isEditing = false,
}: PendingCafeCardProps) {
  const t = useTranslations('admin');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<EditCafeData>({
    name: cafe.name,
    address: cafe.address || '',
    phone: cafe.phone || '',
    website: cafe.website || '',
    description: cafe.description || '',
    business_hours: cafe.business_hours,
  });

  const handleEditSubmit = () => {
    onEdit(cafe.id, editData);
    setShowEditModal(false);
  };

  return (
    <>
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
            onClick={() => setShowEditModal(true)}
            disabled={isVerifying || isDeleting}
            variant="secondary"
            className="flex-1"
          >
            {t('edit')}
          </Button>
          <Button
            onClick={() => onVerify(cafe.id)}
            disabled={isDeleting || isEditing}
            loading={isVerifying}
            className="flex-1"
          >
            {t('verify')}
          </Button>
          <Button
            onClick={() => onDelete(cafe.id)}
            disabled={isVerifying || isEditing}
            loading={isDeleting}
            variant="danger"
            className="flex-1"
          >
            {t('delete')}
          </Button>
        </div>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg p-6 max-w-lg w-full border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              {t('edit_cafe_title')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  {t('cafe_name')}
                </label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  {t('address')}
                </label>
                <input
                  type="text"
                  value={editData.address || ''}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  {t('phone')}
                </label>
                <input
                  type="text"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  {t('website')}
                </label>
                <input
                  type="text"
                  value={editData.website || ''}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                />
              </div>
              
              {/* Opening Hours */}
              <OpeningHoursInput
                value={editData.business_hours}
                onChange={(hours) => setEditData({ ...editData, business_hours: hours })}
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="secondary"
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleEditSubmit}
                loading={isEditing}
                className="flex-1"
              >
                {t('save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
