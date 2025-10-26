'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import CoffeeBean from '@/components/ui/CoffeeBean';

const MapWithFilters = dynamic(() => import('./MapWithFilters'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[500px] bg-[var(--color-surface)] rounded-xl">
      <div className="text-center">
        <div className="animate-spin mb-2 flex justify-center">
          <CoffeeBean size="lg" />
        </div>
        <p className="text-[var(--color-text-secondary)]">Loading map...</p>
      </div>
    </div>
  )
});

interface MapSectionProps {
  locale: string;
  mapTitle: string;
  mapSubtitle: string;
}

export default function MapSection({ locale, mapTitle, mapSubtitle }: MapSectionProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-lg p-6 h-full min-h-[600px]">
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {mapTitle}
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              {mapSubtitle}
            </p>
          </div>
          <div className="flex-1 min-h-[450px] rounded-xl overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin mb-2 flex justify-center">
                  <CoffeeBean size="lg" />
                </div>
                <p className="text-[var(--color-text-secondary)]">Initializing map...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-lg p-6 h-full min-h-[600px]">
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            {mapTitle}
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            {mapSubtitle}
          </p>
        </div>
        <div className="flex-1 min-h-[450px] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <MapWithFilters locale={locale} />
        </div>
      </div>
    </div>
  );
}

