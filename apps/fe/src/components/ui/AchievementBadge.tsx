'use client';

import { useTranslations } from 'next-intl';
import Tooltip from './Tooltip';

export interface AchievementBadgeProps {
  type: 'navigator' | 'vanguard';
  count: number;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

const badgeConfig = {
  navigator: {
    icon: '🧭',
    color: 'var(--color-primary)',
    bgColor: 'var(--color-primary)',
  },
  vanguard: {
    icon: '🛡️',
    color: 'var(--color-accent)',
    bgColor: 'var(--color-accent)',
  },
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5 gap-0.5',
  md: 'text-sm px-2 py-1 gap-1',
};

export default function AchievementBadge({ 
  type, 
  count, 
  size = 'sm',
  showTooltip = true 
}: AchievementBadgeProps) {
  const t = useTranslations('profile');
  const config = badgeConfig[type];
  
  // Don't show badge if count is 0
  if (count === 0) return null;
  
  const tooltipKey = type === 'navigator' ? 'navigator_tooltip' : 'vanguard_tooltip';
  const tooltipText = t(tooltipKey, { count });
  
  const badge = (
    <span 
      className={`
        inline-flex items-center font-semibold rounded-full
        transition-all duration-200 hover:scale-105 cursor-default
        ${sizeClasses[size]}
      `}
      style={{
        backgroundColor: `color-mix(in srgb, ${config.bgColor} 15%, transparent)`,
        color: config.color,
        border: `1px solid color-mix(in srgb, ${config.color} 30%, transparent)`,
      }}
    >
      <span className="leading-none">{config.icon}</span>
      <span className="font-bold tabular-nums">{count}</span>
    </span>
  );
  
  if (!showTooltip) return badge;
  
  return (
    <Tooltip content={tooltipText} position="bottom">
      {badge}
    </Tooltip>
  );
}
