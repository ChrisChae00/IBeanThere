'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckIcon, RefreshIcon, SearchIcon, UserLocationIcon } from '@/shared/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/base/tooltip';
import { CafeMapData } from '@/types/map';
import { searchCafesByText } from '@/lib/api/cafes';

/*
  What the map draws, and how to find one pin in it. The three verbs sit in one group
  above the map rather than on it -- a control laid over the map covers the thing it
  changes, and three separate pills next to a count read as three unrelated decisions.
  Search stays on the map, because its result list is about what is under it.

  Filters narrow together (local AND verified, not local OR verified): each one the
  reader turns on is a condition they are adding. None on means every pin.
*/
export type MapFilterId = 'local' | 'verified' | 'trending';

export const MAP_FILTER_IDS: MapFilterId[] = ['local', 'verified', 'trending'];

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`w-72 max-w-[calc(100vw-3rem)] rounded-(--radius-card) border border-edge-rule bg-surface-raised p-2 shadow-(--relief-shadow-lifted) ${className}`}
    >
      {children}
    </div>
  );
}

/*
  One rule between neighbours, one pill outline around the set. The ends are named
  explicitly rather than with `first:`/`last:`: each button is the only child of its own
  tooltip wrapper, so both pseudo-classes match every one of them.
*/
const GROUP_BUTTON =
  'flex h-11 w-11 items-center justify-center border border-edge-rule bg-surface-raised text-ink-primary hover:bg-surface-hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand disabled:opacity-60 disabled:hover:bg-surface-raised';
const GROUP_START = 'rounded-l-(--radius-pill)';
const GROUP_END = 'rounded-r-(--radius-pill)';

