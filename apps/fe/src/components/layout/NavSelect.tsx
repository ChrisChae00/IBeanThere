'use client';

import { Menu } from '@base-ui/react/menu';
import { Check, ChevronDown } from 'lucide-react';

/*
  The shape both header switchers wear. They were native `<select>` elements,
  which meant the browser drew their popups: no way to anchor one under its own
  trigger, and no way to give it the panel treatment the rest of the header uses.

  Each also measured its current option with a canvas and set its own width in
  pixels so the box would hug the text. The trigger label is fixed now, so all
  of that goes away with them.
*/
type Option = {
  value: string;
  label: string;
};

type NavSelectProps = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  /*
    Where the popup is portalled. The header leaves this alone and gets the body, which
    keeps the panel out of the over-media colour swap. The mobile drawer passes itself:
    it is a modal dialog, and a popup portalled outside it is outside the focus trap,
    where the dialog pulls focus back and closes the menu in the frame it opened.

    The element rather than a ref, because the drawer's ref is still null on the render
    that mounts this menu, and a portal handed an empty container renders nothing while
    the trigger goes on reporting itself open.
  */
  container?: HTMLElement | null;
  /*
    The nav bar's own pill, kept as the default so the two header switchers need
    nothing extra. A caller outside the bar -- Settings, so far -- draws a row-width
    control instead and passes its own shape here; `group` still has to be in it, since
    the chevron's rotation reads that class from the trigger.
  */
  triggerClassName?: string;
  /** Matches the trigger's own width when the panel would otherwise be narrower than it. */
  panelClassName?: string;
};

const DEFAULT_TRIGGER =
  'nav-pill group font-medium text-sm text-text h-10 px-3 flex items-center gap-1.5 whitespace-nowrap cursor-pointer';

export default function NavSelect({
  label,
  options,
  value,
  onChange,
  ariaLabel,
  container,
  triggerClassName = DEFAULT_TRIGGER,
  panelClassName = 'min-w-44',
}: NavSelectProps) {
  /*
    `align="end"` rather than the trigger's centre: these sit at the right edge of the
    bar, and a centred panel would hang off the viewport. The placement is measured
    against the viewport in both cases, because the drawer this can be portalled into is
    itself a fixed element -- an absolutely placed popup inside it would be offset again
    by the drawer's own position.
  */
  const positioner = (
    <Menu.Positioner
      side="bottom"
      align="end"
      sideOffset={8}
      positionMethod="fixed"
      collisionPadding={8}
      className="z-(--z-nav-popover)"
    >
      {/*
        `nav-opaque` takes the theme's own vocabulary back: portalled out of the header
        or rendered inside the drawer, either way the panel is an opaque surface in its
        own right and must not inherit the over-media swap.

        The z-index is the top slot in the nav stack rather than the header's own,
        because the portalled copy has to outrank the drawer that opened it.
      */}
      <Menu.Popup className={`menu-panel nav-opaque motion-slide-up ${panelClassName}`}>
        <Menu.RadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <Menu.RadioItem
              key={option.value}
              value={option.value}
              /*
                `justify-between` is the only thing this menu adds to the shared row:
                its check mark sits at the far end rather than beside the label,
                because the label is the choice and the mark is a state.
              */
              className="menu-item justify-between outline-hidden"
            >
              {option.label}
              <Menu.RadioItemIndicator>
                <Check className="w-4 h-4" />
              </Menu.RadioItemIndicator>
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu.Positioner>
  );

  return (
    <Menu.Root>
      <Menu.Trigger aria-label={ariaLabel} className={triggerClassName}>
        {label}
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
      </Menu.Trigger>

      <Menu.Portal container={container ?? undefined}>{positioner}</Menu.Portal>
    </Menu.Root>
  );
}
