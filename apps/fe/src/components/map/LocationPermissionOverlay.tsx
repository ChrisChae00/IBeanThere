'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshIcon, InfoIcon } from '@/components/ui';

interface LocationPermissionOverlayProps {
  onRequestPermission: () => void;
  permissionState: 'prompt' | 'denied';
}

type BrowserType = 'chrome' | 'safari' | 'firefox';

/*
  This stands in the map's frame, so it is the map's panel and nothing more: the eyebrow,
  the heading, the sentence, one action. The 80px brand disc and the blurred radial
  gradient behind it are gone -- neither carried information, and the disc read as a
  status badge on a screen that has no status to report. The browser guide is a rule and
  a list rather than a bordered box, because the frame around it is already the panel.
*/
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

  const denied = permissionState === 'denied';

  return (
    <div className="h-full overflow-y-auto rounded-(--radius-card) border border-edge-rule bg-surface-raised">
      <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-10 sm:px-10">
        <p className="landing-micro text-ink-secondary">{t('location_sharing')}</p>
        <h3 className="mt-3 text-2xl text-ink-primary">
          {denied ? t('location_permission_denied_title') : t('location_permission_title')}
        </h3>
        <p className="mt-2 leading-relaxed text-ink-secondary">
          {t('location_permission_reason')}
        </p>

        {denied ? (
          <>
            <div className="mt-8 border-t border-edge-rule pt-6">
              <div className="flex flex-wrap gap-2">
                {browsers.map((browser) => (
                  <button
                    key={browser.id}
                    onClick={() => setActiveBrowser(browser.id)}
                    aria-pressed={activeBrowser === browser.id}
                    className={`landing-micro min-h-11 rounded-(--radius-pill) border px-4 ${
                      activeBrowser === browser.id
                        ? 'relief-pressed border-brand bg-brand/12 text-ink-primary'
                        : 'relief-control border-edge-rule text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    {browser.label}
                  </button>
                ))}
              </div>

              <h4 className="landing-micro mt-6 text-ink-secondary">
                {t('browser_guide.title')}
              </h4>
              <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-ink-secondary">
                <li>
                  {t.rich(`browser_guide.${activeBrowser}_step1`, {
                    icon: () => <InfoIcon size={16} className="inline-block align-text-bottom text-ink-primary mx-0.5" />
                  })}
                </li>
                <li>{t(`browser_guide.${activeBrowser}_step2`)}</li>
              </ol>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="relief-control mt-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-(--btn-radius) bg-brand px-6 font-semibold text-ink-on-brand"
            >
              <RefreshIcon className="h-4 w-4" />
              <span>{t('browser_guide.refresh_page')}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onRequestPermission}
              className="relief-control mt-8 inline-flex min-h-11 w-fit items-center rounded-(--btn-radius) bg-brand px-6 font-semibold text-ink-on-brand"
            >
              {t('share_location')}
            </button>
            <p className="mt-3 text-sm text-ink-secondary">{t('browser_settings_guide')}</p>
          </>
        )}
      </div>
    </div>
  );
}
