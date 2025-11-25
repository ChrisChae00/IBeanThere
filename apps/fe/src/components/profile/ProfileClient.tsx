'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { UserResponse } from '@/types/api';
import { Avatar } from '@/components/ui';

export default function ProfileClient() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
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
    }

    fetchProfile();
  }, [user]);

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

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <Avatar 
              src={profile.avatar_url} 
              alt={profile.display_name} 
              size="xl"
              className="w-32 h-32 border-4 border-[var(--color-background)] shadow-md"
            />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              {profile.display_name}
            </h1>
            <p className="text-[var(--color-text-secondary)] font-medium">
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="text-[var(--color-text-secondary)] max-w-2xl">
                {profile.bio}
              </p>
            )}
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                {t('member_since', { date: new Date(profile.created_at).toLocaleDateString() })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Founding Crew Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Navigator Stats */}
        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-primary)]/10 rounded-xl p-6 border border-[var(--color-primary)]/20 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-24 h-24 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[var(--color-primary)]/20 rounded-lg text-[var(--color-primary)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">{t('navigator_title')}</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[var(--color-primary)]">
                {profile.founding_stats?.navigator_count || 0}
              </span>
              <span className="text-[var(--color-text-secondary)] font-medium">{t('cafes_discovered')}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {t('navigator_description')}
            </p>
          </div>
        </div>

        {/* Vanguard Stats */}
        <div className="bg-gradient-to-br from-[var(--color-accent)]/5 to-[var(--color-accent)]/10 rounded-xl p-6 border border-[var(--color-accent)]/20 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-24 h-24 text-[var(--color-accent)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[var(--color-accent)]/20 rounded-lg text-[var(--color-accent)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">{t('vanguard_title')}</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[var(--color-accent)]">
                {profile.founding_stats?.vanguard_count || 0}
              </span>
              <span className="text-[var(--color-text-secondary)] font-medium">{t('cafes_verified')}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {t('vanguard_description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
