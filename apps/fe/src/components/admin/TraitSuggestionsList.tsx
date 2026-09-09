'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TraitSuggestion } from '@/types/api';
import { approveTraitSuggestion, getTraitSuggestions, rejectTraitSuggestion } from '@/lib/api/cafes';
import { Button, LoadingSpinner } from '@/shared/ui';

/*
  The queue for coffee-trait changes suggested from cafe pages.

  Only that one surface lands here. Registering a cafe means passing a 100m check
  while standing in it, and logging a bean purchase means having just bought the bag;
  both write into the record directly, because a queue nobody drains is slower than
  no queue at all and those two do not need the protection. What arrives here is the
  claim with no evidence behind it -- someone who may never have been to the place.

  Approving updates the row in place, so the observer and the day they say they saw it
  survive review. Rejecting deletes it; it never counted, so there is nothing to undo.
*/
export default function TraitSuggestionsList() {
  const t = useTranslations('admin');
  const tTraits = useTranslations('cafe.traits');
  const params = useParams();
  const locale = params.locale as string;

  const [suggestions, setSuggestions] = useState<TraitSuggestion[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    getTraitSuggestions()
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, []);

  useEffect(load, [load]);

  const act = async (id: string, approve: boolean) => {
    setBusyId(id);
    try {
      await (approve ? approveTraitSuggestion(id) : rejectTraitSuggestion(id));
      setSuggestions((current) => (current || []).filter((s) => s.id !== id));
    } catch {
      load();
    } finally {
      setBusyId(null);
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

      {suggestions.length === 0 ? (
        <p className="py-12 text-center text-sm text-textSecondary">
          {t('trait_suggestions_empty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-(--radius-card) border border-border p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/${locale}/cafes/${suggestion.cafe_slug || suggestion.cafe_id}`}
                  className="block truncate text-sm font-medium text-text hover:underline"
                >
                  {suggestion.cafe_name || suggestion.cafe_id}
                </Link>
                <p className="text-sm text-textSecondary">
                  {tTraits(suggestion.trait)} ·{' '}
                  {t(suggestion.value ? 'suggests_yes' : 'suggests_no')}
                </p>
                {/* The free text being submitted for publication. An admin approving
                    without seeing it is approving nothing in particular. */}
                {suggestion.note && (
                  <p className="mt-1 text-sm text-text">“{suggestion.note}”</p>
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
                  disabled={busyId === suggestion.id}
                >
                  {t('reject')}
                </Button>
                <Button
                  type="button"
                  onClick={() => act(suggestion.id, true)}
                  loading={busyId === suggestion.id}
                >
                  {t('approve')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
