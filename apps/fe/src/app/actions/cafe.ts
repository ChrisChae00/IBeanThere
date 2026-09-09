'use server';

import { revalidateTag } from 'next/cache';

/*
  Drop the cached cafe payload after somebody changes what it says.

  The cafe page is fetched with `revalidate: 120`, which is right for a page mostly
  made of address and opening hours -- but the log count, the average rating and the
  recent logs on it are things the reader just changed. Without this, saving a log
  lands you back on a page reporting "0 logs", and the fix looks like a refresh
  two minutes later.

  The tag has been on the fetch since it was written; nothing ever called it.
*/
export async function revalidateCafe(cafeId: string) {
  revalidateTag(`cafe-${cafeId}`);
}
