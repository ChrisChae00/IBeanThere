'use client';

import { useEffect, type RefObject } from 'react';

/*
  Close a popover on an outside pointer-down or on Escape. Both footer popovers had the
  same twenty lines; a popover that dismisses on one of the two and not the other is the
  bug this prevents.

  `pointerdown` rather than `click` so the popover is gone before the press that closed
  it can also activate whatever was underneath.
*/
export function useDismissable(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, ref, close]);
}
