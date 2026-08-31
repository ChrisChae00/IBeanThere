'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useDismissable } from './useDismissable';

/*
  Plain text, like the three links beside it. It was a circular icon button, then briefly
  a label with a lucide share mark -- but lucide's is a node graph, not the glyph either
  platform uses for sharing, so it read as a decoration on a row that has none. Four
  labels of the same weight is the whole treatment.
*/
export function FooterShareButton() {
  const t = useTranslations('footer');

  const handleShare = async () => {
    const shareData = { title: 'ibeanthere', url: 'https://ibeanthere.app' };

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

  return (
    <button
      onClick={handleShare}
      className="text-ink-on-brand/70 hover:text-ink-on-brand transition-colors whitespace-nowrap"
    >
      {t('share')}
    </button>
  );
}

export function FooterHomescreenLink() {
  const t = useTranslations('footer');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismissable(isOpen, ref, () => setIsOpen(false));

  return (
    <div className="relative self-start sm:self-auto" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="text-ink-on-brand/70 underline underline-offset-2 hover:text-ink-on-brand transition-colors"
      >
        {t('homescreen_link')}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="homescreen-popover-title"
          className="absolute bottom-full left-0 mb-3 w-72 rounded-card border border-edge-default bg-surface-raised text-ink-primary shadow-(--ibean-shadow-warm-md) z-50 sm:left-auto sm:right-0"
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p id="homescreen-popover-title" className="font-semibold text-sm">
                  {t('homescreen_modal_title')}
                </p>
                <p className="text-xs text-ink-secondary mt-0.5">
                  {t('homescreen_modal_description')}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-(--btn-radius) bg-surface-elevated hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold mb-1">{t('homescreen_ios_title')}</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-xs text-ink-secondary">
                  <li>{t('homescreen_ios_step1')}</li>
                  <li>{t('homescreen_ios_step2')}</li>
                  <li>{t('homescreen_ios_step3')}</li>
                </ol>
              </div>

              <div className="border-t border-edge-subtle" />

              <div>
                <p className="text-xs font-semibold mb-1">{t('homescreen_android_title')}</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-xs text-ink-secondary">
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
  );
}
