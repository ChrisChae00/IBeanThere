'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';
import { getSharedCollection } from '@/lib/api/collections';
import { getCafePath } from '@/lib/utils/slug';
import type { CollectionDetail } from '@/types/api';

export default function SharedCollectionPage() {
  const t = useTranslations('collections');
  const tShare = useTranslations('share');
  const params = useParams();
  const locale = params.locale as string;
  const token = params.token as string;
  
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shared collection
  useEffect(() => {
    const fetchCollection = async () => {
      setIsLoading(true);
      try {
        const data = await getSharedCollection(token);
        setCollection(data);
      } catch (err) {
        setError(t('load_failed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollection();
  }, [token, t]);

  const getCollectionIcon = (iconType: string) => {
    if (iconType === 'favourite') {
      return <HeartIcon filled size={28} color="#ef4444" />;
    }
    if (iconType === 'save_later') {
      return <BookmarkIcon filled size={28} color="#3b82f6" />;
    }
    return (
      <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]" />
    );
  };

  const getCollectionName = () => {
    if (!collection) return '';
    if (collection.icon_type === 'favourite') return t('favourite');
    if (collection.icon_type === 'save_later') return t('save_later');
    return collection.name;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="text-xl font-bold text-[var(--color-cardText)] mb-2">
          {t('load_failed')}
        </h1>
        <p className="text-[var(--color-textSecondary)] mb-6">
          This shared collection may have been removed or the link is invalid.
        </p>
        <Link
          href={`/${locale}`}
          className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-secondary)] transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Shared badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {tShare('title')}
      </div>

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
          <p className="text-[var(--color-textSecondary)]">
            {collection.description}
          </p>
        )}
      </div>

      {/* Cafe List */}
      {collection.items.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-textSecondary)]">
          {t('no_collections')}
        </div>
      ) : (
        <div className="space-y-3">
          {collection.items.map(item => (
            <Link
              key={item.id}
              href={getCafePath({ id: item.cafe_id, slug: item.cafe_slug }, locale)}
              className="flex items-center gap-4 p-4 bg-[var(--color-cardBackground)] rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Cafe Image */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-background)]">
                {item.cafe_main_image ? (
                  <img
                    src={item.cafe_main_image}
                    alt={item.cafe_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    ☕
                  </div>
                )}
              </div>
              
              {/* Cafe Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[var(--color-cardText)] truncate">
                  {item.cafe_name}
                </h3>
                {item.cafe_address && (
                  <p className="text-sm text-[var(--color-textSecondary)] truncate">
                    {item.cafe_address}
                  </p>
                )}
              </div>
              
              {/* Arrow */}
              <svg className="w-5 h-5 text-[var(--color-textSecondary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-[var(--color-textSecondary)] mb-4">
          Create your own coffee collection!
        </p>
        <Link
          href={`/${locale}/profile`}
          className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-secondary)] transition-colors font-medium"
        >
          {t('my_collections')}
        </Link>
      </div>
    </div>
  );
}
