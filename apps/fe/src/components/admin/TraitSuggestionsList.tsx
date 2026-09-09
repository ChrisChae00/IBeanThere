'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ExternalLink, MapPin } from 'lucide-react';
import { TraitSuggestion } from '@/types/api';
import { approveTraitSuggestion, getTraitSuggestions, rejectTraitSuggestion } from '@/lib/api/cafes';
import { deleteCafe } from '@/lib/api/admin';
import { revalidateCafe } from '@/app/actions/cafe';
import { Button, LoadingSpinner } from '@/shared/ui';

/*
  The queue for coffee-trait claims nobody witnessed.

  Two things land here, and they are the same kind of statement:

  - a reader pressing a button on a cafe page, who may never have been there;
  - a seeded row, researched from a website during the KW import, which carries the
    working that produced it in `evidence`.

  What does NOT land here is a claim with evidence behind it: registering a cafe means
  passing a 100m check while standing in it, and logging a purchase from inside the
  shop means the same check plus having bought the bag. Those write into the record
  directly, because a queue nobody drains is slower than no queue at all.

  Grouped by cafe rather than listed flat. A seeded cafe arrives with up to three
  claims at once and they are one decision, not three: the reviewer opens the website
  once, and answers for the whole place. The per-claim buttons stay for the case where
  two of the three are right.

  Approving updates the row in place, so the observer and the day they say they saw it
  survive review. Rejecting deletes it; it never counted, so there is nothing to undo.
*/

interface CafeGroup {
  cafeId: string;
  name: string;
  slug?: string;
  address?: string;
  website?: string;
  status?: string;
  sourceType?: string;
  latitude?: number;
  longitude?: number;
  suggestions: TraitSuggestion[];
}

function groupByCafe(suggestions: TraitSuggestion[]): CafeGroup[] {
  const groups = new Map<string, CafeGroup>();

  for (const suggestion of suggestions) {
    let group = groups.get(suggestion.cafe_id);
    if (!group) {
      group = {
        cafeId: suggestion.cafe_id,
        name: suggestion.cafe_name || suggestion.cafe_id,
        slug: suggestion.cafe_slug,
        address: suggestion.cafe_address,
        website: suggestion.cafe_website,
        status: suggestion.cafe_status,
        sourceType: suggestion.cafe_source_type,
        latitude: suggestion.cafe_latitude,
        longitude: suggestion.cafe_longitude,
        suggestions: [],
      };
      groups.set(suggestion.cafe_id, group);
    }
    group.suggestions.push(suggestion);
  }

  return [...groups.values()];
}

