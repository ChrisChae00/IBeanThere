'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { Button } from '@/shared/ui';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

import confetti from 'canvas-confetti';

interface DropBeanButtonProps {
  cafeId: string;
  cafeLat: number;
  cafeLng: number;
  initialBeanStatus?: {
    has_bean: boolean;
    drop_count: number;
    growth_level: number;
    growth_level_name: string | null;
    can_drop_today: boolean;
    next_level_at: number | null;
  };
  onSuccess?: (result: DropBeanResult) => void;
  size?: 'sm' | 'md' | 'lg';
  showGrowthInfo?: boolean;
}

interface DropBeanResult {
  message: string;
  cafe_id: string;
  cafe_name: string;
  drop_count: number;
  growth_level: number;
  growth_level_name: string;
  leveled_up: boolean;
  next_level_at: number | null;
}

export default function DropBeanButton({
  cafeId,
  cafeLat,
  cafeLng,
  initialBeanStatus,
  onSuccess,
  size = 'md',
  showGrowthInfo = true
}: DropBeanButtonProps) {
  const t = useTranslations('drop_bean');
  const { user } = useAuth();
  const { coords, getCurrentLocation, isLoading: locationLoading, error: locationError } = useLocation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<DropBeanResult | null>(null);
  const [beanStatus, setBeanStatus] = useState(initialBeanStatus);

  // Calculate distance to cafe
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const triggerConfetti = () => {
    const end = Date.now() + 1000;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B4513', '#D2691E', '#CD853F'] // Coffee colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B4513', '#D2691E', '#CD853F']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const handleDropBean = async () => {
    if (!user) {
      setError(t('login_required'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use existing coords from hook if available, otherwise fetch fresh
      let userLat: number;
      let userLng: number;

      if (coords) {
        userLat = coords.latitude;
        userLng = coords.longitude;
      } else {
        const position = await getCurrentLocation();
        userLat = position.latitude;
        userLng = position.longitude;
      }

      // Check distance client-side first
      const distance = calculateDistance(userLat, userLng, cafeLat, cafeLng);
      // Allow slightly larger radius for better UX (75m instead of 50m strict)
      if (distance > 75) {
        setError(t('too_far', { distance: Math.round(distance) }));
        setIsLoading(false);
        return;
      }

      // Call API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${apiUrl}/api/v1/cafes/${cafeId}/drop-bean?user_lat=${userLat}&user_lng=${userLng}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setError(t('already_today'));
        } else if (response.status === 400) {
          setError(data.detail || t('too_far'));
        } else {
          setError(data.detail || t('error'));
        }
        setIsLoading(false);
        return;
      }

      const result: DropBeanResult = await response.json();
      setSuccess(result);
      setBeanStatus({
        has_bean: true,
        drop_count: result.drop_count,
        growth_level: result.growth_level,
        growth_level_name: result.growth_level_name,
        can_drop_today: false,
        next_level_at: result.next_level_at
      });
      
      triggerConfetti();

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err: any) {
      console.error('Error dropping bean:', err);
      // Prefer specific error message if available
      const errorMessage = err.message || locationError || t('error');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string> => {
    const { createClient } = await import('@/shared/lib/supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const canDrop = !beanStatus || beanStatus.can_drop_today;
  const growthLevel = beanStatus?.growth_level || 0;
  const dropCount = beanStatus?.drop_count || 0;
  const nextLevelAt = beanStatus?.next_level_at;

  return (
    <div className="relative flex flex-col items-center gap-2">
      {success ? (
        <div className="flex flex-col items-center gap-1 text-center animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
            <span className="font-semibold text-sm">
              {t('success')}
            </span>
          </div>
          {success.leveled_up && (
            <div className="text-[var(--color-primary)] text-xs font-bold animate-pulse mt-1">
              {t('level_up', { level: success.growth_level_name })}
            </div>
          )}
        </div>
      ) : (
        <>
          {showGrowthInfo && beanStatus?.has_bean && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {t('drops', { count: dropCount })}
              </span>
            </div>
          )}
          
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDropBean();
            }}
            disabled={!canDrop || isLoading || locationLoading}
            size={size}
            variant="primary"
            className="whitespace-nowrap shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-100 disabled:cursor-not-allowed"
          >
            {isLoading || locationLoading ? (
              <div className="flex items-center gap-2">
                 <LoadingSpinner size="sm" className="text-[var(--color-primaryText)]" />
                 <span className="opacity-90">{t('button')}</span>
              </div>
            ) : (
              canDrop ? t('button') : t('already_today')
            )}
          </Button>

          {error && (
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 min-w-[200px] w-max max-w-[280px] z-[50]">
              <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-100 shadow-lg text-center font-medium animate-in fade-in slide-in-from-top-1">
                {error}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setError(null);
                  }}
                  className="ml-2 underline opacity-75 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {!canDrop && showGrowthInfo && nextLevelAt && !error && (
            <div className="text-[10px] text-[var(--color-text-secondary)] text-center mt-0.5 opacity-80">
              {t('next_level', { drops: nextLevelAt - dropCount })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
