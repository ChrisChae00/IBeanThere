'use client';

interface GrowthIconProps {
  level: number;  // 0-5
  size?: number;
  animate?: boolean;
  className?: string;
}

/**
 * GrowthIcon - Visual representation of bean growth level
 * 
 * Levels:
 * 0 - No bean (empty)
 * 1 - Sleeping Bean 🫘 (brown/dormant)
 * 2 - Sprouting 🌱 (green sprout)
 * 3 - Growing 🌿 (larger plant)
 * 4 - Sapling 🌳 (small tree)
 * 5 - Fruiting Tree 🍒 (tree with fruit)
 */
export function GrowthIcon({ 
  level, 
  size = 24, 
  animate = false,
  className = '' 
}: GrowthIconProps) {
  const getEmoji = () => {
    switch (level) {
      case 0: return '⚪';  // Empty/no bean
      case 1: return '🫘';  // Sleeping Bean
      case 2: return '🌱';  // Sprouting
      case 3: return '🌿';  // Growing
      case 4: return '🌳';  // Sapling
      case 5: return '🍒';  // Fruiting Tree (coffee cherries)
      default: return '🫘';
    }
  };

  const getColor = () => {
    switch (level) {
      case 0: return 'var(--color-border)';
      case 1: return '#8B4513';  // Brown (Saddle Brown)
      case 2: return '#90EE90';  // Light Green
      case 3: return '#32CD32';  // Lime Green
      case 4: return '#228B22';  // Forest Green
      case 5: return '#DC143C';  // Crimson (coffee cherry red)
      default: return 'var(--color-text)';
    }
  };

  return (
    <span 
      className={`inline-flex items-center justify-center ${animate ? 'animate-bounce' : ''} ${className}`}
      style={{ 
        fontSize: size,
        lineHeight: 1,
        filter: level === 0 ? 'grayscale(1) opacity(0.5)' : 'none'
      }}
      title={getLevelName(level)}
      role="img"
      aria-label={getLevelName(level)}
    >
      {getEmoji()}
    </span>
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
