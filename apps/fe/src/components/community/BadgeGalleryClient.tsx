'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import { BadgeInfo, BadgeResponse } from '@/types/api';
import BadgeCard from './BadgeCard';
import { Trophy } from 'lucide-react';

export default function BadgeGalleryClient() {
  const t = useTranslations('community');
  const { user, isLoading: isAuthLoading } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [userBadges, setUserBadges] = useState<BadgeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !session) return;

      try {
        setIsLoading(true);
        
        // 1. Get all badge definitions
        const badgesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/community/badges`);
        if (!badgesRes.ok) throw new Error('Failed to fetch badges');
        const badgesData = await badgesRes.json();
        
        // 2. Get user's earned badges
        // We need the username. The user object from useAuth might have it or we can get it from the session/profile
        // Assuming user object has username or we can fetch it. 
        // Let's try to get it from the user metadata or query the profile if needed.
        // Actually, let's use the ID or just assume the API can handle 'me' if we implemented it, 
        // but the API takes {username}. 
        // Let's fetch the profile first to be safe or use user_metadata if available.
        
        let username = user.user_metadata?.username;
        if (!username) {
            // Fallback: fetch profile
            const { data: profileData } = await supabase
                .from('users')
                .select('username')
                .eq('id', user.id)
                .single();
            if (profileData) {
                username = (profileData as { username: string }).username;
            }
        }

        if (username) {
            const userBadgesRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/community/users/${username}/badges`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                }
            );
            
            if (userBadgesRes.ok) {
                const userBadgesData = await userBadgesRes.json();
                setUserBadges(userBadgesData);
            }
        }
        
        setBadges(badgesData);
      } catch (error) {
        console.error('Error fetching badge data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && session) {
      fetchData();
    }
  }, [user, session, supabase]);

  if (isAuthLoading || (user && isLoading)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">{t('login_required_title')}</h2>
        <p className="text-[var(--color-text-secondary)]">{t('login_required_description')}</p>
      </div>
    );
  }

  const earnedBadgeCodes = new Set(userBadges.map(b => b.badge_code));
  const earnedCount = earnedBadgeCodes.size;
  const totalCount = badges.length;
  const progressPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          {t('badge_gallery_title')}
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          {t('badge_gallery_description')}
        </p>
      </div>

      {/* Progress Section */}
      <div className="mb-12 max-w-xl mx-auto bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <span className="font-semibold text-[var(--color-text)]">{t('collection_progress')}</span>
          <span className="text-sm font-bold text-[var(--color-primary)]">
            {earnedCount} / {totalCount}
          </span>
        </div>
        <div className="w-full bg-[var(--color-border)] rounded-full h-3 overflow-hidden">
          <div 
            className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-3 text-center">
          {earnedCount === totalCount 
            ? t('all_badges_earned') 
            : t('badges_remaining', { count: totalCount - earnedCount })}
        </p>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge) => {
          const isUnlocked = earnedBadgeCodes.has(badge.code);
          const userBadge = userBadges.find(b => b.badge_code === badge.code);
          
          return (
            <BadgeCard
              key={badge.code}
              badge={badge}
              isUnlocked={isUnlocked}
              awardedAt={userBadge?.awarded_at}
            />
          );
        })}
      </div>
    </div>
  );
}
