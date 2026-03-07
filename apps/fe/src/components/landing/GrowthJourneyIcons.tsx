export function SeedIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`transition-transform duration-300 hover:scale-105 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="seed-clip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill="var(--color-growthSeedBg)" />
      <circle cx="50" cy="50" r="46.5" stroke="var(--color-growthSoil)" strokeOpacity="0.1" strokeWidth="3" />

      <g clipPath="url(#seed-clip)">
        {/* Tilted Upright Bean */}
        <g transform="translate(50, 58) rotate(35)">
          <ellipse cx="0" cy="0" rx="18" ry="26" fill="var(--color-growthBean)" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" />
          <path d="M -3 -25 C 16 -12, 16 12, -3 25" fill="none" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -11 -12 Q -15 0 -10 10" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M -6 -19 L -4 -17" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </g>

        {/* Solid soil that fully covers bean base */}
        <path d="M 2 78 C 25 72, 40 70, 50 72 C 60 73, 75 74, 98 78 L 98 100 L 2 100 Z" fill="var(--color-growthSoil)" />
        <path d="M 18 78 C 30 72, 40 70, 50 72 C 60 73, 70 74, 82 78" fill="none" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="10" y1="78" x2="90" y2="78" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function SproutIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`transition-transform duration-300 hover:scale-105 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="sprout-clip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill="var(--color-growthSproutBg)" />
      <circle cx="50" cy="50" r="46.5" stroke="var(--color-growthStem)" strokeOpacity="0.1" strokeWidth="3" />

      <g clipPath="url(#sprout-clip)">
        {/* Cute Sprout 🌱 */}
        <g transform="translate(50, 72)">
          {/* Stem */}
          <path d="M 0 0 Q -1 -12 0 -26" stroke="var(--color-growthStem)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          
          {/* — Leaf shapes first — */}
          {/* Left Leaf */}
          <path d="M 0 -26 C -8 -34, -22 -44, -26 -32 C -28 -20, -12 -10, 0 -20 Z"
            fill="var(--color-growthLeafFill)" stroke="var(--color-growthLeaf)" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Right Leaf */}
          <path d="M 0 -26 C 8 -34, 22 -46, 28 -34 C 32 -20, 12 -10, 0 -20 Z"
            fill="var(--color-growthLeafFill)" stroke="var(--color-growthLeaf)" strokeWidth="2.5" strokeLinejoin="round" />

          {/* — Detail layers on top of both leaves — */}
          {/* Inner shadows */}
          <path d="M -1 -22 C -6 -26, -16 -30, -18 -26 C -20 -20, -10 -14, -1 -20 Z"
            fill="var(--color-growthLeaf)" opacity="0.2" />
          <path d="M 1 -22 C 6 -26, 18 -32, 20 -28 C 22 -20, 12 -14, 1 -20 Z"
            fill="var(--color-growthLeaf)" opacity="0.2" />

          {/* Veins — using stem color for contrast */}
          <path d="M -1 -21 Q -10 -27 -18 -30" stroke="var(--color-growthStem)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="1" />
          <path d="M 1 -21 Q 12 -28 20 -32" stroke="var(--color-growthStem)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="1" />
        </g>

        {/* Solid soil base */}
        <path d="M 2 78 C 25 72, 40 70, 50 72 C 60 73, 75 74, 98 78 L 98 100 L 2 100 Z" fill="var(--color-growthSoil)" />
        <path d="M 18 78 C 30 72, 40 70, 50 72 C 60 73, 70 74, 82 78" fill="none" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="10" y1="78" x2="90" y2="78" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function GrowingIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`transition-transform duration-300 hover:scale-105 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="growing-clip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill="var(--color-growthTreeBg)" />
      <circle cx="50" cy="50" r="46.5" stroke="var(--color-growthLeaf)" strokeOpacity="0.1" strokeWidth="3" />

      <g clipPath="url(#growing-clip)">
        {/* Solid soil base (rendered first) */}
        <path d="M 2 80 C 25 74, 40 72, 50 74 C 60 75, 75 76, 98 80 L 98 100 L 2 100 Z" fill="var(--color-growthSoil)" />
        <path d="M 18 80 C 30 74, 40 72, 50 74 C 60 75, 70 76, 82 80" fill="none" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="10" y1="80" x2="90" y2="80" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Growing Coffee Sapling — reference paths scaled to fit */}
        <g transform="translate(9, 0) scale(0.418)">
          {/* Stem */}
          <path d="m100.3 195.5-3.39-0.02 2.84-139 0.69 0.01 2.36 139h-2.5z" fill="var(--color-growthStem)" />

          {/* Top leaf */}
          <path d="m84.29 10c1.68 3.81 11.02 9.79 13.42 12.52 6.25 7.05 7.42 16.26 7.42 22.51 0 4.68-2.2 7.81-5.42 9.88l-0.39 4.3-0.4-4.48c-6.9-2.56-16.5-12.45-16.5-22.03 0-3.58 2.1-17.96 1.87-22.7z" fill="var(--color-growthLeafFill)" />
          <path d="m85.07 11.17 13.85 43.56c-6.93-2.56-16.5-12.45-16.5-22.03 0-3.58 2.33-16.84 1.96-21.53h0.69z" fill="var(--color-growthLeaf)" />

          {/* Right upper leaf */}
          <path d="m103.2 106.8c-1.06-7.71 4.07-17.38 14.61-26.12 9.15-7.8 20.37-9.19 30.91-7.53 4.13 0.65 7.08 1.91 9.59 2.88-4.91 3.7-9.95 12.83-11.34 18.35-2.11 8.25-10.07 14.5-17.5 15.29-9.06 1.06-20.01 2.21-25.23-2.37l-2.33 2.37 1.29-2.87z" fill="var(--color-growthLeafFill)" />
          <path d="m103.8 106.8c9.75-11.58 26.07-23.17 43.03-28.32 3.22-1.06 6.16-1.15 10.28-2.4-3.76 1.06-7.62 1.52-10.28 2.4-17.05 5.15-32.56 16.28-42.33 27.77l-0.7 0.55z" fill="var(--color-growthStem)" />
          <path d="m104.5 106.3c9.48-11.31 25.28-22.53 42.33-27.68 3.22-1.06 6.97-0.78 10.28-2.35-4.91 3.7-8.72 12.64-10.11 18.16-2.11 8.25-10.07 14.5-17.5 15.29-9.06 1.06-19.55 2.03-24.46-2.09l-0.54-1.33z" fill="var(--color-growthLeafFill)" />

          {/* Left upper leaf */}
          <path d="m97.08 87.7c0.97-5.8-4.91-14.64-13.32-20.53-6.9-4.96-13.42-6.02-22.48-4.06-4.55 1.06-7.49 2.93-13.19 5.37 3.04 0.37 6.07 0.46 9.93 4.77 8.97 10.23 17.66 17.66 25.97 19.63 4.82 1.06 9.93-1.6 12.63-3.97l4.04 3.9-3.58-5.11z" fill="var(--color-growthLeafFill)" />
          <path d="m96.9 87.33c0.78-4.58-5.09-14.08-13.23-19.87-6.9-4.96-13.42-6.03-22.48-4.06-4.13 0.97-7.26 2.64-12.08 4.62 4.82-0.65 8.13-0.19 12.31 0.65 12.83 2.35 25.93 8.51 35.48 18.66z" fill="var(--color-growthLeafFill)" />
          <path d="m49.15 67.92c4.82-0.64 8.04 0 12.31 0.75 12.83 2.35 25.32 8.24 35.35 18.38l0.27 0.65c-10.02-8.65-19.17-14.08-33.2-17.55-4.13-1.06-9.15-2.04-14.73-2.23z" fill="var(--color-growthStem)" />

          {/* Right large leaf (bottom) */}
          <path d="m102 162.1c-1.06-11.31 4.36-20.89 16.76-30.02 15.01-11.48 29.57-13.71 46.02-10.01 6.38 1.48 12.26 4.84 17.77 6.32-7.34 1.57-17.59 13.6-22.32 19.49-10.63 13.35-25.56 20.88-39.86 21.06-7.34 0.09-12.16-2.35-16.71-6.84h-1.66z" fill="var(--color-growthLeafFill)" />
          <path d="m103.2 161.8c19.25-14.12 36.57-24.46 78.13-33.34-7.35 1.57-16.43 13.51-21.16 19.4-10.63 13.35-25.56 20.88-39.86 21.06-7.34 0.09-11.5-2.24-17.11-7.12z" fill="var(--color-growthLeaf)" />

          {/* Left large leaf (bottom) */}
          <path d="m95.92 153.1c1.16-11.86-7.9-32.02-24.14-40.76-11.96-6.61-24.79-7.25-44.13-7.62-4.73-0.09-9.64 0-13.15-0.88 3.76 2.55 10.37 18.63 17.36 28.79 5.32 7.62 12.31 10.85 23.53 15.73 11.69 5.34 27.58 6.4 38.53 4.74l4.82 3.72-2.82-3.72z" fill="var(--color-growthLeafFill)" />
          <path d="m16.47 104.6c3.85 1.39 6.54 2.63 10.39 4.85 21.01 11.32 39.95 19.39 62.92 37.88l5.32 3.81c-1.98-11.13-10.76-30.09-26.27-38.92-10.86-6.33-24.21-6.98-41.27-7.35-3.85-0.09-8.2 0.09-11.09-0.27z" fill="var(--color-growthLeaf)" />

          {/* Small bottom-left leaf */}
          <path d="m96.21 182.9c-1.06-7.14-6.94-14.67-17.48-17.6-6.69-1.66-13.5-0.09-19.75 3.29 4.36-0.55 8.03 4.41 9.71 8.01 2.6 4.39 6.95 8.69 12.83 8.79 5.97 0.27 9.47-1.49 13.32-3.25l2.84 2.87-1.47-2.11z" fill="var(--color-growthLeafFill)" />
          <path d="m61.19 168.3c3.76-0.55 5.87-0.64 9.63-0.27 8.59 0.97 16.94 5.84 23.93 13.83l0.4 0.75c-8.5-7.71-16.02-11.19-26.04-13.52-2.1-0.46-4.08-0.64-7.92-0.79z" fill="var(--color-growthStem)" />
        </g>
      </g>
    </svg>
  );
}

export function TreeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`transition-transform duration-300 hover:scale-105 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="tree-clip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill="var(--color-growthTreeBg)" />
      <circle cx="50" cy="50" r="46.5" stroke="var(--color-growthCanopy)" strokeOpacity="0.1" strokeWidth="3" />

      <g clipPath="url(#tree-clip)">
        {/* Solid soil base (rendered first) */}
        <path d="M 2 80 C 25 74, 40 72, 50 74 C 60 75, 75 76, 98 80 L 98 100 L 2 100 Z" fill="var(--color-growthSoil)" />
        <path d="M 18 80 C 30 74, 40 72, 50 74 C 60 75, 70 76, 82 80" fill="none" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="10" y1="80" x2="90" y2="80" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Trunk (on top of soil) */}
        <g transform="translate(50, 83)">
          <path d="M -4 0 L -2 -35 L 2 -35 L 4 0 Z" fill="var(--color-growthTrunk)" />
          <path d="M -2 -20 Q -15 -30 -12 -45" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 2 -15 Q 15 -25 15 -40" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>

        {/* Bushy Canopy */}
        <g transform="translate(50, 42)">
          <circle cx="-15" cy="5" r="18" fill="var(--color-growthCanopyDark)" />
          <circle cx="15" cy="0" r="18" fill="var(--color-growthCanopy)" />
          <circle cx="0" cy="-15" r="22" fill="var(--color-growthLeafFill)" />
          <path d="M -15 -25 Q 0 -35 15 -25 T -5 0 Z" fill="#ffffff" fillOpacity="0.15" />
        </g>
      </g>
    </svg>
  );
}

