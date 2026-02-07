'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, LoadingSpinner } from '@/shared/ui';

interface CollectionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, isPublic: boolean) => Promise<void>;
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
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || isCreating) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      await onCreate(name.trim(), isPublic);
      setName('');
      setIsPublic(false);
    } catch (err) {
      setError(t('create_failed'));
    } finally {
      setIsCreating(false);
    }
  }, [name, isPublic, isCreating, onCreate, t]);

  const handleClose = useCallback(() => {
    setName('');
    setIsPublic(false);
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

        {/* Visibility Toggle */}
        <div className="p-3 bg-[var(--color-background)] rounded-lg">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-medium text-[var(--color-cardText)]">
                {isPublic ? t('visibility_public') : t('visibility_private')}
              </span>
              <p className="text-sm text-[var(--color-textSecondary)]">
                {t('visibility_hint')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
              }`}
            >
              <span 
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isPublic ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </label>
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
