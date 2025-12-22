'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import TasteMatesSection from '@/components/community/TasteMatesSection';
import CommunityFeed from '@/components/community/CommunityFeed';
import UserSearchSection from '@/components/community/UserSearchSection';
import { TrustedUser } from '@/types/api';

export default function CommunityClient() {
  const t = useTranslations('community');
  const { user, isLoading } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [tasteMates, setTasteMates] = useState<TrustedUser[]>([]);
  const [isMatesLoading, setIsMatesLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();
  }, [supabase.auth]);

  const fetchTasteMates = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/community/taste-mates`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTasteMates(data);
      }
    } catch (error) {
      console.error('Failed to fetch taste mates:', error);
    } finally {
      setIsMatesLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (session) {
      fetchTasteMates();
    }
  }, [session, fetchTasteMates]);

  const trustedUsernames = new Set(tasteMates.map(m => m.username));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{t('login_required_title')}</h2>
        <p className="text-muted-foreground text-center mb-6">
          {t('login_required_description')}
        </p>
        <a
          href="/signin"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {t('sign_in')}
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header - Consistent with standard pages */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            {t('title')}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {t('subtitle')}
          </p>
        </div>

        {/* User Search Section */}
        <UserSearchSection 
          session={session} 
          trustedUsernames={trustedUsernames} 
          onTrustUpdate={fetchTasteMates} 
        />
        
        {/* Taste Mates Section */}
        <TasteMatesSection tasteMates={tasteMates} isLoading={isMatesLoading} />

        {/* Feed - Divider */}
        <div className="border-t border-[var(--color-border)] my-6 pt-6">
          <h2 className="text-xl font-bold mb-4 px-4 text-[var(--color-text)]">{t('feed_title')}</h2>
          <CommunityFeed session={session} />
        </div>
      </div>
    </div>
  );
}
