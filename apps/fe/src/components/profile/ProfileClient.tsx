'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { UserResponse } from '@/types/api';
import { Button, EditIcon, LoadingSpinner } from '@/shared/ui';
import { getCurrentUser } from '@/lib/api/users';
import ProfileEditModal from './ProfileEditModal';
import ProfileHeader from './ProfileHeader';
import MyCollectionsSection from './MyCollectionsSection';
import { updateCollectionsPublic } from '@/lib/api/collections';

export default function ProfileClient() {
  const t = useTranslations('profile');
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      setProfile(await getCurrentUser());
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /*
    The saved record comes back from the form, so it goes straight into state. Editing
    used to replace the whole page with the form and then, on save, throw the profile
    away and fetch it again behind a spinner -- two round trips and a page that blinked
    for a change the browser had already been told about.

    Merged onto what is already there rather than swapped for it: the update endpoint
    answers with the fields it writes, and the badges are counted elsewhere. Replacing
    outright made the navigator badge vanish on save until the next page load.
  */
  const handleSave = (saved: UserResponse) =>
    setProfile((prev) => (prev ? { ...prev, ...saved } : saved));

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ProfileHeader
        avatarUrl={profile.avatar_url}
        displayName={profile.display_name}
        username={profile.username}
        bio={profile.bio}
        tasteTags={profile.taste_tags}
        navigatorCount={profile.founding_stats?.navigator_count || 0}
        vanguardCount={profile.founding_stats?.vanguard_count || 0}
        trustCount={profile.trust_count ?? 0}
        createdAt={profile.created_at}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<EditIcon size={16} />}
          >
            {t('edit_profile')}
          </Button>
        }
      />

      {/*
        The form is the dialog primitive, not a second page. Swapping the page out for
        it lost the profile behind it, made the browser's back button mean nothing, and
        managed no focus at all; the modal keeps what is being edited in view and brings
        Escape, the focus trap and focus restore with it.
      */}
      <ProfileEditModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
        onSave={handleSave}
      />

      <MyCollectionsSection
        isOwnProfile={true}
        collectionsPublic={profile.collections_public ?? false}
        onToggleCollectionsPublic={async (isPublic) => {
          setProfile((prev) => (prev ? { ...prev, collections_public: isPublic } : null));
          try {
            await updateCollectionsPublic(isPublic);
          } catch {
            setProfile((prev) => (prev ? { ...prev, collections_public: !isPublic } : null));
          }
        }}
      />
    </div>
  );
}
