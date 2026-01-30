export function SeedIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Soil mound */}
      <path d="M20 80 Q50 60 80 80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-stone-400 opacity-60" />
      {/* Bean */}
      <ellipse cx="50" cy="70" rx="12" ry="16" transform="rotate(-45 50 70)" className="fill-amber-800" />
      <path d="M50 62 Q52 70 50 78" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" transform="rotate(-45 50 70)" />
    </svg>
  );
}

export function SproutIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Soil */}
      <path d="M25 85 Q50 75 75 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-stone-400 opacity-60" />
      {/* Stem */}
      <path d="M50 85 Q50 60 50 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-green-500" />
      {/* Leaves */}
      <path d="M50 50 Q30 30 20 40 Q30 60 50 50" fill="currentColor" className="text-green-400" />
      <path d="M50 50 Q70 30 80 40 Q70 60 50 50" fill="currentColor" className="text-green-400" />
    </svg>
  );
}

export function TreeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trunk */}
      <path d="M50 90 L50 40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-amber-900" />
      <path d="M50 60 L30 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-amber-900" />
      <path d="M50 55 L70 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-amber-900" />
      
      {/* Leaves Cluster 1 */}
      <circle cx="50" cy="35" r="25" fill="currentColor" className="text-green-600" />
      {/* Leaves Cluster 2 */}
      <circle cx="30" cy="45" r="15" fill="currentColor" className="text-green-500" />
      {/* Leaves Cluster 3 */}
      <circle cx="70" cy="45" r="15" fill="currentColor" className="text-green-500" />
      {/* Leaves Cluster 4 */}
      <circle cx="50" cy="20" r="15" fill="currentColor" className="text-green-400" />
    </svg>
  );
}

export function HarvestIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tree Base */}
      <path d="M50 90 L50 40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-amber-900" />
      <circle cx="50" cy="35" r="28" fill="currentColor" className="text-green-700" />
      <circle cx="28" cy="48" r="18" fill="currentColor" className="text-green-600" />
      <circle cx="72" cy="48" r="18" fill="currentColor" className="text-green-600" />
      <circle cx="50" cy="18" r="18" fill="currentColor" className="text-green-500" />

      {/* Fruits (Coffee Cherries) - Static */}
      <circle cx="40" cy="30" r="4" fill="#EF4444" />
      <circle cx="60" cy="40" r="4" fill="#EF4444" />
      <circle cx="50" cy="50" r="4" fill="#EF4444" />
      <circle cx="30" cy="55" r="4" fill="#EF4444" />
      <circle cx="70" cy="55" r="4" fill="#EF4444" />
      <circle cx="50" cy="20" r="4" fill="#EF4444" />
    </svg>
  );
}
