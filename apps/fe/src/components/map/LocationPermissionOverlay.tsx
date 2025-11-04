'use client';

import { useTranslations } from 'next-intl';
import LocationIcon from '@/components/ui/LocationIcon';

interface LocationPermissionOverlayProps {
  onRequestPermission: () => void;
  permissionState: 'prompt' | 'denied';
}

export default function LocationPermissionOverlay({
  onRequestPermission,
  permissionState
}: LocationPermissionOverlayProps) {
  const t = useTranslations('trending_cafes');
  const tMap = useTranslations('map');

  return (
    <div className="relative w-full h-full min-h-[450px] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)] rounded-xl overflow-hidden border border-[var(--color-border)]">
      {/* Blurred background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, var(--color-primary) 0%, transparent 50%), radial-gradient(circle at 80% 70%, var(--color-accent) 0%, transparent 50%)',
          filter: 'blur(60px)'
        }} />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          {/* Location Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <LocationIcon size={40} className="text-[var(--color-primary)]" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
            {permissionState === 'denied' 
              ? t('location_permission_denied_title')
              : t('location_permission_title')
            }
          </h3>

          {/* Description */}
          <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
            {t('location_permission_reason')}
          </p>

          {/* Permission Denied Hint */}
          {permissionState === 'denied' && (
            <div className="mb-6 p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {t('location_permission_denied_hint')}
              </p>
            </div>
          )}

          {/* Info message for prompt state */}
          {permissionState === 'prompt' && (
            <div className="mb-6 p-4 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-lg">
              <p className="text-sm text-[var(--color-text-secondary)]">
                {tMap('browser_settings_guide')}
              </p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={onRequestPermission}
            className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-8 py-3 rounded-full font-semibold hover:bg-[var(--color-secondary)] transition-colors shadow-lg min-h-[44px]"
          >
            {permissionState === 'denied' 
              ? t('location_permission_retry')
              : t('share_location')
            }
          </button>
        </div>
      </div>
    </div>
  );
}

