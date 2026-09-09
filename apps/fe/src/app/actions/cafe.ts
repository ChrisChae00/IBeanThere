'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';

/*
  Drop the cached cafe payload after somebody changes what it says.

  The cafe page is fetched with `revalidate: 120`, which is right for a page mostly
  made of address and opening hours -- but the log count, the average rating and the
  recent logs on it are things the reader just changed. Without this, saving a log
  lands you back on a page reporting "0 logs", and the fix looks like a refresh
  two minutes later.

  Two things this had wrong (SEC-10):

  1. **The tag it dropped was not always the tag the page was cached under.** The
     detail fetch is tagged with whatever identifier the URL carried, and the URL
     usually carries a slug; every caller here has a UUID. So `cafe-{uuid}` was
     revalidated while the page sat in the cache under `cafe-{slug}`, and a log the
     author had just made private stayed readable there for two minutes. Rather than
     make every caller find the slug -- `my-logs` has log rows, not cafes -- this
     drops the `cafe` tag that every detail fetch also carries. It clears other
     cafes' pages too, which at this size costs one uncached render each.
     ponytail: broad tag; give the fetch a canonical UUID tag if cafe traffic ever
     makes the extra renders measurable.

  2. **A Server Action is a public endpoint.** Anything on the internet can POST to
     it, so an unauthenticated caller could clear the cache in a loop and every
     request behind it would fall through to the backend. It now needs a session and
     an identifier that could actually be one, and quietly does nothing otherwise --
     a cache hint has nobody to report a failure to.
*/

// A cafe UUID or a generated slug. Both are lowercase alphanumerics and hyphens; the
// bound is there so the tag string cannot be used to carry anything else.
const CAFE_KEY = /^[a-z0-9-]{1,120}$/i;

export async function revalidateCafe(cafeId: string) {
  if (typeof cafeId !== 'string' || !CAFE_KEY.test(cafeId)) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  revalidateTag(`cafe-${cafeId}`);
  revalidateTag('cafe');
  // The discover cards come from a separate fetch, cached for four hours. An admin
  // deleting a cafe and reloading discover still saw it there -- the row was gone from
  // the database and the page was serving a list built before it went.
  revalidateTag('trending-cafes');
}
