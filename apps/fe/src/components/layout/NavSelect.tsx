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
};

export default function NavSelect({
  label,
  options,
  value,
  onChange,
  ariaLabel,
}: NavSelectProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={ariaLabel}
        className="nav-pill group font-medium text-sm text-text h-10 px-3 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
      >
        {label}
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
      </Menu.Trigger>

      <Menu.Portal>
        {/*
          `align="end"` rather than the trigger's centre: these sit at the right
          edge of the bar, and a centred panel would hang off the viewport.
        */}
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
          {/*
            Portalled to the body, so it is outside the header and never inherits
            the over-media colour swap. The class is what takes the theme's own
            vocabulary back - without it a light ink lands on a light panel.
          */}
          <Menu.Popup className="nav-opaque min-w-44 bg-background border border-border rounded-(--radius-card) shadow-(--ibean-shadow-warm-md) overflow-hidden py-1 motion-slide-up">
            <Menu.RadioGroup value={value} onValueChange={onChange}>
              {options.map((option) => (
                <Menu.RadioItem
                  key={option.value}
                  value={option.value}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-text cursor-pointer transition-colors outline-hidden data-highlighted:bg-surface data-highlighted:text-primary data-checked:text-primary"
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
      </Menu.Portal>
    </Menu.Root>
  );
}
