'use client';

import { useTranslations } from 'next-intl';
import { UserResponse } from '@/types/api';
import Modal from '@/components/ui/Modal';
import ProfileEditForm from './ProfileEditForm';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserResponse;
    onSave: () => void;
}

export default function ProfileEditModal({
    isOpen,
    onClose,
    profile,
    onSave,
}: ProfileEditModalProps) {
    const t = useTranslations('profile');

    const handleSave = () => {
        onSave();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('edit_profile')}
            size="md"
        >
            <ProfileEditForm
                profile={profile}
                onSave={handleSave}
                onCancel={onClose}
            />
        </Modal>
    );
}
