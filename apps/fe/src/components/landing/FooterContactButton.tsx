'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useDismissable } from './useDismissable';

interface FooterContactButtonProps {
  label: string;
}

export default function FooterContactButton({ label }: FooterContactButtonProps) {
  const t = useTranslations('footer');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismissable(isOpen, ref, () => setIsOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="text-ink-on-brand/70 hover:text-ink-on-brand transition-colors whitespace-nowrap"
      >
        {label}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="contact-popover-title"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 rounded-card border border-edge-default bg-surface-raised text-ink-primary shadow-(--ibean-shadow-warm-md) z-50"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p id="contact-popover-title" className="font-semibold text-sm">
                {label}
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-(--btn-radius) bg-surface-elevated hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold mb-1">{t('contact_email_label')}</p>
                <a
                  href="mailto:ibeanthere.app@gmail.com"
                  className="text-brand hover:underline break-all"
                >
                  ibeanthere.app@gmail.com
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">{t('contact_instagram_label')}</p>
                <a
                  href="https://www.instagram.com/ibeanthere_official?igsh=d25qMGJ6Y2cyNDBl&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  @ibeanthere_official
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
