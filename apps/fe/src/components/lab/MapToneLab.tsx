'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMapData } from '@/hooks/useMapData';
import { getTrendingCafes } from '@/lib/api/cafes';
import { TrendingCafeResponse } from '@/types/api';
import { CafeCard } from '@/components/cafe';
import { Button, LoadingSpinner } from '@/shared/ui';

/*
  THROWAWAY. Two candidate treatments for the Discover/Map surfaces, side by side, so
  the tone can be chosen by looking rather than by describing. Deleted in the same
  commit that promotes the winner — that is why the copy here is hardcoded English and
  not translated.

  The centre is fixed so the lab renders without a geolocation prompt, which also makes
  it the harness for verifying markers, clusters and popups.
*/
const CENTER = { lat: 43.6511, lng: -79.3789 }; // Toronto
const RADIUS_M = 20000;

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
});

export type Tone = 'quiet' | 'press';

const FILTERS = ['All cafes', 'Closest', 'Most popular'] as const;

export default function MapToneLab({ tone }: { tone: Tone }) {
  const press = tone === 'press';
  const { cafes, isLoading, searchCafes } = useMapData();
  const [gridCafes, setGridCafes] = useState<TrendingCafeResponse[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>(FILTERS[0]);

  useEffect(() => {
    searchCafes({ lat: CENTER.lat, lng: CENTER.lng, radius: RADIUS_M });
    getTrendingCafes(12).then(setGridCafes).catch(() => setGridCafes([]));
  }, [searchCafes]);

  return (
    <main className={`min-h-screen bg-surface-page ${press ? 'tone-press' : 'tone-quiet'}`}>
      {press && (
        /* Scoped to the lab so it disappears with it. */
        <style>{`
          .tone-press article { border-color: transparent; border-radius: 0; }
          .tone-press .custom-cluster-icon > div {
            font-family: var(--font-display);
            border-width: 1px;
          }
        `}</style>
      )}

      <section className="mx-auto w-full max-w-[1400px] px-6 pt-10 md:px-10">
        {press ? (
          <>
            <p className="landing-micro text-ink-secondary">Discover</p>
            <h1 className="landing-display mt-3 text-[clamp(2.5rem,6vw,4.5rem)] text-ink-primary">
              Every cafe within reach
            </h1>
            <div className="mt-6 border-t border-edge-default" />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-ink-primary md:text-4xl">
              Discover your coffee neighborhood
            </h1>
            <p className="mt-2 text-ink-secondary">Find cafes near you</p>
          </>
        )}
      </section>

      {/* Filter row */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-6 md:px-10">
        {press ? (
          <div className="flex flex-wrap items-center gap-6 border-b border-edge-subtle pb-3">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`landing-micro min-h-11 border-b-2 pb-1 transition-colors ${
                  activeFilter === f
                    ? 'border-brand text-ink-primary'
                    : 'border-transparent text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {f}
              </button>
            ))}
            <span className="landing-micro ml-auto text-ink-secondary">
              {gridCafes.length} listed
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {FILTERS.map((f) => (
              <Button
                key={f}
                variant={activeFilter === f ? 'primary' : 'outline'}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        )}
      </section>

      {/* Map */}
      <section className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div
          className={
            press
              ? 'h-[520px] border-y border-edge-default'
              : 'h-[520px] overflow-hidden rounded-(--radius-card) border border-edge-default bg-surface-raised'
          }
        >
          <InteractiveMap cafes={cafes} center={CENTER} zoom={13} />
        </div>
        <p className="landing-micro mt-3 text-ink-secondary">
          {isLoading ? 'Searching this area' : `${cafes.length} cafes on the map`}
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-10">
        {press ? (
          <h2 className="landing-display mb-6 text-[clamp(1.5rem,3vw,2.25rem)] text-ink-primary">
            On the map this week
          </h2>
        ) : (
          <h2 className="mb-6 text-2xl font-semibold text-ink-primary">On the map this week</h2>
        )}

        {gridCafes.length === 0 ? (
          press ? (
            <div className="border-t border-edge-default pt-6">
              <p className="landing-display text-[clamp(1.25rem,2.5vw,1.75rem)] text-ink-primary">
                Nothing here yet.
              </p>
              <p className="mt-2 max-w-prose text-ink-secondary">
                This part of the map is unwritten. Add the first cafe and it stays on the
                record under your name.
              </p>
              <p className="landing-micro mt-4 border-b border-brand pb-1 text-ink-primary inline-block">
                Register a cafe
              </p>
            </div>
          ) : (
            <div className="rounded-(--radius-card) border border-edge-default bg-surface-raised p-10 text-center">
              <p className="text-ink-primary">No cafes here yet</p>
              <p className="mt-1 text-sm text-ink-secondary">Be the first to add one.</p>
              <Button className="mt-4">Register a cafe</Button>
            </div>
          )
        ) : (
          <div
            className={
              press
                ? 'grid grid-cols-1 gap-px bg-edge-subtle md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }
          >
            {gridCafes.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} locale="en" size="lg" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
