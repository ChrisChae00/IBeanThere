'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { TrendingCafeResponse } from '@/types/api';
import CafeCardImage from './CafeCardImage';
import DropBeanButton from './DropBeanButton';
import { getCafePath } from '@/lib/utils/slug';
import { extractCity } from '@/lib/utils/address';

interface TrendingCafeCardProps {
  cafe: TrendingCafeResponse;
  locale: string;
  onCheckIn?: (cafeId: string) => void;
}

export default function TrendingCafeCard({ cafe, locale }: TrendingCafeCardProps) {
  const tMap = useTranslations('map');
  
  const cafeImage = cafe.main_image || cafe.image;
  const cafePath = getCafePath(cafe, locale);

  // Safely convert coordinates to numbers
  const latitude = typeof cafe.latitude === 'string' ? parseFloat(cafe.latitude) : cafe.latitude;
  const longitude = typeof cafe.longitude === 'string' ? parseFloat(cafe.longitude) : cafe.longitude;

  return (
    <Link 
      href={cafePath}
      className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:shadow-inset-primary transition-shadow flex flex-col h-full cursor-pointer relative"
    >
      <div className="overflow-hidden">
        <CafeCardImage imageUrl={cafeImage} alt={cafe.name} size="small" />
      </div>
      <div className="flex flex-col mt-auto p-3">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-0.5 line-clamp-1" title={cafe.name}>
          {cafe.name}
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-2 truncate" title={cafe.address}>
          {extractCity(cafe.address)}
        </p>
        <div className="flex items-center justify-between gap-2 mt-1">
          {/* Trending tag - only show for top 3 */}
          {cafe.trending_rank && cafe.trending_rank <= 3 ? (
            <span className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              🔥 {tMap('trending')}
            </span>
          ) : (
            <span /> /* Empty span to maintain flex layout */
          )}
          <div onClick={(e) => e.preventDefault()}>
            <DropBeanButton
              cafeId={cafe.id}
              cafeLat={latitude}
              cafeLng={longitude}
              size="sm"
              showGrowthInfo={false}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

