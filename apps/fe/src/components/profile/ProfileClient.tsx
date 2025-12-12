'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { UserResponse, TasteTag as TasteTagType } from '@/types/api';
import { Avatar } from '@/components/ui/Avatar';
import AchievementBadge from '@/components/ui/AchievementBadge';
import TasteTag from '@/components/ui/TasteTag';
import Button from '@/components/ui/Button';
import EditIcon from '@/components/ui/EditIcon';
import ProfileEditModal from './ProfileEditModal';

// Skeleton component for loading state
function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar Skeleton */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[var(--color-border)]" />
          </div>

          {/* Profile Info Skeleton */}
          <div className="flex-1 space-y-3 w-full">
            {/* Name + Badges Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-8 w-48 bg-[var(--color-border)] rounded-lg" />
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 bg-[var(--color-border)] rounded-full" />
                <div className="h-6 w-16 bg-[var(--color-border)] rounded-full" />
              </div>
            </div>

            {/* Username */}
            <div className="h-5 w-32 bg-[var(--color-border)] rounded" />

            {/* Bio */}
            <div className="space-y-2">
              <div className="h-4 w-full max-w-md bg-[var(--color-border)] rounded" />
              <div className="h-4 w-3/4 max-w-sm bg-[var(--color-border)] rounded" />
            </div>

            {/* Taste Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="h-6 w-20 bg-[var(--color-border)] rounded-full" />
              <div className="h-6 w-24 bg-[var(--color-border)] rounded-full" />
              <div className="h-6 w-16 bg-[var(--color-border)] rounded-full" />
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="h-5 w-24 bg-[var(--color-border)] rounded" />
              <div className="h-6 w-32 bg-[var(--color-border)] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Summary Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[var(--color-border)] rounded" />
            <div className="space-y-2">
              <div className="h-6 w-16 bg-[var(--color-border)] rounded" />
              <div className="h-3 w-24 bg-[var(--color-border)] rounded" />
            </div>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[var(--color-border)] rounded" />
            <div className="space-y-2">
              <div className="h-6 w-16 bg-[var(--color-border)] rounded" />
              <div className="h-3 w-24 bg-[var(--color-border)] rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileClient() {
  const t = useTranslations('profile');
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setLoading(true);
    await fetchProfile();
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return null;
  }

  const navigatorCount = profile.founding_stats?.navigator_count || 0;
  const vanguardCount = profile.founding_stats?.vanguard_count || 0;
  const tasteTags = profile.taste_tags || [];

  return (
    <>
      <div className="space-y-6">
        {/* Profile Header - Compact Design */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm relative">
          {/* Edit Button - Top Right (Desktop) */}
          <div className="absolute top-4 right-4 hidden md:block">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<EditIcon size={16} />}
            >
              {t('edit_profile')}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src={profile.avatar_url}
                alt={profile.display_name}
                size="xl"
                className="w-24 h-24 md:w-28 md:h-28 border-4 border-[var(--color-background)] shadow-md"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3 w-full">
              {/* Name + Badges Row */}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">
                  {profile.display_name}
                </h1>

                {/* GitHub-style Achievement Badges */}
                <div className="flex items-center gap-2">
                  <AchievementBadge
                    type="navigator"
                    count={navigatorCount}
                    size="sm"
                  />
                  <AchievementBadge
                    type="vanguard"
                    count={vanguardCount}
                    size="sm"
                  />
                </div>
              </div>

              {/* Username */}
              <p className="text-[var(--color-text-secondary)] font-medium">
                @{profile.username}
              </p>

              {/* Bio */}
              {profile.bio && (
                <p className="text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Taste Tags */}
              {tasteTags.length > 0 && (
                <div className="pt-1">
                  <div className="flex flex-wrap gap-2">
                    {tasteTags.map((tag: TasteTagType) => (
                      <TasteTag
                        key={tag}
                        tag={tag}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Count & Member Since */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
                {(profile.trust_count ?? 0) > 0 && (
                  <span className="text-[var(--color-text-secondary)]">
                    <span className="font-semibold text-[var(--color-primary)]">
                      {profile.trust_count}
                    </span>
                    {' '}{t('trust_count', { count: profile.trust_count || 0 }).replace(String(profile.trust_count || 0), '').trim()}
                  </span>
                )}

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  {t('member_since', { date: new Date(profile.created_at).toLocaleDateString() })}
                </span>
              </div>

              {/* Edit Button - Mobile Only */}
              <div className="pt-3 md:hidden">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsEditModalOpen(true)}
                  leftIcon={<EditIcon size={16} />}
                >
                  {t('edit_profile')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Summary Cards - Simplified */}
        <div className="grid grid-cols-2 gap-4">
          {/* Navigator Stats */}
          <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent rounded-xl p-4 border border-[var(--color-primary)]/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧭</span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[var(--color-primary)]">
                    {navigatorCount}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {t('cafes_discovered')}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {t('navigator_title')}
                </p>
              </div>
            </div>
          </div>

          {/* Vanguard Stats */}
          <div className="bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent rounded-xl p-4 border border-[var(--color-accent)]/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[var(--color-accent)]">
                    {vanguardCount}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {t('cafes_verified')}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {t('vanguard_title')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSave}
      />
    </>
  );
}
