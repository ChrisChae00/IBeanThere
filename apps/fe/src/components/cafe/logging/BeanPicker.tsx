'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bean, BeanRef, Roaster } from '@/types/api';
import { createBean, createRoaster, getRoasterBeans, searchRoasters } from '@/lib/api/beans';

/*
  Which bean this log is about, chosen in two steps: roaster, then bean.

  Deliberately not a `<datalist>`. A datalist links by matching text, which means
  typing "Detour" and stopping links you to whichever Detour the browser guessed --
  and two roasters really can share a name in two cities. Here the candidate rows are
  buttons: a link exists only where somebody pressed one. Typing without pressing
  leaves the text in `bean_name_raw`, which is a smaller claim and an honest one.

  What is picked is held above, so the form can send `bean_id: null` to unlink.
*/

export interface BeanSelection {
  roaster: Roaster | null;
  bean: Bean | BeanRef | null;
  /* What was typed but not linked. Sent as `bean_name_raw`. */
  beanText: string;
}

export const EMPTY_SELECTION: BeanSelection = { roaster: null, bean: null, beanText: '' };

const INPUT =
  'w-full rounded-(--radius-control) border border-edge-rule bg-surface-raised px-3 py-2.5 text-ink-primary placeholder:text-ink-secondary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand';

function Chosen({ label, detail, onClear, clearLabel }: {
  label: string;
  detail?: string;
  onClear: () => void;
  clearLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-(--radius-control) border border-edge-rule bg-surface-raised px-3 py-2.5">
      <span className="min-w-0">
        <span className="block truncate text-sm text-ink-primary">{label}</span>
        {detail && <span className="landing-micro block truncate text-ink-secondary">{detail}</span>}
      </span>
      <button
        type="button"
        onClick={onClear}
        aria-label={clearLabel}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-(--radius-control) text-ink-secondary hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function CandidateRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="control-flat w-full px-3 py-2.5 text-left"
      >
        {children}
      </button>
    </li>
  );
}

export default function BeanPicker({
  value,
  onChange,
}: {
  value: BeanSelection;
  onChange: (next: BeanSelection) => void;
}) {
  const t = useTranslations('cafe.log');
  const [roasterQuery, setRoasterQuery] = useState('');
  const [roasterResults, setRoasterResults] = useState<Roaster[]>([]);
  const [beanQuery, setBeanQuery] = useState('');
  const [beanResults, setBeanResults] = useState<Bean[]>([]);
  const [busy, setBusy] = useState(false);

  const roasterTerm = roasterQuery.trim();
  useEffect(() => {
    if (value.roaster || roasterTerm.length < 2) {
      setRoasterResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      searchRoasters(roasterTerm)
        .then((rows) => !cancelled && setRoasterResults(rows))
        .catch(() => !cancelled && setRoasterResults([]));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [roasterTerm, value.roaster]);

  const roasterId = value.roaster?.id;
  const beanTerm = beanQuery.trim();
  useEffect(() => {
    if (!roasterId || value.bean) {
      setBeanResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      getRoasterBeans(roasterId, beanTerm)
        .then((rows) => !cancelled && setBeanResults(rows))
        .catch(() => !cancelled && setBeanResults([]));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [roasterId, beanTerm, value.bean]);

  const addRoaster = async () => {
    if (!roasterTerm || busy) return;
    setBusy(true);
    try {
      const roaster = await createRoaster(roasterTerm);
      onChange({ ...value, roaster });
      setRoasterQuery('');
    } finally {
      setBusy(false);
    }
  };

  const addBean = async () => {
    if (!roasterId || !beanTerm || busy) return;
    setBusy(true);
    try {
      const bean = await createBean(roasterId, beanTerm);
      onChange({ ...value, bean, beanText: '' });
      setBeanQuery('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink-secondary" htmlFor="bean-picker-roaster">
          {t('roaster')}
        </label>
        {value.roaster ? (
          <Chosen
            label={value.roaster.name}
            detail={value.roaster.city}
            clearLabel={t('roaster_clear')}
            /* Clearing the roaster clears the bean too: a bean belongs to one
               roaster, so keeping it would leave the log pointing at a bean the
               reader is no longer claiming. */
            onClear={() => {
              onChange(EMPTY_SELECTION);
              setBeanQuery('');
            }}
          />
        ) : (
          <>
            <input
              id="bean-picker-roaster"
              value={roasterQuery}
              onChange={(event) => setRoasterQuery(event.target.value)}
              placeholder={t('roaster_placeholder')}
              className={INPUT}
            />
            {roasterTerm.length >= 2 && (
              <ul className="space-y-1">
                {roasterResults.map((roaster) => (
                  <CandidateRow key={roaster.id} onClick={() => { onChange({ ...value, roaster }); setRoasterQuery(''); }}>
                    <span className="block truncate text-sm">{roaster.name}</span>
                    {roaster.city && <span className="landing-micro block truncate text-ink-secondary">{roaster.city}</span>}
                  </CandidateRow>
                ))}
                <CandidateRow onClick={addRoaster}>
                  <span className="block truncate text-sm">{t('roaster_new', { name: roasterTerm })}</span>
                  <span className="landing-micro block text-ink-secondary">{t('catalogue_note')}</span>
                </CandidateRow>
              </ul>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink-secondary" htmlFor="bean-picker-bean">
          {t('bean_name')}
        </label>
        {value.bean ? (
          <Chosen
            label={value.bean.name}
            detail={value.roaster?.name}
            clearLabel={t('bean_clear')}
            onClear={() => onChange({ ...value, bean: null, beanText: '' })}
          />
        ) : (
          <>
            <input
              id="bean-picker-bean"
              value={beanQuery}
              onChange={(event) => {
                setBeanQuery(event.target.value);
                /* Unlinked text is still worth keeping: "that Ethiopian one" on the
                   bag is more than nothing, and it is not a claim about a catalogue
                   row. */
                onChange({ ...value, beanText: event.target.value });
              }}
              placeholder={t('bean_name_placeholder')}
              className={INPUT}
            />
            {roasterId && beanTerm.length >= 1 && (
              <ul className="space-y-1">
                {beanResults.map((bean) => (
                  <CandidateRow key={bean.id} onClick={() => { onChange({ ...value, bean, beanText: '' }); setBeanQuery(''); }}>
                    <span className="block truncate text-sm">{bean.name}</span>
                    {bean.origin && <span className="landing-micro block truncate text-ink-secondary">{bean.origin}</span>}
                  </CandidateRow>
                ))}
                <CandidateRow onClick={addBean}>
                  <span className="block truncate text-sm">{t('bean_new', { name: beanTerm })}</span>
                  <span className="landing-micro block text-ink-secondary">{t('catalogue_note')}</span>
                </CandidateRow>
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
