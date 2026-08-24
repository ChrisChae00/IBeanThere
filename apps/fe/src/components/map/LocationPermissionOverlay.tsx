'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LocationIcon } from '@/shared/ui';
import { RefreshIcon, InfoIcon } from '@/components/ui';

interface LocationPermissionOverlayProps {
  onRequestPermission: () => void;
  permissionState: 'prompt' | 'denied';
}

type BrowserType = 'chrome' | 'safari' | 'firefox';

export default function LocationPermissionOverlay({
  onRequestPermission,
  permissionState
}: LocationPermissionOverlayProps) {
  const t = useTranslations('map');
  const [activeBrowser, setActiveBrowser] = useState<BrowserType>('chrome');

  const browsers: { id: BrowserType; label: string }[] = [
    { id: 'chrome', label: t('browser_guide.chrome') },
    { id: 'safari', label: t('browser_guide.safari') },
    { id: 'firefox', label: t('browser_guide.firefox') },
  ];

  return (
    <div className="relative w-full h-full bg-linear-to-br from-surface to-background rounded-xl overflow-hidden border border-border">
      {/* Blurred background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, var(--color-primary) 0%, transparent 50%), radial-gradient(circle at 80% 70%, var(--color-accent) 0%, transparent 50%)',
          filter: 'blur(60px)'
        }} />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center overflow-y-auto">
        <div className="text-center px-6 py-8 max-w-md w-full">
          {/* Location Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <LocationIcon size={40} className="text-primary" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-text mb-3">
            {permissionState === 'denied' 
              ? t('location_permission_denied_title')
              : t('location_permission_title')
            }
          </h3>

          {/* Description */}
          <p className="text-(--color-text-secondary) mb-6 leading-relaxed">
            {t('location_permission_reason')}
          </p>

          {/* Permission Denied Guide */}
          {permissionState === 'denied' ? (
            <div className="animate-fade-in">
              {/* Browser Tabs */}
              <div className="flex p-1 bg-(--color-surface-hover) rounded-lg mb-4">
                {browsers.map((browser) => (
                  <button
                    key={browser.id}
                    onClick={() => setActiveBrowser(browser.id)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      activeBrowser === browser.id
                        ? 'bg-surface text-text shadow-xs'
                        : 'text-(--color-text-secondary) hover:text-text'
                    }`}
                  >
                    {browser.label}
                  </button>
                ))}
              </div>

              {/* Guide Steps */}
              <div className="bg-surface p-4 rounded-lg border border-border text-left mb-6">
                <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                  {t('browser_guide.title')}
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-(--color-text-secondary)">
                  <li>
                    {t.rich(`browser_guide.${activeBrowser}_step1`, {
                      icon: () => <InfoIcon size={16} className="inline-block align-text-bottom text-text mx-0.5" />
                    })}
                  </li>
                  <li>{t(`browser_guide.${activeBrowser}_step2`)}</li>
                </ol>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-primaryText px-6 py-3 rounded-full font-semibold hover:bg-secondary transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshIcon className="w-5 h-5" />
                <span>{t('browser_guide.refresh_page')}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Info message for prompt state */}
              {permissionState === 'prompt' && (
                <div className="mb-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <p className="text-sm text-(--color-text-secondary)">
                    {t('browser_settings_guide')}
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={onRequestPermission}
                className="bg-primary text-primaryText px-8 py-3 rounded-full font-semibold hover:bg-secondary transition-colors shadow-lg min-h-[44px]"
              >
                {t('share_location')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
