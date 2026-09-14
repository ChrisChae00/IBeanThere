'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { capturePageview, identify, start } from '@/lib/analytics';

/*
  Renders nothing; starts the analytics client and keeps two things in step with it --
  which page is open, and who is reading it. Same shape as `AuthWatcher`, and it lives
  in the same place for the same reason: it needs to be inside `AuthProvider`.

  Two effects rather than one, because they answer to different things. Merging them
  would re-send a pageview every time the session refreshed in the background.
*/
export function AnalyticsWatcher() {
  const pathname = usePathname();
  const params = useParams();
  const { user, isLoading } = useAuth();
  /* `undefined` until the session resolves, so the first run can tell "nobody is signed
     in" apart from "we do not know yet" and start the client with the right identity. */
  const identity = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Before the session resolves, `user` is null and that is not yet evidence of
    // anybody being signed out -- starting here would count a returning reader as a
    // stranger, and resetting here would throw their id away on every reload.
    if (isLoading) return;

    const id = user?.id ?? null;
    if (identity.current === undefined) {
      identity.current = id;
      start(id);
      return;
    }
    if (id === identity.current) return;
    identity.current = id;
    identify(id);
  }, [user?.id, isLoading]);

  /* Runs before the client exists on the first load; the pageview waits in the queue
     inside `analytics` rather than being dropped. */
  useEffect(() => {
    if (!pathname) return;
    capturePageview((params?.locale as string) || 'en');
  }, [pathname, params?.locale]);

  return null;
}
