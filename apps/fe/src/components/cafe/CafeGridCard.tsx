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
      className="group bg-surface border border-border rounded-2xl overflow-hidden transition-shadow cursor-pointer flex flex-col relative"
    >
      {/* Hover shadow overlay - renders on top of all content */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-inset-primary z-10" />
      
      <div className="bg-primary flex-1 flex flex-col">
        <CafeCardImage imageUrl={cafeImage} alt={cafe.name} size="large" />
      </div>
      <div className="p-4 mt-auto">
        <h3 className="text-sm font-semibold text-text mb-1.5 line-clamp-2" title={cafe.name}>
          {cafe.name}
        </h3>
        <p className="text-xs text-(--color-text-secondary) mb-3 truncate" title={cafe.address}>
          {extractCity(cafe.address)}
        </p>
        <div className="flex items-center justify-between gap-2 mt-2">
          {/* Trending tag - only show for top 3 */}
          {cafe.trending_rank && cafe.trending_rank <= 3 ? (
            <span className="bg-primary text-primaryText px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
              🔥 {tMap('trending')}
            </span>
          ) : cafe.status === 'pending' ? (
            <span className="bg-(--color-surface-hover) text-(--color-text-secondary) border border-border px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              ⏳ {locale === 'ko' ? '검증 대기' : 'Pending'}
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

