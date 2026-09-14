'use client';

import dynamic from 'next/dynamic';

/*
  The fallback is the shape of the thing being loaded rather than a spinner in an empty
  box: the panel is already the map's size, so nothing moves when the map arrives. It
  carries no text -- the old "Loading map..." was the one untranslated string on this
  page, and a skeleton does not need a caption to be understood.
*/
const MapWithFilters = dynamic(() => import('./MapWithFilters'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[500px] flex-col">
      <div className="mb-4 space-y-2">
        <div className="h-6 w-40 animate-pulse rounded-sm bg-surface-hover" />
        <div className="h-4 w-56 animate-pulse rounded-sm bg-surface-hover" />
      </div>
      <div className="flex-1 animate-pulse rounded-(--radius-card) border border-edge-rule bg-surface-hover" />
    </div>
  )
});

interface MapSectionProps {
  locale: string;
  mapTitle: string;
  mapSubtitle: string;
}

export default function MapSection({ locale, mapTitle, mapSubtitle }: MapSectionProps) {
  return (
    <div className="relative flex h-full min-h-[500px] flex-col rounded-(--radius-card) border border-edge-rule bg-surface-raised p-6">
      <MapWithFilters locale={locale} mapTitle={mapTitle} mapSubtitle={mapSubtitle} />
    </div>
  );
}
