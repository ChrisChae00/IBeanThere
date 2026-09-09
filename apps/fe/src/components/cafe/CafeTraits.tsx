'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TraitSummary } from '@/types/api';
import { clearTraitObservation, getCafeTraits, setTraitObservation } from '@/lib/api/cafes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';

/*
  What people report about this cafe's coffee.

  Three claims, and each one is an observation with a date, not a verdict. A shop
  that stopped selling bags last month is not wrong about last year -- so the wording
  is always "last seen", never "verified", and a newer "no" simply supersedes an
  older "yes" rather than proving anyone wrong.

  Fetched here rather than carried in the page payload: the numbers change the moment
  somebody presses a button, including this reader's own press, and a cached answer
  to "can I buy beans here" is the one kind of stale that sends someone across town.
*/

const TRAITS = ['sells_beans', 'roasts_on_site', 'filter_coffee'] as const;

export default function CafeTraits({ cafeId }: { cafeId: string }) {
  const t = useTranslations('cafe.traits');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const { showToast } = useToast();

  const [summaries, setSummaries] = useState<TraitSummary[] | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCafeTraits(cafeId)
      .then((rows) => !cancelled && setSummaries(rows))
      .catch(() => !cancelled && setSummaries([]));
    return () => {
      cancelled = true;
    };
  }, [cafeId]);

  const byTrait = (trait: string) =>
    summaries?.find((summary) => summary.trait === trait);

  const press = async (trait: string, value: boolean) => {
    if (!user) {
      router.push(`/${locale}/signin`);
      return;
    }
    if (pending) return;

    const current = byTrait(trait);
    /* Pressing what you already said withdraws it. Anything else would leave a
       reader who mis-tapped with no way back except saying the opposite. */
    const withdrawing = current?.mine === value;

    setPending(trait);
    try {
      const next = withdrawing
        ? await clearTraitObservation(cafeId, trait)
        : await setTraitObservation(cafeId, trait, value);
      setSummaries(next);
    } catch {
      showToast(t('save_failed'), 'error');
      getCafeTraits(cafeId).then(setSummaries).catch(() => {});
    } finally {
      setPending(null);
    }
  };

  /*
    One line of status per trait, in this order: what people said, then -- only when
    nobody has -- what the seed said. Keeping them apart is the point: "we filled
    this in from a spreadsheet" must never read as "three visitors confirmed it".
  */
  const status = (summary?: TraitSummary) => {
    if (!summary) return t('status_unknown');
    if (summary.latest_value === true && summary.last_observed_at) {
      return t('status_yes', { date: summary.last_observed_at, count: summary.yes });
    }
    if (summary.latest_value === false && summary.last_observed_at) {
      return t('status_no', { date: summary.last_observed_at });
    }
    if (summary.seed_value === true && summary.seed_observed_at) {
      return t('status_seed', { date: summary.seed_observed_at });
    }
    return t('status_unknown');
  };

  if (summaries === null) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-ink-secondary">{t('title')}</h2>
      <ul className="space-y-2">
        {TRAITS.map((trait) => {
          const summary = byTrait(trait);
          return (
            <li key={trait} className="flex flex-wrap items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm text-ink-primary">{t(trait)}</span>
                <span className="landing-micro block text-ink-secondary">{status(summary)}</span>
              </span>
              <span className="inline-flex -space-x-px">
                {[true, false].map((value, index) => (
                  <button
                    key={String(value)}
                    type="button"
                    disabled={pending === trait}
                    aria-pressed={summary?.mine === value}
                    onClick={() => press(trait, value)}
                    className={`control-flat min-h-11 px-3 text-sm ${
                      index === 0 ? 'rounded-l-(--radius-pill)' : 'rounded-r-(--radius-pill)'
                    } ${summary?.mine === value ? 'is-active' : ''}`}
                  >
                    {t(value ? 'yes' : 'no')}
                  </button>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
