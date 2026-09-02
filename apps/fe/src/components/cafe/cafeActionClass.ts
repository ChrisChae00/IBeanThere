/*
  The compact link-out control shared by the cafe page and the map card: a link out of
  the app, not an action on the record, so the visible chrome is 30px. The 44px target
  the rest of the app keeps is restored by an invisible band above and below, rather
  than by inflating the button.
*/
export const CAFE_ACTION_CLASS =
  'relative inline-flex items-center gap-1.5 rounded-(--radius-control) border border-edge-rule bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-hover ' +
  "before:absolute before:inset-x-0 before:-inset-y-[7px] before:content-['']";
