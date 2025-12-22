'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import Button from '@/components/ui/Button';
import { GrowthIcon } from '@/components/cafe/GrowthIcon';

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

  const handleDropBean = async () => {
    if (!user) {
      setError(t('login_required'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get current location
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
      if (distance > 50) {
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
      
      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err: any) {
      console.error('Error dropping bean:', err);
      setError(locationError || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string> => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const canDrop = !beanStatus || beanStatus.can_drop_today;
  const growthLevel = beanStatus?.growth_level || 0;
  const dropCount = beanStatus?.drop_count || 0;
  const nextLevelAt = beanStatus?.next_level_at;

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <GrowthIcon level={success.growth_level} size={size === 'lg' ? 32 : 24} animate />
          <span className="text-[var(--color-text)] font-medium">
            {t('success')}
          </span>
        </div>
        {success.leveled_up && (
          <div className="text-[var(--color-primary)] font-semibold animate-pulse">
            🎉 {t('level_up', { level: success.growth_level_name })}
          </div>
        )}
        {showGrowthInfo && (
          <div className="text-sm text-[var(--color-textSecondary)]">
            {t('total_drops', { count: success.drop_count })}
            {success.next_level_at && (
              <span> • {t('next_level', { drops: success.next_level_at - success.drop_count })}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {showGrowthInfo && beanStatus?.has_bean && (
        <div className="flex items-center gap-2 mb-1">
          <GrowthIcon level={growthLevel} size={20} />
          <span className="text-sm text-[var(--color-textSecondary)]">
            {beanStatus.growth_level_name} • {t('drops', { count: dropCount })}
          </span>
        </div>
      )}
      
      <Button
        onClick={handleDropBean}
        disabled={!canDrop || isLoading || locationLoading}
        loading={isLoading || locationLoading}
        className={sizeClasses[size]}
        leftIcon={<span className="text-lg">🫘</span>}
      >
        {canDrop ? t('button') : t('already_today')}
      </Button>

      {error && (
        <div className="text-sm text-red-500 text-center mt-1">
          {error}
        </div>
      )}

      {!canDrop && showGrowthInfo && nextLevelAt && (
        <div className="text-xs text-[var(--color-textSecondary)] text-center">
          {t('next_level', { drops: nextLevelAt - dropCount })}
        </div>
      )}
    </div>
  );
}
