'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/lib/supabase/client';

export interface TasteMateButtonProps {
  username: string;
  isTrusted: boolean;
  trustCount: number;
  onTrustChange?: (trusted: boolean) => void;
  disabled?: boolean;
}

export default function TasteMateButton({ 
  username, 
  isTrusted: initialTrusted,
  trustCount: initialCount,
  onTrustChange,
  disabled = false,
}: TasteMateButtonProps) {
  const t = useTranslations('profile');
  const [isTrusted, setIsTrusted] = useState(initialTrusted);
  const [trustCount, setTrustCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please sign in to trust users');
        return;
      }
      
      const method = isTrusted ? 'DELETE' : 'POST';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${username}/trust`,
        {
          method,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update trust');
      }
      
      const newTrusted = !isTrusted;
      setIsTrusted(newTrusted);
      setTrustCount(prev => newTrusted ? prev + 1 : prev - 1);
      onTrustChange?.(newTrusted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full
          font-medium text-sm transition-all duration-200
          focus:outline-hidden focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isTrusted
            ? 'bg-primary text-white hover:bg-primary/90 focus:ring-primary'
            : 'bg-surface text-text border border-border hover:border-primary hover:text-primary focus:ring-primary'
          }
        `}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-base">{isTrusted ? '✓' : '🤝'}</span>
        )}
        <span>
          {isTrusted ? t('trusted_button') : t('trust_button')}
        </span>
      </button>
      
      {trustCount > 0 && (
        <span className="text-xs text-(--color-text-secondary) ml-1">
          {t('trust_count', { count: trustCount })}
        </span>
      )}
      
      {error && (
        <span className="text-xs text-error ml-1">
          {error}
        </span>
      )}
    </div>
  );
}