export function HarvestIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`transition-transform duration-300 hover:scale-105 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="harvest-clip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill="var(--color-growthTreeBg)" />
      <circle cx="50" cy="50" r="46.5" stroke="var(--color-growthCanopyDark)" strokeOpacity="0.1" strokeWidth="3" />

      <g clipPath="url(#harvest-clip)">
        {/* Solid soil base (rendered first) */}
        <path d="M 2 80 C 25 74, 40 72, 50 74 C 60 75, 75 76, 98 80 L 98 100 L 2 100 Z" fill="var(--color-growthSoil)" />
        <path d="M 18 80 C 30 74, 40 72, 50 74 C 60 75, 70 76, 82 80" fill="none" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="10" y1="80" x2="90" y2="80" stroke="var(--color-growthBeanStroke)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Trunk (on top of soil) */}
        <g transform="translate(50, 83)">
          <path d="M -4 0 L -2 -35 L 2 -35 L 4 0 Z" fill="var(--color-growthTrunk)" />
          <path d="M -2 -20 Q -15 -30 -12 -45" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 2 -15 Q 15 -25 15 -40" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>

        {/* Canopy with Coffee Cherries */}
        <g transform="translate(50, 42)">
          <circle cx="-16" cy="6" r="19" fill="var(--color-growthCanopyDark)" />
          <circle cx="16" cy="2" r="19" fill="var(--color-growthCanopyDark)" />
          <circle cx="0" cy="-15" r="23" fill="var(--color-growthCanopy)" />
          <circle cx="5" cy="-5" r="20" fill="var(--color-growthLeafFill)" />

          <circle cx="-18" cy="12" r="4.5" fill="var(--color-growthFruit)" />
          <circle cx="-12" cy="15" r="4.5" fill="var(--color-growthFruit)" />
          <circle cx="-15" cy="11.5" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="-9" cy="14.5" r="1.5" fill="#ffffff" opacity="0.6" />

          <circle cx="-2" cy="-18" r="4.5" fill="var(--color-growthFruit)" />
          <circle cx="5" cy="-15" r="4.5" fill="var(--color-growthFruit)" />
          <circle cx="11" cy="-19" r="4.5" fill="var(--color-growthFruit)" />
          <circle cx="1" cy="-18.5" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="8" cy="-15.5" r="1.5" fill="#ffffff" opacity="0.6" />

          <circle cx="20" cy="5" r="4.5" fill="var(--color-growthFruit)" />
          <circle cx="26" cy="10" r="4.5" fill="var(--color-growthFruit)" />
          <circle cx="23" cy="4.5" r="1.5" fill="#ffffff" opacity="0.6" />

          <circle cx="2" cy="6" r="4.5" fill="var(--color-growthFruit)" />
          <circle cx="9" cy="8" r="4.5" fill="var(--color-growthFruit)" />
        </g>
      </g>
    </svg>
  );
}
