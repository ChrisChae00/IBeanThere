'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ToggleButton from '@/components/ui/ToggleButton';
import Card from '@/components/ui/Card';
import { useLocation } from '@/hooks/useLocation';

const STORAGE_KEY = 'location_auto_tracking_enabled';

export default function SettingsClient() {
  const t = useTranslations('settings');
  const { getCurrentLocation } = useLocation();
  const [autoTrackingEnabled, setAutoTrackingEnabled] = useState<boolean>(true);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isLoading, setIsLoading] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const enabled = stored !== 'false'; // Default to true if not set
      setAutoTrackingEnabled(enabled);
    }
    setIsLoading(false);
  }, []);

  // Check location permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        const state = result.state as 'prompt' | 'granted' | 'denied';
        setLocationPermission(state);

        result.onchange = () => {
          const newState = result.state as 'prompt' | 'granted' | 'denied';
          setLocationPermission(newState);
        };
      }).catch(() => {
        setLocationPermission('prompt');
      });
    }
  }, []);

  const handleToggleChange = (checked: boolean) => {
    setAutoTrackingEnabled(checked);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, checked.toString());
    }

    // If enabling and permission is granted, trigger a location request to start tracking
    // (The MapWithFilters component will pick up the preference change on next mount or permission check)
    if (checked && locationPermission === 'granted') {
      getCurrentLocation().catch(() => {
        // Silently handle errors - permission might be revoked
      });
    }
  };

  const getPermissionStatusText = () => {
    switch (locationPermission) {
      case 'granted':
        return t('permission_granted');
      case 'denied':
        return t('permission_denied');
      default:
        return t('permission_prompt');
    }
  };

  const getPermissionStatusColor = () => {
    switch (locationPermission) {
      case 'granted':
        return 'text-[var(--color-primary)]';
      case 'denied':
        return 'text-[var(--color-error)]';
      default:
        return 'text-[var(--color-text-secondary)]';
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Privacy & Location Section */}
      <Card variant="default" padding="lg">
        <Card header={
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            {t('privacy_location')}
          </h2>
        }>
          {/* Location Services */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-text)]">
                    {t('location_services')}
                  </h3>
                </div>
                <ToggleButton
                  checked={autoTrackingEnabled}
                  onChange={handleToggleChange}
                  disabled={locationPermission === 'denied'}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-[var(--color-text)] mb-1">
                    {t('auto_tracking_title')}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t('auto_tracking_description')}
                  </p>
                </div>

                {/* Permission Status */}
                <div className="pt-3 border-t border-[var(--color-border)]/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {t('location_permission_status')}
                    </span>
                    <span className={`text-sm font-medium ${getPermissionStatusColor()}`}>
                      {getPermissionStatusText()}
                    </span>
                  </div>
                  {locationPermission === 'denied' && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                      {t('manage_browser_settings')}
                    </p>
                  )}
                </div>

                {/* Data Usage Info */}
                <div className="pt-3 border-t border-[var(--color-border)]/60">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {t('location_data_usage')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );
}

