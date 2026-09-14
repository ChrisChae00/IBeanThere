'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { UserResponse, TasteTag } from '@/types/api';
import { createClient } from '@/shared/lib/supabase/client';
import { uploadAvatar, validateImageFile } from '@/shared/lib/supabase/storage';
import { updateCurrentUser } from '@/lib/api/users';
import { AvatarUpload, Button, Input } from '@/shared/ui';
import TasteTagSelector from './TasteTagSelector';

interface ProfileEditFormProps {
  profile: UserResponse;
  /*
    Handed the saved record, not a signal to go and fetch it. The page can put this
    straight into state: one round trip instead of two, and no window in between where
    the profile it is rendering is the old one or none at all.
  */
  onSave: (saved: UserResponse) => void;
  onCancel: () => void;
}

export default function ProfileEditForm({
  profile,
  onSave,
  onCancel,
}: ProfileEditFormProps) {
  const t = useTranslations('profile');
  const tErrors = useTranslations('errors');
  
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
        setError(tErrors('not_authenticated'));
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
      
      const saved = await updateCurrentUser({
        display_name: displayName,
        bio: bio || null,
        avatar_url: newAvatarUrl,
        taste_tags: tasteTags,
      });

      onSave(saved);
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(tErrors('unknown'));
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
          className="mb-1 block text-sm font-medium text-ink-primary"
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
          className="mb-1 block text-sm font-medium text-ink-primary"
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
        <p className="mt-1 text-xs text-ink-secondary text-right">
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
        /*
          A failure is a sentence in the page's own ink with a danger dot beside it, not
          a red plate: a state colour over its own tint measures 2.4-3.5:1 in three of
          the four themes, and `red-50` did not follow the theme at all.
        */
        <p className="flex items-center gap-2 text-sm text-ink-primary">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-(--radius-pill) bg-state-danger" />
          {error}
        </p>
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
              <span className="h-4 w-4 animate-spin rounded-(--radius-pill) border-2 border-current border-t-transparent" />
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
