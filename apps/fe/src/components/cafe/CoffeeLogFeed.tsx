'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CoffeeLog } from '@/types/api';
import { getCafeLogs } from '@/lib/api/logs';
import CoffeeLogCard from './CoffeeLogCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CoffeeLogFeedProps {
  cafeId: string;
  initialLogs?: CoffeeLog[];
}

export default function CoffeeLogFeed({ cafeId, initialLogs = [] }: CoffeeLogFeedProps) {
  const t = useTranslations('cafe.log');
  const [logs, setLogs] = useState<CoffeeLog[]>(initialLogs);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLogs.length > 0) {
      setLogs(initialLogs);
      setPage(1);
      setHasMore(initialLogs.length >= 20);
    } else {
      // If no initial logs, fetch first page
      const fetchInitialLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await getCafeLogs(cafeId, 1);
          setLogs(response.logs);
          setPage(1);
          setHasMore(response.has_more);
        } catch (err) {
          setError(err instanceof Error ? err.message : t('error_loading_logs'));
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialLogs();
    }
  }, [cafeId, initialLogs, t]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const response = await getCafeLogs(cafeId, nextPage);
      
      if (response.logs.length > 0) {
        setLogs(prev => [...prev, ...response.logs]);
        setPage(nextPage);
        setHasMore(response.has_more);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_loading_logs'));
    } finally {
      setIsLoading(false);
    }
  };

  if (logs.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-cardTextSecondary)]">{t('no_logs_yet')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <CoffeeLogCard key={log.id} log={log} />
      ))}

      {error && (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primaryText)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                {t('loading')}
              </>
            ) : (
              t('load_more')
            )}
          </button>
        </div>
      )}
    </div>
  );
}

