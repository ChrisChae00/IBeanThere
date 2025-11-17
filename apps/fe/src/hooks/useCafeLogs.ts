import { useState, useEffect, useCallback } from 'react';
import { CoffeeLog, CafeLogsResponse } from '@/types/api';
import { getCafeLogs } from '@/lib/api/logs';

interface UseCafeLogsReturn {
  logs: CoffeeLog[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCafeLogs(cafeId: string, initialLogs?: CoffeeLog[]): UseCafeLogsReturn {
  const [logs, setLogs] = useState<CoffeeLog[]>(initialLogs || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLogs && initialLogs.length > 0) {
      setLogs(initialLogs);
      setPage(1);
      setHasMore(initialLogs.length >= 20);
    }
  }, [initialLogs]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const response: CafeLogsResponse = await getCafeLogs(cafeId, nextPage);
      
      if (response.logs.length > 0) {
        setLogs(prev => [...prev, ...response.logs]);
        setPage(nextPage);
        setHasMore(response.has_more);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  }, [cafeId, page, isLoading, hasMore]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPage(1);

    try {
      const response: CafeLogsResponse = await getCafeLogs(cafeId, 1);
      setLogs(response.logs);
      setHasMore(response.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh logs');
    } finally {
      setIsLoading(false);
    }
  }, [cafeId]);

  return {
    logs,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

