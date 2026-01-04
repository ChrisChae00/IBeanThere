'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CommunityFeedItem } from '@/types/api';
import { Session } from '@supabase/supabase-js';
import { Heart, MessageCircle, MapPin, Star, Share2, Coffee } from 'lucide-react';

interface FeedCardProps {
  item: CommunityFeedItem;
  session: Session | null;
  onLikeToggle: (itemId: string, isLiked: boolean, newCount: number) => void;
}

export default function FeedCard({ item, session, onLikeToggle }: FeedCardProps) {
  const t = useTranslations('community');
  const [isLiking, setIsLiking] = useState(false);
  const hasPhotos = item.photo_urls && item.photo_urls.length > 0;

  const handleLike = async () => {
    if (!session?.access_token || isLiking) return;

    setIsLiking(true);
    try {
      const method = item.is_liked_by_me ? 'DELETE' : 'POST';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/community/visits/${item.id}/like`,
        {
          method,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok || response.status === 204) {
        const newIsLiked = !item.is_liked_by_me;
        const newCount = newIsLiked ? item.like_count + 1 : item.like_count - 1;
        onLikeToggle(item.id, newIsLiked, newCount);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return t('days_ago', { count: diffDays });
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
      {/* Header - User Info */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Link href={`/profile/${item.username}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--color-muted)] ring-2 ring-[var(--color-primary)]/10">
            {item.avatar_url ? (
              <Image
                src={item.avatar_url}
                alt={item.display_name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[var(--color-text-secondary)] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20">
                {item.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${item.username}`}>
              <span className="font-semibold text-[var(--color-text)] hover:underline">
                {item.display_name}
              </span>
            </Link>
            <span className="text-[var(--color-text-secondary)] text-sm">·</span>
            <span className="text-xs text-[var(--color-text-secondary)]">{formatDate(item.visited_at)}</span>
          </div>
          {/* Cafe Location Tag */}
          <Link href={`/cafes/${item.cafe_id}`}>
            <div className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{item.cafe_name}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Text Content - Always visible */}
      {item.comment && (
        <div className="px-4 pb-3">
          <p className="text-[var(--color-text)] text-[15px] leading-relaxed whitespace-pre-wrap">
            {item.comment}
          </p>
        </div>
      )}

      {/* Coffee & Rating Info */}
      {(item.coffee_type || item.rating) && (
        <div className="px-4 pb-3 flex flex-wrap items-center gap-3">
          {item.coffee_type && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-primary)]/10 rounded-full">
              <Coffee className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="text-xs font-medium text-[var(--color-primary)]">{item.coffee_type}</span>
            </div>
          )}
          {item.rating && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 rounded-full">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium text-yellow-600">{item.rating}/5</span>
            </div>
          )}
        </div>
      )}

      {/* Photos - Only if present */}
      {hasPhotos && (
        <div className="relative">
          {item.photo_urls!.length === 1 ? (
            <div className="relative aspect-[16/10] bg-[var(--color-muted)]">
              <Image
                src={item.photo_urls![0]}
                alt={item.cafe_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {item.photo_urls!.slice(0, 4).map((url, idx) => (
                <div key={idx} className="relative aspect-square bg-[var(--color-muted)]">
                  <Image src={url} alt={`${item.cafe_name} ${idx + 1}`} fill className="object-cover" />
                  {idx === 3 && item.photo_urls!.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">+{item.photo_urls!.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${item.is_liked_by_me 
                ? 'text-red-500 bg-red-50 dark:bg-red-500/10' 
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)]'
              } disabled:opacity-50`}
          >
            <Heart className={`w-4 h-4 ${item.is_liked_by_me ? 'fill-red-500' : ''}`} />
            <span>{item.like_count > 0 ? item.like_count : t('like')}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/cafes/${item.cafe_id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t('view_cafe')}</span>
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
