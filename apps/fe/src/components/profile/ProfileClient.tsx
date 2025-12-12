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
import ProfileEditForm from './ProfileEditForm';

export default function ProfileClient() {
  const t = useTranslations('profile');
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(false);
    setLoading(true);
    await fetchProfile();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const navigatorCount = profile.founding_stats?.navigator_count || 0;
  const vanguardCount = profile.founding_stats?.vanguard_count || 0;
  const tasteTags = profile.taste_tags || [];

  // Edit Mode
  if (isEditing) {
    return (
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">
          {t('edit_profile')}
        </h2>
        <ProfileEditForm
          profile={profile}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // View Mode
  return (
    <div className="space-y-6">
      {/* Profile Header - Compact Design */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
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
            
            {/* Edit Button */}
            <div className="pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
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
  );
}
