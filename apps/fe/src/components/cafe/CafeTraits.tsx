'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TraitSummary } from '@/types/api';
import { getCafeTraits, suggestTraitObservation } from '@/lib/api/cafes';
import { Button, FlipText, Modal } from '@/shared/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';

/*
  What people report about this cafe's coffee.

  A reading surface, not an editing one. The buttons that used to sit here made the
  top of a page most people only read into a form, and they took a claim from anyone
  who happened to open it -- including someone who has never been to the place. Now
  the page states what is known, and changing it is a request that a person reviews.

  The two surfaces that carry evidence do not come through here: registering a cafe
  means passing a 100m check inside it, and logging a bean purchase means having just
  bought the bag. Both write straight into the record.

  Three claims, each an observation with a date, not a verdict. A shop that stopped
  selling bags last month was not wrong about last year, so the wording is always
  "last seen", never "verified".

  Fetched here rather than carried in the page payload: a cached answer to "can I buy
  beans here" is the one kind of stale that sends someone across town.
*/

/*
  Reading order, and it is not arbitrary: the two that carry a note come first. "Yes,
  and here is which" is a fuller answer than a bare yes, and someone scanning for
  somewhere to buy coffee wants those two before the roasting question.
*/
const TRAITS = ['sells_beans', 'filter_coffee', 'roasts_on_site'] as const;

/* Only these two have a follow-up worth asking. */
const NOTE_TRAITS: readonly string[] = ['sells_beans', 'filter_coffee'];

const NOTE_MAX = 200;

/* Same width whatever the word: "Yes" is shorter than "No" in some languages and
   longer in others, and a pair of buttons that change size between them reads as two
   different controls. */
const CHOICE = 'control-flat min-h-11 w-16 text-sm';

