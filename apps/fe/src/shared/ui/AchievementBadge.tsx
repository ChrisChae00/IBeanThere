'use client';

import { useTranslations } from 'next-intl';
import { Compass, ShieldCheck } from 'lucide-react';
import Tooltip from './Tooltip';

export interface AchievementBadgeProps {
  type: 'navigator' | 'scout';
  count: number;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

/*
  What someone was first to find, and what they helped verify.

  This was two emoji (🧭 🛡️) in a 15% wash of the brand with a 30% border, written as
  an inline `style`, and it grew on hover. All four are things the design language names
  outright: an emoji standing in for an icon, a tint standing in for a state, an inline
  colour that cannot follow the theme, and depth or movement carrying what the fill
  should. It is a count beside a name, so it is what every other count in the app is --
  a micro-label with a lucide mark, unpainted. The number is the claim; a plate around
  it only competes with the name it sits next to.
*/
const marks = {
  navigator: Compass,
  scout: ShieldCheck,
} as const;

const sizeClasses = {
  sm: 'gap-1 text-[0.625rem]',
  md: 'gap-1.5 text-[0.6875rem]',
} as const;

const markSize = { sm: 13, md: 15 } as const;

export default function AchievementBadge({
  type,
  count,
  size = 'sm',
  showTooltip = true,
}: AchievementBadgeProps) {
  const t = useTranslations('profile');
  const Mark = marks[type];

  // Nothing earned yet, so there is nothing to say.
  if (count === 0) return null;

  const tooltipText = t(type === 'navigator' ? 'navigator_tooltip' : 'scout_tooltip', { count });

  const badge = (
    <span
      className={`landing-micro inline-flex cursor-default items-center text-ink-secondary ${sizeClasses[size]}`}
    >
      <Mark size={markSize[size]} aria-hidden="true" />
      <span className="tabular-nums">{count}</span>
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip content={tooltipText} position="bottom">
      {badge}
    </Tooltip>
  );
}
