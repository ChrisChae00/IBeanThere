'use client';

import { useTranslations } from 'next-intl';
import { UserResponse } from '@/types/api';
import { Modal } from '@/shared/ui';
import ProfileEditForm from './ProfileEditForm';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserResponse;
  onSave: (saved: UserResponse) => void;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileEditModalProps) {
  const t = useTranslations('profile');

  const handleSave = (saved: UserResponse) => {
    onSave(saved);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('edit_profile')} size="md">
      <ProfileEditForm profile={profile} onSave={handleSave} onCancel={onClose} />
    </Modal>
  );
}
