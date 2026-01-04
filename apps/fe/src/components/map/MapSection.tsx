'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/shared/ui';

const MapWithFilters = dynamic(() => import('./MapWithFilters'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[500px] bg-[var(--color-surface)] rounded-xl">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-[var(--color-text-secondary)] mt-4">Loading map...</p>
      </div>
    </div>
  )
});

interface MapSectionProps {
  locale: string;
  mapTitle: string;
  mapSubtitle: string;
  userMarkerPalette?: string;
}

export default function MapSection({ locale, mapTitle, mapSubtitle, userMarkerPalette }: MapSectionProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-lg p-6 h-full min-h-[500px] flex flex-col">
      <MapWithFilters 
        locale={locale} 
        userMarkerPalette={userMarkerPalette}
        mapTitle={mapTitle}
        mapSubtitle={mapSubtitle}
      />
    </div>
  );
}

