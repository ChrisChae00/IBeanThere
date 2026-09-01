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
    <div className="relative h-full w-full overflow-hidden rounded-(--radius-card) border border-edge-rule bg-surface-raised">
      {/* Blurred background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, var(--brand) 0%, transparent 50%), radial-gradient(circle at 80% 70%, var(--brand-muted) 0%, transparent 50%)',
          filter: 'blur(60px)'
        }} />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center overflow-y-auto">
        <div className="text-center px-6 py-8 max-w-md w-full">
          {/* Location Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-(--radius-pill) bg-brand/12">
              <LocationIcon size={40} className="text-brand" />
            </div>
          </div>

          {/* Title */}
          <h3 className="mb-3 text-xl text-ink-primary">
            {permissionState === 'denied' 
              ? t('location_permission_denied_title')
              : t('location_permission_title')
            }
          </h3>

          {/* Description */}
          <p className="text-ink-secondary mb-6 leading-relaxed">
            {t('location_permission_reason')}
          </p>

          {/* Permission Denied Guide */}
          {permissionState === 'denied' ? (
            <div className="animate-fade-in">
              {/* Browser Tabs */}
              <div className="mb-4 flex gap-1 rounded-(--radius-control) border border-edge-rule p-1">
                {browsers.map((browser) => (
                  <button
                    key={browser.id}
                    onClick={() => setActiveBrowser(browser.id)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      activeBrowser === browser.id
                        ? 'relief-pressed bg-surface-raised text-ink-primary'
                        : 'text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    {browser.label}
                  </button>
                ))}
              </div>

              {/* Guide Steps */}
              <div className="mb-6 rounded-(--radius-control) border border-edge-rule bg-surface-raised p-4 text-left">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-primary">
                  {t('browser_guide.title')}
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-ink-secondary">
                  <li>
                    {t.rich(`browser_guide.${activeBrowser}_step1`, {
                      icon: () => <InfoIcon size={16} className="inline-block align-text-bottom text-ink-primary mx-0.5" />
                    })}
                  </li>
                  <li>{t(`browser_guide.${activeBrowser}_step2`)}</li>
                </ol>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="relief-control flex min-h-11 w-full items-center justify-center gap-2 rounded-(--btn-radius) bg-brand px-6 font-semibold text-ink-on-brand"
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
                  <p className="text-sm text-ink-secondary">
                    {t('browser_settings_guide')}
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={onRequestPermission}
                className="relief-control min-h-11 rounded-(--btn-radius) bg-brand px-8 font-semibold text-ink-on-brand"
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
