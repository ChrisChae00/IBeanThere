'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';
import { getCollectionDetail, removeCafeFromCollection, generateShareLink, deleteCollection } from '@/lib/api/collections';
import type { CollectionDetail } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';

export default function CollectionDetailPage() {
  const t = useTranslations('collections');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const collectionId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingCafeId, setRemovingCafeId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/signin`);
    }
  }, [authLoading, user, router, locale]);

  // Fetch collection detail
  useEffect(() => {
    if (!user) return;
    
    const fetchCollection = async () => {
      setIsLoading(true);
      try {
        const data = await getCollectionDetail(collectionId);
        setCollection(data);
      } catch (err) {
        setError(t('load_failed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollection();
  }, [user, collectionId, t]);

  const handleRemoveCafe = useCallback(async (cafeId: string) => {
    if (removingCafeId) return;
    
    setRemovingCafeId(cafeId);
    try {
      await removeCafeFromCollection(collectionId, cafeId);
      setCollection(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter(item => item.cafe_id !== cafeId),
          item_count: prev.item_count - 1,
        };
      });
    } catch (err) {
      setError(t('load_failed'));
    } finally {
      setRemovingCafeId(null);
    }
  }, [collectionId, removingCafeId, t]);

  const handleShare = useCallback(async () => {
    try {
      const { share_url } = await generateShareLink(collectionId);
      const fullUrl = `${window.location.origin}${share_url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      setError(t('load_failed'));
    }
  }, [collectionId, t]);

  const handleDelete = useCallback(async () => {
    if (!collection || collection.icon_type === 'favourite' || collection.icon_type === 'save_later') {
      return;
    }
    
    if (!confirm(t('delete_confirm'))) return;
    
    try {
      await deleteCollection(collectionId);
      router.push(`/${locale}/collections`);
    } catch (err) {
      setError(t('load_failed'));
    }
  }, [collection, collectionId, router, locale, t]);

  const getCollectionIcon = (iconType: string) => {
    if (iconType === 'favourite') {
      return <HeartIcon filled size={28} color="#ef4444" />;
    }
    if (iconType === 'save_later') {
      return <BookmarkIcon filled size={28} color="#3b82f6" />;
    }
    return (
      <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
        📁
      </div>
    );
  };

  const getCollectionName = () => {
    if (!collection) return '';
    if (collection.icon_type === 'favourite') return t('favourite');
    if (collection.icon_type === 'save_later') return t('save_later');
    return collection.name;
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-500">
        {error || t('load_failed')}
      </div>
    );
  }

  const isSystemCollection = collection.icon_type === 'favourite' || collection.icon_type === 'save_later';

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Back button */}
      <Link
        href={`/${locale}/collections`}
        className="inline-flex items-center gap-2 text-[var(--color-textSecondary)] hover:text-[var(--color-cardText)] mb-4"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('my_collections')}
      </Link>

      {/* Header */}
      <div className="bg-[var(--color-cardBackground)] rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {getCollectionIcon(collection.icon_type)}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--color-cardText)]">
              {getCollectionName()}
            </h1>
            <p className="text-[var(--color-textSecondary)]">
              {t('items', { count: collection.item_count })}
            </p>
          </div>
        </div>
        
        {collection.description && (
          <p className="text-[var(--color-textSecondary)] mb-4">
            {collection.description}
          </p>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-secondary)] transition-colors text-sm font-medium"
          >
            {copiedLink ? `✓ ${t('share_link_copied')}` : t('share')}
          </button>
          
          {!isSystemCollection && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              {t('delete')}
            </button>
          )}
        </div>
      </div>

      {/* Cafe List */}
      {collection.items.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-textSecondary)]">
          {t('no_collections')}
        </div>
      ) : (
        <div className="space-y-3">
          {collection.items.map(item => (
            <div
              key={item.id}
              className="bg-[var(--color-cardBackground)] rounded-lg shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                {/* Cafe Image */}
                <Link href={`/${locale}/cafes/${item.cafe_id}`} className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-background)]">
                    {item.cafe_main_image ? (
                      <Image
                        src={item.cafe_main_image}
                        alt={item.cafe_name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        ☕
                      </div>
                    )}
                  </div>
                </Link>
                
                {/* Cafe Info */}
                <Link href={`/${locale}/cafes/${item.cafe_id}`} className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--color-cardText)] truncate hover:underline">
                    {item.cafe_name}
                  </h3>
                  {item.cafe_address && (
                    <p className="text-sm text-[var(--color-textSecondary)] truncate">
                      {item.cafe_address}
                    </p>
                  )}
                </Link>
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveCafe(item.cafe_id)}
                  disabled={removingCafeId === item.cafe_id}
                  className="flex-shrink-0 p-2 text-[var(--color-textSecondary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title={t('remove_save')}
                >
                  {removingCafeId === item.cafe_id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
