import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Class merger used by every shadcn-generated primitive. Lives at `@/lib/cn`
 * rather than `@/lib/utils` so it stays a single-purpose module — `lib/utils`
 * is already a directory of unrelated helpers in this repo.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
