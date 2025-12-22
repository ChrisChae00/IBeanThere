'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { TrustedUser } from '@/types/api';

interface TasteMatesSectionProps {
  tasteMates: TrustedUser[];
  isLoading: boolean;
}

export default function TasteMatesSection({ tasteMates, isLoading }: TasteMatesSectionProps) {
  const t = useTranslations('community');

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 px-4">
          {t('taste_mates_title')}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide">
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
      <div className="mb-8 px-4">
        <div className="bg-[var(--color-surface)] rounded-xl p-6 text-center border border-[var(--color-border)]">
          <p className="text-[var(--color-text)] mb-2 font-medium">{t('no_taste_mates')}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('no_taste_mates_hint')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 px-4">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        {t('taste_mates_title')}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {tasteMates.map((mate) => (
          <Link
            key={mate.id}
            href={`/profile/${mate.username}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 group w-16"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors bg-[var(--color-surface)]">
                {mate.avatar_url ? (
                  <Image
                    src={mate.avatar_url}
                    alt={mate.display_name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[var(--color-text-secondary)]">
                    {mate.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-[var(--color-text)] truncate w-full text-center">
              {mate.display_name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

