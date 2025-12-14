'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { CommunityFeedItem, CommunityFeedResponse } from '@/types/api';
import { Session } from '@supabase/supabase-js';
import FeedCard from './FeedCard';

interface CommunityFeedProps {
  session: Session | null;
}

export default function CommunityFeed({ session }: CommunityFeedProps) {
  const t = useTranslations('community');
  const [items, setItems] = useState<CommunityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFeed = useCallback(async (pageNum: number, append = false) => {
    if (!session?.access_token) return;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/community/feed?page=${pageNum}&page_size=10`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data: CommunityFeedResponse = await response.json();
        if (append) {
          setItems((prev) => [...prev, ...data.items]);
        } else {
          setItems(data.items);
        }
        setHasMore(data.has_more);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(page + 1, true);
    }
  };

  const handleLikeToggle = (itemId: string, isLiked: boolean, newCount: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, is_liked_by_me: isLiked, like_count: newCount }
          : item
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-muted rounded" />
                <div className="w-16 h-3 bg-muted rounded" />
              </div>
            </div>
            <div className="w-full h-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">{t('feed_empty')}</p>
        <p className="text-sm text-muted-foreground">{t('feed_empty_hint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} session={session} onLikeToggle={handleLikeToggle} />
      ))}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full py-3 text-primary font-medium hover:bg-muted/50 rounded-lg transition-colors disabled:opacity-50"
        >
          {loadingMore ? t('loading') : t('load_more')}
        </button>
      )}
    </div>
  );
}