export function MapControlGroup({
  active,
  onToggle,
  counts,
  localDisabled,
  trendingDisabled,
  onLocate,
  onRefresh,
  refreshDisabled,
  onSelectCafe,
}: {
  active: Set<MapFilterId>;
  onToggle: (id: MapFilterId) => void;
  counts: Record<MapFilterId, number>;
  localDisabled: boolean;
  trendingDisabled: boolean;
  onLocate: () => void;
  onRefresh: () => void;
  refreshDisabled: boolean;
  onSelectCafe: (cafe: CafeMapData) => void;
}) {
  const t = useTranslations('map.filters');
  const tMap = useTranslations('map');
  /* One panel at a time: the two hang from the same group, and both open at once covers
     the map they operate on. */
  const [openPanel, setOpenPanel] = useState<'search' | 'filter' | null>(null);
  const open = openPanel === 'filter';

  const filterLabel = active.size > 0 ? t('active', { count: active.size }) : t('label');

  return (
    <TooltipProvider delay={200}>
      <div className="relative">
        <div className="inline-flex -space-x-px">
          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={() => setOpenPanel((current) => (current === 'search' ? null : 'search'))}
              aria-expanded={openPanel === 'search'}
              aria-label={t('search')}
              className={`${GROUP_BUTTON} ${GROUP_START}`}
            >
              <SearchIcon size={16} />
            </TooltipTrigger>
            <TooltipContent>{t('search')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={() => setOpenPanel((current) => (current === 'filter' ? null : 'filter'))}
              aria-expanded={open}
              aria-label={filterLabel}
              className={`${GROUP_BUTTON} ${active.size > 0 ? 'relief-pressed bg-brand/12' : ''}`}
            >
              <FunnelIcon />
            </TooltipTrigger>
            <TooltipContent>{filterLabel}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={onLocate}
              disabled={localDisabled}
              aria-label={tMap('location_button')}
              className={GROUP_BUTTON}
            >
              <UserLocationIcon size={20} color="var(--marker-user)" />
            </TooltipTrigger>
            <TooltipContent>{tMap('location_button')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={onRefresh}
              disabled={refreshDisabled}
              aria-label={tMap('refresh_cafes')}
              className={`${GROUP_BUTTON} ${GROUP_END}`}
            >
              <RefreshIcon className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>{tMap('refresh_cafes')}</TooltipContent>
          </Tooltip>
        </div>

        {open && (
          <Panel className="absolute right-0 top-full z-(--z-map-chrome) mt-2">
            <ul>
              {MAP_FILTER_IDS.map((id) => {
                const selected = active.has(id);
                const disabled =
                  (id === 'local' && localDisabled) || (id === 'trending' && trendingDisabled);

                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onToggle(id)}
                      disabled={disabled}
                      aria-pressed={selected}
                      title={disabled ? t('local_needs_location') : undefined}
                      aria-disabled={disabled}
                      className="flex w-full items-center justify-between gap-3 rounded-(--radius-control) px-3 py-2.5 text-left hover:bg-surface-hover disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <span className="text-sm text-ink-primary">{t(id)}</span>
                      <span className="flex items-center gap-2">
                        <span className="landing-micro text-ink-secondary">{counts[id]}</span>
                        {/*
                          The mark, not the fill, is what says "on": a tinted box alone is
                          a colour carrying meaning, and the Matcha brand tint is too
                          quiet against the panel to be one.
                        */}
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-(--radius-control) border ${
                            selected ? 'border-brand bg-brand/12 text-ink-primary' : 'border-edge-rule text-transparent'
                          }`}
                        >
                          <CheckIcon size={12} />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        {openPanel === 'search' && (
          <Panel className="absolute right-0 top-full z-(--z-map-chrome) mt-2">
            <MapSearchPanel onSelect={(cafe) => { onSelectCafe(cafe); setOpenPanel(null); }} />
          </Panel>
        )}
      </div>
    </TooltipProvider>
  );
}

function MapSearchPanel({ onSelect }: { onSelect: (cafe: CafeMapData) => void }) {
  const t = useTranslations('map.filters');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CafeMapData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /*
    The search runs against every cafe, not only the pins the map has loaded, so a reader
    can look up a place they have not navigated to yet. Debounced, because it is one
    request per keystroke otherwise.
  */
  const term = query.trim();
  useEffect(() => {
    if (term.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      searchCafesByText(term).then((cafes) => {
        if (cancelled) return;
        setResults(
          cafes.map((cafe) => ({
            id: cafe.id || '',
            name: cafe.name || '',
            slug: cafe.slug,
            latitude: Number(cafe.latitude) || 0,
            longitude: Number(cafe.longitude) || 0,
            address: cafe.address || '',
            status: cafe.status || 'pending',
            verification_count: cafe.verification_count || 1,
            main_image: cafe.main_image,
            source_url: cafe.source_url,
            website: cafe.website,
            phoneNumber: cafe.phone,
            businessHours: cafe.business_hours,
          }))
        );
        setIsSearching(false);
      });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  const emptyMessage = useMemo(() => {
    if (term.length < 2) return t('search_hint');
    if (isSearching) return t('searching');
    if (results.length === 0) return t('no_results');
    return null;
  }, [term, isSearching, results.length, t]);

  return (
    <>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('search_placeholder')}
        className="h-11 w-full rounded-(--radius-control) border border-edge-rule bg-surface px-3 text-sm text-ink-primary placeholder:text-ink-secondary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      />
      <ul className="scrollbar-quiet mt-2 max-h-48 overflow-y-auto">
        {emptyMessage ? (
          <li className="px-3 py-6 text-center text-sm text-ink-secondary">{emptyMessage}</li>
        ) : (
          results.map((cafe) => (
            <li key={cafe.id}>
              <button
                type="button"
                onClick={() => onSelect(cafe)}
                className="w-full rounded-(--radius-control) px-3 py-2.5 text-left hover:bg-surface-hover"
              >
                <span className="block truncate text-sm text-ink-primary">{cafe.name}</span>
                <span className="block truncate text-xs text-ink-secondary">{cafe.address}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </>
  );
}

function FunnelIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 5h18M7 12h10M11 19h2" />
    </svg>
  );
}
