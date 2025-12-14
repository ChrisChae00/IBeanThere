'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { UserResponse, TasteTag } from '@/types/api';
import { createClient } from '@/lib/supabase/client';
import { uploadAvatar, validateImageFile } from '@/lib/supabase/storage';
import AvatarUpload from '../ui/AvatarUpload';
import TasteTagSelector from './TasteTagSelector';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ProfileEditFormProps {
  profile: UserResponse;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileEditForm({
  profile,
  onSave,
  onCancel,
}: ProfileEditFormProps) {
  const t = useTranslations('profile');
  
  // Form state
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [tasteTags, setTasteTags] = useState<TasteTag[]>(
    (profile.taste_tags as TasteTag[]) || []
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  
  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAvatarSelect = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || t('avatar_upload_error'));
      return;
    }
    
    setAvatarFile(file);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please sign in to update your profile');
        return;
      }
      
      let newAvatarUrl = avatarUrl;
      
      // Upload avatar if changed
      if (avatarFile) {
        setIsUploading(true);
        try {
          newAvatarUrl = await uploadAvatar(session.user.id, avatarFile);
          setAvatarUrl(newAvatarUrl);
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          setError(t('avatar_upload_error'));
          return;
        } finally {
          setIsUploading(false);
        }
      }
      
      // Update profile via API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            display_name: displayName,
            bio: bio || null,
            avatar_url: newAvatarUrl,
            taste_tags: tasteTags,
          }),
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update profile');
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  const isLoading = isUploading || isSaving;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex justify-center">
        <AvatarUpload
          currentAvatarUrl={avatarUrl}
          displayName={displayName}
          onFileSelect={handleAvatarSelect}
          isUploading={isUploading}
          size="lg"
        />
      </div>
      
      {/* Display Name */}
      <div>
        <label 
          htmlFor="display_name"
          className="block text-sm font-medium text-[var(--color-text)] mb-1"
        >
          {t('display_name_label')}
        </label>
        <Input
          id="display_name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={30}
          required
        />
      </div>
      
      {/* Bio */}
      <div>
        <label 
          htmlFor="bio"
          className="block text-sm font-medium text-[var(--color-text)] mb-1"
        >
          {t('bio_label')}
        </label>
        <Input
          id="bio"
          multiline
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t('bio_placeholder')}
          maxLength={500}
        />
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] text-right">
          {bio.length}/500
        </p>
      </div>
      
      {/* Taste Tags */}
      <TasteTagSelector
        selectedTags={tasteTags}
        onChange={setTasteTags}
        maxTags={5}
      />
      
      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !displayName.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {t('saving')}
            </span>
          ) : (
            t('save')
          )}
        </Button>
      </div>
    </form>
  );
}
