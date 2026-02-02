export function SeedIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background/Soil Circle - simplified badge feel */}
      <circle cx="50" cy="50" r="45" fill="var(--color-growthSeedBg)" />
      
      {/* Soil Patch - Consistent with Sprout */}
      <path d="M25 80 Q50 75 75 80" stroke="var(--color-growthSoil)" strokeWidth="4" strokeLinecap="round" />

      {/* Bean - Cute & Chubby */}
      <g transform="translate(50, 65) rotate(-30)">
        <ellipse cx="0" cy="0" rx="16" ry="22" fill="var(--color-growthBean)" />
        <path d="M-2 -12 Q1 -10 0 14" stroke="var(--color-growthBeanStroke)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

export function SproutIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="var(--color-growthSproutBg)" />
      
      {/* Soil Patch */}
      <path d="M25 80 Q50 75 75 80" stroke="var(--color-growthSoil)" strokeWidth="4" strokeLinecap="round" />

      {/* Cute Sprout 🌱 Style */}
      <g transform="translate(50, 80)">
        {/* Stem - short and slightly curved */}
        <path d="M0 0 Q-2 -15 0 -25" stroke="var(--color-growthStem)" strokeWidth="4" strokeLinecap="round" />
        
        {/* Left Leaf - rounded fullness */}
        <path d="M0 -25 Q-15 -35 -20 -20 Q-25 0 0 -20" fill="var(--color-growthLeaf)" stroke="var(--color-growthStem)" strokeWidth="2" strokeLinejoin="round" />
        
        {/* Right Leaf - asymmetric cute */}
        <path d="M0 -25 Q15 -40 25 -25 Q30 -5 2 -22" fill="var(--color-growthLeaf)" stroke="var(--color-growthStem)" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function GrowingIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="var(--color-growthTreeBg)" />
      
      {/* Soil */}
      <path d="M25 85 Q50 80 75 85" stroke="var(--color-growthSoil)" strokeWidth="4" strokeLinecap="round" />

      {/* Growing Plant 🌿 (Coffee Sapling Style) */}
      <g transform="translate(50, 85)">
        {/* Main Stem - Vertical and sturdy */}
        <path d="M0 0 L0 -55" stroke="var(--color-growthStem)" strokeWidth="4" strokeLinecap="round" />

        {/* Lower Leaf Pair - Larger, slightly wavy (Coffee leaf characteristic) */}
        <g transform="translate(0, -20)">
           {/* Left Leaf */}
           <path d="M0 0 Q-10 5 -20 0 Q-30 -5 -32 -15 Q-20 -25 0 -5" fill="var(--color-growthLeaf)" stroke="var(--color-growthStem)" strokeWidth="2" strokeLinejoin="round" />
           {/* Right Leaf */}
           <path d="M0 0 Q10 5 20 0 Q30 -5 32 -15 Q20 -25 0 -5" fill="var(--color-growthLeaf)" stroke="var(--color-growthStem)" strokeWidth="2" strokeLinejoin="round" />
        </g>

        {/* Upper Leaf Pair - Smaller, pointing up, sweeter/sharper tips */}
        <g transform="translate(0, -40)">
           {/* Left Leaf */}
           <path d="M0 0 Q-20 -5 -20 -20 Q-8 -25 0 -5" fill="var(--color-growthLeaf)" stroke="var(--color-growthStem)" strokeWidth="2" strokeLinejoin="round" />
           {/* Right Leaf */}
           <path d="M0 0 Q20 -5 20 -20 Q10 -25 0 -5" fill="var(--color-growthLeaf)" stroke="var(--color-growthStem)" strokeWidth="2" strokeLinejoin="round" />
        </g>
        
        {/* Top Center Leaf */}
        <path d="M0 -55 Q-10 -68 0 -78 Q10 -68 0 -55" fill="var(--color-growthLeaf)" stroke="var(--color-growthStem)" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function TreeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="var(--color-growthTreeBg)" />
      
      {/* Soil */}
      <path d="M25 85 Q50 80 75 85" stroke="var(--color-growthSoil)" strokeWidth="4" strokeLinecap="round" />

      {/* Main Canopy - Shape (Raised) */}
      <g transform="translate(50, 37)">
         <path d="M0 -30 Q-20 -20 -25 0 Q-35 15 -15 25 Q0 35 15 25 Q35 15 25 0 Q20 -20 0 -30 Z" 
               fill="var(--color-growthLeaf)" stroke="var(--color-growthStem)" strokeWidth="3" strokeLinejoin="round" />
      </g>

      {/* Trunk - Asymmetric 3-prong style */}
      <g>
        {/* Main central stem */}
        <path d="M50 85 L50 30" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" />
        
        {/* Left Branch */}
        <path d="M50 60 Q35 55 35 40" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" fill="none" />
        
        {/* Right Branch */}
        <path d="M50 50 Q65 45 65 35" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

export function HarvestIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="var(--color-growthTreeBg)" />
      
      {/* Soil */}
      <path d="M25 85 Q50 80 75 85" stroke="var(--color-growthSoil)" strokeWidth="4" strokeLinecap="round" />

      {/* Main Canopy (Raised) */}
      <g transform="translate(50, 37)">
         <path d="M0 -30 Q-20 -20 -25 0 Q-35 15 -15 25 Q0 35 15 25 Q35 15 25 0 Q20 -20 0 -30 Z" 
               fill="var(--color-growthLeaf)" stroke="var(--color-growthStem)" strokeWidth="3" strokeLinejoin="round" />
      </g>

      {/* Trunk - Asymmetric 3-prong style */}
      <g>
        <path d="M50 85 L50 60" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" />
        {/* <path d="M50 60 Q35 55 35 40" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M50 50 Q65 45 65 30" stroke="var(--color-growthTrunk)" strokeWidth="4" strokeLinecap="round" fill="none" /> */}
      </g>
      
      {/* Coffee Cherries (Adjusted positions) */}
      <g fill="var(--color-growthFruit)">
         <circle cx="33" cy="53" r="3" />
         <circle cx="65" cy="37" r="3" />
         <circle cx="50" cy="28" r="3" />
         <circle cx="42" cy="25" r="3" />
         <circle cx="60" cy="27" r="3" />

         <circle cx="52" cy="50" r="3" />
         <circle cx="40" cy="46" r="3" />
         <circle cx="65" cy="55" r="3" />

         <circle cx="48" cy="40" r="3" />
         <circle cx="33" cy="35" r="3" />
         <circle cx="60" cy="45" r="3" />
      </g>
    </svg>
  );
}
