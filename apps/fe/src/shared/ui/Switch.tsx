"use client";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function Switch({ checked, onChange, label, ariaLabel, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      /*
        `w-fit`, not `w-full`: this sits beside other content on the same line in both
        callers, and a flex item whose width property is 100% takes that as its
        flex-basis -- it then dominates the row's available space over its sibling,
        which is what put "0 cafes" and this switch's own label crushed against each
        other in the collection dialog. `justify-between` went with it: it existed to
        push the track to the far edge of a full-width row, and there is no edge to
        push to once the button is sized to its own content.

        The 44px target is an invisible band (`before:-inset-y-[12px]`), the same
        technique `CAFE_ACTION_CLASS` uses, not `min-h-11` on the box itself. A caller
        that stacks this beside a two-line block sizes its row from the taller
        sibling, and a 44px-tall switch is taller than that block's own two lines --
        it centred within the row and hung visibly past the second line's bottom
        edge. The visible box is now exactly its content's own height, so a caller
        can bottom-align it (`self-end`) flush with the text beside it, with the
        touch target unchanged.
      */
      className="relative flex w-fit shrink-0 items-center gap-3 whitespace-nowrap text-left before:absolute before:inset-x-0 before:-inset-y-[12px] before:content-[''] focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="landing-micro text-ink-secondary">{label}</span>
      <span aria-hidden="true" className={`relative h-5 w-10 shrink-0 rounded-(--radius-pill) transition-colors ${checked ? 'bg-brand' : 'bg-edge-rule'}`}>
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-(--radius-pill) bg-surface-raised transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}
