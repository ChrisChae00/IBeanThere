'use client';

/*
  One switch, two places: whether a profile publishes its collections at all, and
  whether a given collection is one of them. They sit on the same journey, so they
  cannot be two hand-rolled divs that drifted apart -- the pair only reads as a
  coarse setting and its opt-out if they look identical.

  The track is 40x20 and the label is what a finger aims at, so the whole control is
  the target: the label carries the padding that takes the row past 44px rather than
  the track growing to meet it.
*/

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export default function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <label
      className={`flex items-center gap-2 py-3 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <span className="landing-micro text-ink-secondary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-10 shrink-0 rounded-(--radius-pill) transition-colors ${
          checked ? 'bg-brand' : 'bg-edge-rule'
        }`}
      >
        {/*
          The knob is the raised surface rather than white: on Dark Roast a white
          dot is the brightest thing on the page, and the switch shouts over the
          panel it belongs to.
        */}
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-(--radius-pill) bg-surface-raised transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
}
