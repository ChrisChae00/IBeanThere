import CoffeeBean from './CoffeeBean';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="animate-spin text-[var(--color-primary)]">
        <CoffeeBean size={size} />
      </div>
    </div>
  );
}

