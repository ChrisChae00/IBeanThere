/**
 * Public landing-page counts. Unauthenticated, aggregate only.
 */

import { API_BASE_URL } from './client';

export type CafeStatsPoint = {
  /** Monday of the bucket, ISO date. */
  week: string;
  cumulative: number;
};

export type CafeStats = {
  total_cafes: number;
  verified_cafes: number;
  beans_dropped: number;
  series: CafeStatsPoint[];
};

/**
 * The landing page renders whether or not the API answers, so a failure here is
 * `null` and the caller shows its own resting state rather than an error.
 */
export async function getCafeStats(): Promise<CafeStats | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cafes/stats`, {
      // The server already caches for five minutes; this keeps the SSR render
      // from re-fetching on every request without going stale for a whole day.
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return (await response.json()) as CafeStats;
  } catch {
    return null;
  }
}
