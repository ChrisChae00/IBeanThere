import { useState, useCallback } from 'react';
import { LogFormData, CoffeeLog } from '@/types/api';
import { createLog, updateLog } from '@/lib/api/logs';

interface UseLogFormReturn {
  isSubmitting: boolean;
  error: string | null;
  submitLog: (cafeId: string, data: LogFormData) => Promise<CoffeeLog>;
  updateLogData: (visitId: string, data: LogFormData) => Promise<CoffeeLog>;
}

export function useLogForm(): UseLogFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLog = useCallback(async (cafeId: string, data: LogFormData): Promise<CoffeeLog> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createLog(cafeId, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit log';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateLogData = useCallback(async (visitId: string, data: LogFormData): Promise<CoffeeLog> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateLog(visitId, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update log';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    error,
    submitLog,
    updateLogData,
  };
}

