'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrustedUser } from '@/types/api';
import { Session } from '@supabase/supabase-js';

interface TasteMatesSectionProps {
  session: Session | null;
}

export default function TasteMatesSection({ session }: TasteMatesSectionProps) {
  const t = useTranslations('community');
  const [tasteMates, setTasteMates] = useState<TrustedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasteMates = async () => {
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
        setLoading(false);
      }
    };

    fetchTasteMates();
  }, [session?.access_token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-16 h-16 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (tasteMates.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-2">{t('no_taste_mates')}</p>
          <p className="text-sm text-muted-foreground">
            {t('no_taste_mates_hint')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        {t('taste_mates_title')}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {tasteMates.map((mate) => (
          <Link
            key={mate.id}
            href={`/profile/${mate.username}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
                {mate.avatar_url ? (
                  <Image
                    src={mate.avatar_url}
                    alt={mate.display_name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                    {mate.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-foreground truncate max-w-[64px]">
              {mate.display_name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
