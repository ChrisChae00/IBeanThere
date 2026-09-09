'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CafeBeanEntry, CafeBeansResponse } from '@/types/api';
import { getCafeBeans } from '@/lib/api/cafes';

/*
  Which beans people met here.

  Two lists, never merged: a bag bought here is not a promise the cafe brews it, and
  a cup poured here is not a promise you can take one home. Collapsing them would let
  the page answer a question nobody asked.

  Both are derived from public logs only, and derived is all they are -- there is no
  table anyone writes "this cafe has this bean" into, because such a table would need
  a `user_id` and would then be a path for a private log to leak its author. Nothing
  here names a person.
*/

function BeanList({ title, entries, emptyLabel }: {
  title: string;
  entries: CafeBeanEntry[];
  emptyLabel: string;
}) {
  const t = useTranslations('cafe.beans');
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-ink-secondary">{title}</h3>
      {entries.length === 0 ? (
        <p className="landing-micro text-ink-secondary">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.bean_id}>
              <span className="block truncate text-sm text-ink-primary">
                {entry.name}
                {entry.roaster_name && ` · ${entry.roaster_name}`}
              </span>
              <span className="landing-micro block text-ink-secondary">
                {t('last_seen', { date: entry.last_seen_at.slice(0, 10) })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CafeBeansRecent({ cafeId }: { cafeId: string }) {
  const t = useTranslations('cafe.beans');
  const [beans, setBeans] = useState<CafeBeansResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCafeBeans(cafeId)
      .then((data) => !cancelled && setBeans(data))
      .catch(() => !cancelled && setBeans({ drink: [], purchase: [] }));
    return () => {
      cancelled = true;
    };
  }, [cafeId]);

  if (!beans) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <BeanList title={t('drink_title')} entries={beans.drink} emptyLabel={t('empty')} />
      <BeanList title={t('purchase_title')} entries={beans.purchase} emptyLabel={t('empty')} />
    </div>
  );
}
