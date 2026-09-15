"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Link2, ChevronRight } from 'lucide-react';
import { Button, HeartIcon, BookmarkIcon, LoadingSpinner } from '@/shared/ui';
import { useAuth } from '@/features/auth';
import { copySharedCollection, getSharedCollection } from '@/lib/api/collections';
import { getCafePath } from '@/lib/utils/slug';
import type { CollectionDetail } from '@/types/api';

export default function SharedCollectionPage() {
  const t = useTranslations('collections');
  const { locale, token } = useParams<{ locale: string; token: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setCollection(null);
    setSaved(false);
    setSaveError(false);
    getSharedCollection(token)
      .then(data => { if (active) setCollection(data); })
      .catch(() => { if (active) setCollection(null); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [token]);

  const handleCopy = async () => {
    if (isSaving || saved) return;
    setIsSaving(true);
    setSaveError(false);
    try {
      await copySharedCollection(token);
      setSaved(true);
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center px-4 py-12"><LoadingSpinner size="lg" /></div>;
  }

  if (!collection) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <Link2 aria-hidden="true" className="mx-auto mb-4 size-8 text-ink-secondary" />
        <h1 className="mb-2 font-sans text-xl font-semibold text-ink-primary">{t('load_failed')}</h1>
        <p className="mb-6 text-ink-secondary">{t('shared_unavailable')}</p>
        <Link href={`/${locale}`} className="inline-flex min-h-11 items-center underline underline-offset-4">{t('go_home')}</Link>
      </div>
    );
  }

  const name = collection.icon_type === 'favourite' ? t('favourite')
    : collection.icon_type === 'save_later' ? t('save_later') : collection.name;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <p className="landing-micro mb-4 flex items-center gap-2 text-ink-secondary">
        <Link2 size={16} aria-hidden="true" />{t('shared_collection')}
      </p>
      <div className="border-y border-edge-rule py-6">
        <div className="flex items-center gap-4">
          <span className="shrink-0" aria-hidden="true">
            {collection.icon_type === 'favourite' ? <HeartIcon filled size={28} className="text-collection-favourite" />
              : <BookmarkIcon filled size={28} className="text-brand" />}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="break-words font-sans text-2xl font-semibold text-ink-primary">{name}</h1>
            <p className="mt-1 text-sm text-ink-secondary">{t('cafes', { count: collection.item_count })}</p>
          </div>
        </div>
        {collection.description && <p className="mt-4 break-words text-ink-secondary">{collection.description}</p>}
        <div className="mt-6">
          <p className="mb-3 text-sm leading-relaxed text-ink-secondary">{t('copy_hint')}</p>
          {saved ? (
            <div role="status">
              <p className="text-sm text-ink-primary">{t('copy_success')}</p>
              <Link href={`/${locale}/profile`} className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">{t('my_collections')}</Link>
            </div>
          ) : user ? (
            <Button onClick={handleCopy} loading={isSaving}>{t('save_copy')}</Button>
          ) : (
            <Link href={`/${locale}/signin?collection=${encodeURIComponent(token)}`} aria-disabled={authLoading}
              className={`btn-fill btn-shade inline-flex min-h-11 items-center justify-center rounded-(--btn-radius) px-5 py-3 text-sm font-semibold ${authLoading ? 'pointer-events-none opacity-60' : ''}`}>
              {t('signin_to_copy')}
            </Link>
          )}
          {saveError && <p role="alert" className="mt-3 text-sm text-state-danger">{t('copy_failed')}</p>}
        </div>
      </div>
      {collection.items.length === 0 ? (
        <p className="py-10 text-center text-ink-secondary">{t('no_cafes')}</p>
      ) : (
        <div className="divide-y divide-edge-rule">
          {collection.items.map(item => (
            <Link key={item.id} href={getCafePath({ id: item.cafe_id, slug: item.cafe_slug }, locale)}
              className="flex items-center gap-4 py-4 transition-colors hover:bg-surface-hover">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-(--radius-card) bg-surface-sunken">
                {item.cafe_main_image ? <img src={item.cafe_main_image} alt="" className="size-full object-cover" />
                  : <Coffee size={24} aria-hidden="true" className="text-ink-secondary" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-sans text-base font-medium text-ink-primary">{item.cafe_name}</h2>
                {item.cafe_address && <p className="truncate text-sm text-ink-secondary">{item.cafe_address}</p>}
              </div>
              <ChevronRight size={20} aria-hidden="true" className="shrink-0 text-ink-secondary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
