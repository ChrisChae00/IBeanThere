'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { getMyLogs, deleteLog, updateLog } from '@/lib/api/logs';
import { CoffeeLog, LogFormData } from '@/types/api';
import CoffeeLogCard from '@/components/cafe/CoffeeLogCard';
import CoffeeLogForm from '@/components/cafe/CoffeeLogForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';

type FilterType = 'all' | 'public' | 'private';

export default function MyLogsPage() {
  const t = useTranslations('cafe.log');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isLoading: authLoading } = useAuth();
  const [logs, setLogs] = useState<CoffeeLog[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<CoffeeLog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(`/${locale}/signin`);
      return;
    }

    fetchLogs();
  }, [user, authLoading, router, locale]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const myLogs = await getMyLogs();
      setLogs(myLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_loading_logs'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm(t('confirm_delete'))) return;

    try {
      await deleteLog(logId);
      setLogs(prev => prev.filter(log => log.id !== logId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_deleting_log'));
    }
  };

  const handleEdit = (log: CoffeeLog) => {
    setEditingLog(log);
  };

  const handleUpdate = async (data: LogFormData) => {
    if (!editingLog) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateLog(editingLog.id, data);
      await fetchLogs();
      setEditingLog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_updating_log'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'public') return log.is_public;
    if (filter === 'private') return !log.is_public;
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-cardText)] mb-2">
          {t('my_logs')}
        </h1>
        <p className="text-[var(--color-cardTextSecondary)]">
          {t('my_logs_description')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--color-border)]">
        {(['all', 'public', 'private'] as FilterType[]).map((filterType) => {
          const translationKey = filterType === 'public' ? 'filter_public' : 
            filterType === 'private' ? 'filter_private' : filterType;
          return (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === filterType
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-cardTextSecondary)] hover:text-[var(--color-cardText)]'
              }`}
            >
              {t(translationKey)}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} />
        </div>
      )}

      {/* Edit Form */}
      {editingLog && (
        <div className="mb-8 p-6 bg-[var(--color-cardBackground)] rounded-lg border border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-cardText)] mb-4">
            {t('edit_log')}
          </h2>
          <CoffeeLogForm
            initialData={editingLog}
            onSubmit={handleUpdate}
            onCancel={() => setEditingLog(null)}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-cardTextSecondary)]">
            {t('no_logs_found')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <CoffeeLogCard
              key={log.id}
              log={log}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

