'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, X } from 'lucide-react';

export default function FooterClient() {
  const t = useTranslations('footer');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const shareData = {
      title: 'IBeanThere',
      url: 'https://ibeanthere.app',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // AbortError means the user dismissed the share sheet — expected, no-op
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
      } catch {
        // Clipboard write failed (permission denied or insecure context)
        // TODO: show a toast with the URL for manual copy
      }
    }
  };

  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleOutside = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPopoverOpen(false);
    };

    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPopoverOpen]);

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleShare}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-primaryText)]/10 text-[var(--color-primaryText)] hover:bg-[var(--color-primaryText)]/20 transition-colors"
        aria-label="Share IBeanThere"
      >
        <ExternalLink size={16} />
      </button>

      <div className="relative" ref={popoverRef}>
        <button
          onClick={() => setIsPopoverOpen((v) => !v)}
          aria-expanded={isPopoverOpen}
          className="text-xs text-[var(--color-primaryText)]/60 underline underline-offset-2 hover:text-[var(--color-primaryText)] transition-colors"
        >
          {t('homescreen_link')}
        </button>

        {isPopoverOpen && (
          <div
            role="dialog"
            aria-labelledby="homescreen-popover-title"
            className="absolute bottom-full right-0 mb-3 w-72 rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-cardBackground)] shadow-[0_16px_48px_rgba(26,18,11,0.2)] z-50"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p id="homescreen-popover-title" className="font-semibold text-sm text-[var(--color-cardText)]">
                    {t('homescreen_modal_title')}
                  </p>
                  <p className="text-xs text-[var(--color-cardTextSecondary)] mt-0.5">
                    {t('homescreen_modal_description')}
                  </p>
                </div>
                <button
                  onClick={() => setIsPopoverOpen(false)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-cardText)] hover:bg-[var(--color-surface)]/80 transition-colors"
                  aria-label="Close"
                >
                  <X size={12} />
                </button>
              </div>

              <div className="space-y-3">
                {/* iOS Safari */}
                <div>
                  <p className="text-xs font-semibold text-[var(--color-cardText)] mb-1">
                    {t('homescreen_ios_title')}
                  </p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-xs text-[var(--color-cardTextSecondary)]">
                    <li>{t('homescreen_ios_step1')}</li>
                    <li>{t('homescreen_ios_step2')}</li>
                    <li>{t('homescreen_ios_step3')}</li>
                  </ol>
                </div>

                <div className="border-t border-[var(--color-border)]/40" />

                {/* Android Chrome */}
                <div>
                  <p className="text-xs font-semibold text-[var(--color-cardText)] mb-1">
                    {t('homescreen_android_title')}
                  </p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-xs text-[var(--color-cardTextSecondary)]">
                    <li>{t('homescreen_android_step1')}</li>
                    <li>{t('homescreen_android_step2')}</li>
                    <li>{t('homescreen_android_step3')}</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