export default function CafeTraits({ cafeId }: { cafeId: string }) {
  const t = useTranslations('cafe.traits');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const { showToast } = useToast();

  const [summaries, setSummaries] = useState<TraitSummary[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, boolean | undefined>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCafeTraits(cafeId)
      .then((rows) => !cancelled && setSummaries(rows))
      .catch(() => !cancelled && setSummaries([]));
    return () => {
      cancelled = true;
    };
  }, [cafeId]);

  const byTrait = (trait: string) => summaries?.find((summary) => summary.trait === trait);

  const openForm = () => {
    if (!user) {
      router.push(`/${locale}/signin`);
      return;
    }
    /* Start from what the page says, so the form is a correction rather than a blank
       questionnaire -- a reader here is usually changing one of three, not all three. */
    setDraft(
      Object.fromEntries(
        TRAITS.map((trait) => [trait, byTrait(trait)?.latest_value ?? undefined])
      )
    );
    setNotes(
      Object.fromEntries(TRAITS.map((trait) => [trait, byTrait(trait)?.note ?? '']))
    );
    setFormOpen(true);
  };

  const submit = async () => {
    // A changed note is a change too: someone correcting "Detour" to "Detour, rotating
    // single origin" has not touched the yes, and sending nothing would look broken.
    const changed = TRAITS.filter((trait) => {
      const summary = byTrait(trait);
      const answerChanged =
        draft[trait] !== undefined && draft[trait] !== (summary?.latest_value ?? undefined);
      const noteChanged =
        draft[trait] === true && (notes[trait] || '').trim() !== (summary?.note ?? '');
      return answerChanged || noteChanged;
    });
    if (changed.length === 0) {
      setFormOpen(false);
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        changed.map((trait) =>
          suggestTraitObservation(
            cafeId,
            trait,
            draft[trait] as boolean,
            draft[trait] === true ? (notes[trait] || '').trim() || undefined : undefined
          )
        )
      );
      setFormOpen(false);
      showToast(t('suggestion_sent'), 'success');
    } catch {
      showToast(t('save_failed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  /*
    One line per trait, in this order: what people said, then -- only when nobody has --
    what the seed said. Keeping them apart is the point: "we filled this in from a
    spreadsheet" must never read as "three visitors confirmed it".
  */
  const status = (summary?: TraitSummary) => {
    if (summary?.latest_value === true && summary.last_observed_at) {
      return t('status_yes', { date: summary.last_observed_at, count: summary.yes });
    }
    if (summary?.latest_value === false && summary.last_observed_at) {
      return t('status_no', { date: summary.last_observed_at });
    }
    if (summary?.seed_value === true && summary.seed_observed_at) {
      return t('status_seed', { date: summary.seed_observed_at });
    }
    /* Not "nobody has said yet". That reports a fact and asks for nothing -- and an
       empty answer here is why the map's bean filter has nothing to show. */
    return t('status_unknown');
  };

  if (summaries === null) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        {/* Sized like "Coffee Logs" below it, because it is the same kind of thing:
            the name of a section, not a label inside one. */}
        <h2 className="text-xl font-bold text-ink-primary">{t('title')}</h2>
        {/*
          `border-b`, not the `underline` utility. `text-decoration` from an ancestor
          does not paint across `inline-block` descendants, and every letter in
          FlipText is one -- so the underline simply vanished.
        */}
        <button
          type="button"
          onClick={openForm}
          className="flip-host landing-micro shrink-0 border-b border-current pb-0.5 text-ink-secondary hover:text-ink-primary"
        >
          <FlipText>{t('suggest')}</FlipText>
        </button>
      </div>
      <div className="h-px bg-brand" />

      <ul className="space-y-2">
        {TRAITS.map((trait) => {
          const summary = byTrait(trait);
          const known = summary?.latest_value ?? summary?.seed_value ?? null;
          return (
            <li key={trait} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm text-ink-primary">{t(trait)}</span>
                {/* Which beans, which method. The answer to the question the yes
                    provokes, so it sits above the date rather than after it. */}
                {summary?.note && (
                  <span className="block text-sm text-ink-secondary">{summary.note}</span>
                )}
                <span className="landing-micro block text-ink-secondary">{status(summary)}</span>
              </span>
              {/* The answer, as a word. Nothing to press, so nothing moves when the
                  status line beside it grows. */}
              <span
                className={`landing-micro shrink-0 ${known === null ? 'text-ink-secondary' : 'text-ink-primary'}`}
              >
                {known === null ? '—' : t(known ? 'yes' : 'no')}
              </span>
            </li>
          );
        })}
      </ul>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('suggest_title')}
        description={t('suggest_description')}
        footer={
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setFormOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="button" className="flex-1" loading={saving} onClick={submit}>
              {t('suggest_submit')}
            </Button>
          </div>
        }
      >
        <ul className="space-y-4">
          {TRAITS.map((trait) => {
            const remaining = NOTE_MAX - (notes[trait] || '').length;
            return (
              <li key={trait} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 text-sm text-ink-primary">{t(trait)}</span>
                  <span className="inline-flex shrink-0 -space-x-px">
                    {[true, false].map((value, index) => (
                      <button
                        key={String(value)}
                        type="button"
                        aria-pressed={draft[trait] === value}
                        /* Pressing the chosen one takes it back, so a trait you did not
                           mean to answer can be left out of the request entirely. */
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            [trait]: current[trait] === value ? undefined : value,
                          }))
                        }
                        className={`${CHOICE} ${
                          index === 0 ? 'rounded-l-(--radius-pill)' : 'rounded-r-(--radius-pill)'
                        } ${draft[trait] === value ? 'is-active' : ''}`}
                      >
                        {t(value ? 'yes' : 'no')}
                      </button>
                    ))}
                  </span>
                </div>

                {/*
                  Only under a yes, and only on the two traits where there is a next
                  question. "No, and here is which beans" is not a sentence, and an
                  empty box under a no is an invitation to write something else.
                */}
                {draft[trait] === true && NOTE_TRAITS.includes(trait) && (
                  <div>
                    <input
                      value={notes[trait] || ''}
                      maxLength={NOTE_MAX}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [trait]: event.target.value }))
                      }
                      placeholder={t(`${trait}_note_placeholder`)}
                      aria-label={t(`${trait}_note_placeholder`)}
                      className="min-h-11 w-full rounded-(--radius-control) border border-edge-rule bg-surface px-3 text-sm text-ink-primary placeholder:text-ink-secondary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
                    />
                    {/* Shown only as it starts to matter: a counter on an empty field
                        is a limit announced before anyone has approached it. */}
                    {remaining <= 40 && (
                      <p className="landing-micro mt-1 text-right text-ink-secondary">{remaining}</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}
