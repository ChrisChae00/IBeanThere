'use client';

interface GrowthIconProps {
  level: number;  // 0-5
  size?: number;
  animate?: boolean;
  className?: string;
}

import { SeedIcon, SproutIcon, GrowingIcon, TreeIcon, HarvestIcon } from '../landing/GrowthJourneyIcons';

/**
 * GrowthIcon - Visual representation of bean growth level
 * 
 * Levels:
 * 0 - No bean (empty)
 * 1 - Sleeping Bean 🫘 (Seed)
 * 2 - Sprouting 🌱 (Sprout)
 * 3 - Growing 🌿 (Growing)
 * 4 - Sapling 🌳 (Tree)
 * 5 - Fruiting Tree 🍒 (Harvest)
 */
export function GrowthIcon({ 
  level, 
  size = 24, 
  animate = false,
  className = '' 
}: GrowthIconProps) {
  
  // Empty state
  if (level === 0) {
    return (
      <span 
        className={`inline-flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] ${className}`}
        style={{ width: size, height: size }}
        title="No bean"
      />
    );
  }

  const iconClass = `w-full h-full ${animate ? 'animate-bounce' : ''}`;

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title={getLevelName(level)}
      role="img"
      aria-label={getLevelName(level)}
    >
      {level === 1 && <SeedIcon className={iconClass} />}
      {level === 2 && <SproutIcon className={iconClass} />}
      {level === 3 && <GrowingIcon className={iconClass} />}
      {level === 4 && <TreeIcon className={iconClass} />}
      {level >= 5 && <HarvestIcon className={iconClass} />}
    </div>
  );
}

function getLevelName(level: number): string {
  switch (level) {
    case 0: return 'No bean';
    case 1: return 'Sleeping Bean';
    case 2: return 'Sprouting';
    case 3: return 'Growing';
    case 4: return 'Sapling';
    case 5: return 'Fruiting Tree';
    default: return 'Unknown';
  }
}

// Export level thresholds for reference
export const GROWTH_THRESHOLDS = {
  SLEEPING_BEAN: 1,
  SPROUTING: 3,
  GROWING: 5,
  SAPLING: 10,
  FRUITING_TREE: 15
};

export function getGrowthLevel(dropCount: number): number {
  if (dropCount >= 15) return 5;
  if (dropCount >= 10) return 4;
  if (dropCount >=  5) return 3;
  if (dropCount >=  3) return 2;
  if (dropCount >=  1) return 1;
  return 0;
}
