export default function LockIcon({ 
  className = "", 
  size = 24 
}: { 
  className?: string; 
  size?: number; 
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lock body */}
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lock shackle */}
      <path
        d="M7 10V7a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Keyhole */}
      <circle
        cx="12"
        cy="14"
        r="1.5"
        fill="currentColor"
        fillOpacity="0.3"
      />
    </svg>
  );
}
