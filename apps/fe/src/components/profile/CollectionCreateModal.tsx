'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, LoadingSpinner } from '@/shared/ui';

interface CollectionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

/**
 * Modal for creating a new collection.
 */
export default function CollectionCreateModal({
  isOpen,
  onClose,
  onCreate,
}: CollectionCreateModalProps) {
  const t = useTranslations('collections');

  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      await onCreate(name.trim());
      setName('');
    } catch (err) {
      setError(t('create_failed'));
    } finally {
      setIsCreating(false);
    }
  }, [name, isCreating, onCreate, t]);

  const handleClose = useCallback(() => {
    setName('');
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('create_new')}>
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-cardText)] mb-1">
            {t('collection_name_placeholder')}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('collection_name_placeholder')}
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-cardText)] placeholder-[var(--color-textSecondary)]"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') handleClose();
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-secondary)] disabled:opacity-50 transition-colors"
          >
            {isCreating ? <LoadingSpinner size="sm" /> : t('create')}
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-cardText)]"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
