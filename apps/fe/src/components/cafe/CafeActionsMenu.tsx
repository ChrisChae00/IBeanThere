'use client';

import { Menu } from '@base-ui/react/menu';
import { MoreVertical } from 'lucide-react';

/*
  The overflow. Reporting a cafe is rare, irreversible-feeling, and belongs to
  nobody's main task, so it does not get a control in the row beside "Drop Bean" —
  a row where every button looks equally likely to be the thing you came for.

  Same panel vocabulary as the header switchers (`menu-panel` / `menu-item`), so
  a menu opened here looks like a menu opened anywhere else in the app. It takes a
  list rather than one action because the list is going to grow — share, edit,
  suggest a correction — and a menu that has to be rebuilt to hold a second item is
  a button wearing a menu's clothes.
*/
export default function CafeActionsMenu({
  label,
  items,
  onMedia = false,
}: {
  label: string;
  items: { key: string; label: string; onClick: () => void }[];
  /*
    Over a photograph the trigger cannot borrow a theme surface: half the photographs
    it lands on are light and half are dark. It takes the scrim and the media ink,
    same as the photo count badge in the other corner.
  */
  onMedia?: boolean;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={label}
        title={label}
        /*
          No rule around it: this is the quiet end of the row, and a border would
          give the least important control the same weight as the ones that carry
          one. The fill on hover is the whole affordance.
        */
        className={
          onMedia
            ? 'grid size-9 place-items-center rounded-(--radius-pill) text-ink-on-media backdrop-blur-[2px] transition-opacity hover:opacity-80'
            : 'grid size-11 place-items-center rounded-(--radius-pill) text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary aria-expanded:bg-surface-hover aria-expanded:text-ink-primary'
        }
        style={
          onMedia
            ? { background: 'color-mix(in srgb, var(--scrim-media) 72%, transparent)' }
            : undefined
        }
      >
        <MoreVertical className="size-4" aria-hidden />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-(--z-map-modal)">
          <Menu.Popup className="menu-panel min-w-44 motion-slide-up">
            {items.map((item) => (
              <Menu.Item
                key={item.key}
                onClick={item.onClick}
                className="menu-item outline-hidden"
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
