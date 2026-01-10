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
      className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 hover:shadow-inset-primary transition-shadow flex flex-col h-full cursor-pointer relative"
    >
      <div className="overflow-hidden rounded-lg">
        <CafeCardImage imageUrl={cafeImage} alt={cafe.name} size="small" />
      </div>
      <div className="flex flex-col mt-auto">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-0.5 line-clamp-2" title={cafe.name}>
          {cafe.name}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-3 truncate" title={cafe.address}>
          {extractCity(cafe.address)}
        </p>
        <div className="flex items-center justify-between gap-2 mt-2">
          {/* Dynamic trending tag - only show if in top 10 */}
          {cafe.trending_rank && cafe.trending_rank <= 10 ? (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              🔥 #{cafe.trending_rank}
            </span>
          ) : (
            <span className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              ☕ {tMap('popular')}
            </span>
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

