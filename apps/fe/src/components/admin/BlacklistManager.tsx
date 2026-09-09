'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { API_BASE_URL, apiFetch, getAuthHeaders, handleResponse } from '@/lib/api/client';

type Entry = { id?: string; user_id?: string; name?: string; address?: string; latitude?: number; longitude?: number; osm_id?: string; google_place_id?: string; deleted_at?: string; status?: string; reason?: string };

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  return handleResponse<T>(await apiFetch(`${API_BASE_URL}/api/v1/admin/blacklists/${path}`, {
    method, headers: await getAuthHeaders(), cache: 'no-store',
    ...(body ? { body: JSON.stringify(body) } : {}),
  }));
}

export default function BlacklistManager({ kind }: { kind: 'cafes' | 'users' }) {
  const t = useTranslations('admin');
  const [rows, setRows] = useState<Entry[]>([]);
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('watch');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    request<Entry[]>(`${kind}?page=${page}`).then(data => {
      if (!cancelled) setRows(data);
    }).catch(() => { if (!cancelled) setError(t('error_fetching')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [kind, page, version, t]);

  async function act(path: string, method: string, body?: unknown) {
    setBusy(true);
    setError('');
    try {
      await request(path, method, body);
      setVersion(v => v + 1);
    } catch {
      setError(t('blacklist_error'));
    } finally { setBusy(false); }
  }

  return <div className="space-y-4">
    <p>{t(kind === 'cafes' ? 'cafe_blacklist_hint' : 'user_blacklist_hint')}</p>
    {kind === 'users' && <form className="flex flex-wrap gap-3" onSubmit={event => {
      event.preventDefault();
      if (window.confirm(t('confirm_user_decision'))) void act(`users/${encodeURIComponent(userId.trim())}`, 'PUT', { status, reason: reason.trim() });
    }}>
      <label>{t('user_id')}<input className="block border rounded p-2 bg-surface" required value={userId} onChange={e => setUserId(e.target.value)} pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" /></label>
      <label>{t('reason')}<input className="block border rounded p-2 bg-surface" required maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /></label>
      <label>{t('status_filter')}<select className="block border rounded p-2 bg-surface" value={status} onChange={e => setStatus(e.target.value)}><option value="watch">{t('watch')}</option><option value="blocked">{t('blocked')}</option></select></label>
      <button className="border rounded px-4 min-h-11" disabled={busy} type="submit">{t('save')}</button>
    </form>}
    {error && <p role="alert" className="text-error">{error} <button onClick={() => setVersion(v => v + 1)}>{t('retry')}</button></p>}
    {loading ? <p role="status">{t('loading')}</p> : <ul className="space-y-3">
      {!rows.length && <li>{t('blacklist_empty')}</li>}
      {rows.map(row => <li key={row.id || row.user_id} className="border rounded p-4 space-y-2">
        <p className="font-semibold break-all">{row.name || row.user_id}</p>
        {kind === 'cafes' ? <>
          <p>{row.address}</p><p>{row.latitude}, {row.longitude}</p>
          <p className="break-all">{row.osm_id && `OSM: ${row.osm_id}`} {row.google_place_id && `Google: ${row.google_place_id}`}</p>
          <time>{row.deleted_at}</time>
        </> : <p>{t(row.status === 'blocked' ? 'blocked' : 'watch')}: {row.reason}</p>}
        {kind === 'users' && <button disabled={busy} className="border rounded px-3 min-h-11 mr-2" onClick={() => { setUserId(row.user_id!); setReason(row.reason || ''); setStatus(row.status || 'watch'); }}>{t('edit')}</button>}
        <button className="border rounded px-3 min-h-11" disabled={busy} onClick={() => {
          if (window.confirm(t('confirm_blacklist_remove'))) void act(`${kind}/${row.id || row.user_id}`, 'DELETE');
        }}>{t('remove_blacklist')}</button>
      </li>)}
    </ul>}
    <div className="flex gap-4"><button disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>{t('previous')}</button><span>{page}</span><button disabled={rows.length < 50 || loading} onClick={() => setPage(p => p + 1)}>{t('next')}</button></div>
  </div>;
}
