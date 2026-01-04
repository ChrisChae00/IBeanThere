'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { BadgeInfo } from '@/types/api';
import { Lock, Award } from 'lucide-react';

interface BadgeCardProps {
  badge: BadgeInfo;
  isUnlocked: boolean;
  awardedAt?: string;
}

export default function BadgeCard({ badge, isUnlocked, awardedAt }: BadgeCardProps) {
  const t = useTranslations('community');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div 
      className={`group relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-300
        ${isUnlocked 
          ? 'bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] border-[var(--color-primary)]/20 shadow-sm hover:shadow-md hover:-translate-y-1' 
          : 'bg-[var(--color-menu)] border-[var(--color-border)] opacity-80 hover:opacity-100'
        }`}
    >
      {/* Icon Area */}
      <div className={`relative w-24 h-24 mb-4 rounded-full flex items-center justify-center
        ${isUnlocked ? 'bg-[var(--color-primary)]/10 ring-4 ring-[var(--color-primary)]/5' : 'bg-[var(--color-border)]/30'}`}
      >
        {isUnlocked ? (
          badge.icon_url ? (
            <Image
              src={badge.icon_url}
              alt={badge.name}
              width={64}
              height={64}
              className="object-contain drop-shadow-md"
            />
          ) : (
            <Award className="w-12 h-12 text-[var(--color-primary)]" />
          )
        ) : (
          <Lock className="w-10 h-10 text-[var(--color-text-secondary)]/50" />
        )}

        {/* Shine effect for unlocked badges */}
        {isUnlocked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        )}
      </div>

      {/* Text Info */}
      <h3 className={`text-lg font-bold mb-1 text-center ${isUnlocked ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}`}>
        {badge.name}
      </h3>
      
      {/* Description - truncated initially, full on hover via tooltip/expansion if needed */}
      <p className="text-sm text-[var(--color-text-secondary)] text-center line-clamp-2 max-w-[200px] mb-3 h-10">
        {badge.description}
      </p>

      {/* Status Footer */}
      <div className="mt-auto">
        {isUnlocked && awardedAt ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Award className="w-3 h-3" />
            {formatDate(awardedAt)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-border)] text-[var(--color-text-secondary)]">
            <Lock className="w-3 h-3" />
            {t('locked')}
          </span>
        )}
      </div>

      {/* Tooltip for Unlock Condition */}
      {!isUnlocked && (
        <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl text-center">
            <p className="font-semibold mb-1 text-[var(--color-primary)]">{t('how_to_unlock')}</p>
            <p>{badge.description}</p>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90" />
          </div>
        </div>
      )}
    </div>
  );
}