export default function TraitSuggestionsList() {
  const t = useTranslations('admin');
  const tTraits = useTranslations('cafe.traits');
  const params = useParams();
  const locale = params.locale as string;

  const [suggestions, setSuggestions] = useState<TraitSuggestion[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    getTraitSuggestions()
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, []);

  useEffect(load, [load]);

  const groups = useMemo(() => groupByCafe(suggestions || []), [suggestions]);

  const drop = (ids: string[]) =>
    setSuggestions((current) => (current || []).filter((s) => !ids.includes(s.id)));

  const act = async (id: string, approve: boolean) => {
    setBusy(id);
    try {
      await (approve ? approveTraitSuggestion(id) : rejectTraitSuggestion(id));
      drop([id]);
    } catch {
      load();
    } finally {
      setBusy(null);
    }
  };

  /* One decision, applied to every claim on the cafe. Sequential rather than parallel:
     the queue is tens of rows, and a half-applied batch is worse than a slow one. */
  const approveAll = async (group: CafeGroup) => {
    setBusy(group.cafeId);
    const done: string[] = [];
    try {
      for (const suggestion of group.suggestions) {
        await approveTraitSuggestion(suggestion.id);
        done.push(suggestion.id);
      }
      drop(done);
    } catch {
      load();
    } finally {
      setBusy(null);
    }
  };

  /* The cafe does not belong on the map at all. Its claims cascade with it, so there is
     nothing left to reject afterwards. Only offered for a cafe still waiting to be
     verified -- an established one is somebody's record by now. */
  const removeCafe = async (group: CafeGroup) => {
    if (!confirm(t('seed_delete_confirm', { name: group.name }))) return;
    setBusy(group.cafeId);
    try {
      await deleteCafe(group.cafeId);
      await revalidateCafe(group.cafeId);
      drop(group.suggestions.map((s) => s.id));
    } catch {
      load();
    } finally {
      setBusy(null);
    }
  };

  if (suggestions === null) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-textSecondary">{t('trait_suggestions_hint')}</p>

      {groups.length === 0 ? (
        <p className="py-12 text-center text-sm text-textSecondary">
          {t('trait_suggestions_empty')}
        </p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => {
            const unverified = group.status === 'pending';
            const seeded = group.suggestions.some((s) => s.source === 'seed');

            return (
              <li
                key={group.cafeId}
                className="rounded-(--radius-card) border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/${locale}/cafes/${group.slug || group.cafeId}`}
                      className="block truncate text-sm font-medium text-text hover:underline"
                    >
                      {group.name}
                    </Link>
                    {group.address && (
                      <p className="truncate text-sm text-textSecondary">{group.address}</p>
                    )}
                    {/* The two links that answer "is this claim true": the shop's own
                        page, and where it stands. Checking a bean claim without them
                        means leaving the queue and coming back. */}
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      {group.website && (
                        <a
                          href={group.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 landing-micro text-textSecondary hover:text-text"
                        >
                          <ExternalLink size={12} />
                          {t('seed_open_website')}
                        </a>
                      )}
                      {/* Name and address, never bare coordinates: a coordinate query
                          opens a pin captioned 43°27'09.5"N with an "Add a missing
                          place" button, which tells a reviewer nothing about whether
                          the shop is real or what it sells. */}
                      {(group.address || (group.latitude != null && group.longitude != null)) && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${group.name}, ${group.address || `${group.latitude},${group.longitude}`}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 landing-micro text-textSecondary hover:text-text"
                        >
                          <MapPin size={12} />
                          {t('seed_open_map')}
                        </a>
                      )}
                      {seeded && (
                        <span className="landing-micro text-textSecondary">
                          {t('seed_researched')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {unverified && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeCafe(group)}
                        disabled={busy === group.cafeId}
                      >
                        {t('seed_delete_cafe')}
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => approveAll(group)}
                      loading={busy === group.cafeId}
                    >
                      {t('seed_approve_all', { count: group.suggestions.length })}
                    </Button>
                  </div>
                </div>

                <ul className="mt-3 space-y-2 border-t border-edge-rule pt-3">
                  {group.suggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      className="flex flex-wrap items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-text">
                          {tTraits(suggestion.trait)} ·{' '}
                          {t(suggestion.value ? 'suggests_yes' : 'suggests_no')}
                        </p>
                        {/* The free text being submitted for publication. An admin
                            approving without seeing it is approving nothing in
                            particular. */}
                        {suggestion.note && (
                          <p className="mt-1 text-sm text-text">“{suggestion.note}”</p>
                        )}
                        {/* Why the claim was made. Never shown to a reader. */}
                        {suggestion.evidence && (
                          <p className="mt-1 text-sm text-textSecondary">
                            {suggestion.evidence}
                          </p>
                        )}
                        <p className="landing-micro text-textSecondary">
                          {suggestion.username ? `@${suggestion.username} · ` : ''}
                          {suggestion.observed_at}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => act(suggestion.id, false)}
                          disabled={busy === suggestion.id || busy === group.cafeId}
                        >
                          {t('reject')}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => act(suggestion.id, true)}
                          loading={busy === suggestion.id}
                          disabled={busy === group.cafeId}
                        >
                          {t('approve')}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
