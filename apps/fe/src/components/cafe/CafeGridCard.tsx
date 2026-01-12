'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { TrendingCafeResponse } from '@/types/api';
import CafeCardImage from './CafeCardImage';
import DropBeanButton from './DropBeanButton';
import { getCafePath } from '@/lib/utils/slug';
import { extractCity } from '@/lib/utils/address';

interface CafeGridCardProps {
  cafe: TrendingCafeResponse;
  locale: string;
}

export default function CafeGridCard({ cafe, locale }: CafeGridCardProps) {
  const tMap = useTranslations('map');
  
  const cafeImage = cafe.main_image || cafe.image;
  const cafePath = getCafePath(cafe, locale);

  const handleDropBeanClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link 
      href={cafePath}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:shadow-inset-primary transition-shadow cursor-pointer flex flex-col relative"
    >
      <div className="overflow-hidden rounded-t-2xl">
        <CafeCardImage imageUrl={cafeImage} alt={cafe.name} size="large" />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1.5 line-clamp-2" title={cafe.name}>
          {cafe.name}
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3 truncate" title={cafe.address}>
          {extractCity(cafe.address)}
        </p>
        <div className="flex items-center justify-between gap-2 mt-2">
          {/* Trending tag - only show for top 3 */}
          {cafe.trending_rank && cafe.trending_rank <= 3 ? (
            <span className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              🔥 {tMap('trending')}
            </span>
          ) : (
            <span /> /* Empty span to maintain flex layout */
          )}
          <div onClick={handleDropBeanClick}>
            <DropBeanButton
              cafeId={cafe.id}
              cafeLat={cafe.latitude}
              cafeLng={cafe.longitude}
              size="sm"
              showGrowthInfo={false}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

