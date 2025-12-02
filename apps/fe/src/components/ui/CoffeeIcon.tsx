export default function CoffeeIcon({ 
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
      <path
        d="M18 8h1a3 3 0 0 1 0 6h-1M2 8h16v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 1v3M10 1v3M14 1v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
