'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/shared/lib/supabase/client';
import { UserPublicResponse, TrustedUser } from '@/types/api';
import { Avatar } from '@/shared/ui';
import { AchievementBadge } from '@/shared/ui';
import { TasteTag } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { UserPlus, Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReportButton, ReportModal, useReportModal } from '@/features/report';


interface PublicProfileClientProps {
  username: string;
}

export default function PublicProfileClient({ username }: PublicProfileClientProps) {
  const t = useTranslations('profile');
  const tCommunity = useTranslations('community');
  const tReport = useTranslations('report');
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { modalState, openUserReport, closeModal } = useReportModal();
  
  const [profile, setProfile] = useState<UserPublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrusted, setIsTrusted] = useState(false);
  const [trustLoading, setTrustLoading] = useState(false);

  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile-by-username/${username}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        // Handle 404 or other errors
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const checkTrustStatus = useCallback(async () => {
    if (!currentUser) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch my taste mates to see if this user is among them
      // Optimization: Could have a specific "is-trusted" endpoint, but reusing list is okay for now
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/community/taste-mates`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const mates: TrustedUser[] = await response.json();
        const isFollowing = mates.some(m => m.username === username);
        setIsTrusted(isFollowing);
      }
    } catch (error) {
      console.error('Error checking trust status:', error);
    }
  }, [currentUser, username, supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile && currentUser) {
      checkTrustStatus();
    }
  }, [profile, currentUser, checkTrustStatus]);

  const handleTrust = async () => {
    if (!currentUser) {
      router.push('/signin');
      return;
    }

    setTrustLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const method = isTrusted ? 'DELETE' : 'POST';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${username}/trust`,
        {
          method,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        setIsTrusted(!isTrusted);
        // Update trust count locally (optimistic update)
        if (profile) {
            setProfile(prev => prev ? {
                ...prev,
                trust_count: (prev.trust_count || 0) + (isTrusted ? -1 : 1)
            } : null);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to update trust');
      }
    } catch (error) {
      console.error('Trust action failed:', error);
    } finally {
      setTrustLoading(false);
    }
  };

  if (loading) {
     return (
       <div className="flex justify-center items-center min-h-[400px]">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
       </div>
     );
  }

  if (!profile) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className="text-xl font-bold mb-2">{tCommunity('no_users_found')}</h2>
            <Button onClick={() => router.back()} variant="outline">
                {t('go_back')}
            </Button>
        </div>
    );
  }

  const isMe = currentUser?.user_metadata?.username === username;

  return (
    <div className="space-y-6">
        {/* Back Button */}
        <button 
            onClick={() => router.back()} 
            className="flex items-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-4"
        >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('back')}
        </button>

      {/* Profile Header */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm relative">
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
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">
                        {profile.display_name}
                    </h1>
                    
                    {/* Badges */}
                    <div className="flex items-center gap-2">
                        <AchievementBadge 
                        type="navigator" 
                        count={profile.founding_stats?.navigator_count || 0} 
                        size="sm"
                        />
                        <AchievementBadge 
                        type="vanguard" 
                        count={profile.founding_stats?.vanguard_count || 0} 
                        size="sm"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                {!isMe && (
                    <div className="flex items-center gap-2">
                        <ReportButton
                            onClick={() => profile && openUserReport(profile.username, username)}
                            size="md"
                            label={tReport('report_user')}
                        />
                        <Button
                            variant={isTrusted ? "outline" : "primary"}
                            size="md"
                            onClick={handleTrust}
                            loading={trustLoading}
                            leftIcon={isTrusted ? <Check size={18} /> : <UserPlus size={18} />}
                            className={isTrusted ? "border-green-500 text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700" : ""}
                        >
                            {isTrusted ? tCommunity('following') : tCommunity('follow')}
                        </Button>
                    </div>
                )}
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
            {profile.taste_tags && profile.taste_tags.length > 0 && (
              <div className="pt-1">
                <div className="flex flex-wrap gap-2">
                  {profile.taste_tags.map((tag) => (
                    <TasteTag 
                      key={tag} 
                      tag={tag as any} 
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
                {t('member_since', { date: new Date(profile.created_at).toISOString().split('T')[0] })}
              </span>
            </div>
          </div>
        </div>
      </div>

       {/* Achievement Summary Cards */}
       <div className="grid grid-cols-2 gap-4">
        {/* Navigator Stats */}
        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent rounded-xl p-4 border border-[var(--color-primary)]/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧭</span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--color-primary)]">
                  {profile.founding_stats?.navigator_count || 0}
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
                  {profile.founding_stats?.vanguard_count || 0}
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

      {/* Report Modal */}
      <ReportModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        targetType={modalState.targetType}
        targetId={modalState.targetId}
        targetUrl={modalState.targetUrl}
      />
    </div>
  );
}
