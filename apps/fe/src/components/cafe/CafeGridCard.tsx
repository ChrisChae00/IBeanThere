'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { TrendingCafeResponse } from '@/types/api';
import CafeCardImage from './CafeCardImage';
import { getCafePath } from '@/lib/utils/slug';
import { extractCity } from '@/lib/utils/address';

interface CafeGridCardProps {
  cafe: TrendingCafeResponse;
  locale: string;
  onCheckIn?: (cafeId: string) => void;
}

export default function CafeGridCard({ cafe, locale, onCheckIn }: CafeGridCardProps) {
  const tMap = useTranslations('map');
  const tVisit = useTranslations('visit');
  
  const cafeImage = cafe.main_image || cafe.image;
  const cafePath = getCafePath(cafe, locale);

  const handleCheckIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCheckIn) {
      onCheckIn(cafe.id);
    }
  };

  return (
    <Link 
      href={cafePath}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:shadow-inset-primary transition-shadow cursor-pointer flex flex-col"
    >
      <CafeCardImage imageUrl={cafeImage} alt={cafe.name} size="large" />
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1.5 line-clamp-2" title={cafe.name}>
          {cafe.name}
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3 truncate" title={cafe.address}>
          {extractCity(cafe.address)}
        </p>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            🔥 {tMap('trending')}
          </span>
          <button 
            onClick={handleCheckIn}
            className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[var(--color-secondary)] transition-colors whitespace-nowrap"
          >
            {tVisit('check_in_button')}
          </button>
        </div>
      </div>
    </Link>
  );
}

