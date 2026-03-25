'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface FooterContactButtonProps {
  label: string;
}

export default function FooterContactButton({ label }: FooterContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="text-[var(--color-primaryText)]/70 hover:text-[var(--color-primaryText)] transition-colors whitespace-nowrap"
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-cardBackground)] shadow-[0_16px_48px_rgba(26,18,11,0.2)] z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm text-[var(--color-cardText)]">Contact Us</p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-cardText)] hover:bg-[var(--color-surface)]/80 transition-colors"
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-[var(--color-cardText)] mb-1">Email</p>
                <a
                  href="mailto:ibeanthere.app@gmail.com"
                  className="text-[var(--color-primary)] hover:underline break-all"
                >
                  ibeanthere.app@gmail.com
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-cardText)] mb-1">Instagram</p>
                <a
                  href="https://www.instagram.com/ibeanthere_official?igsh=d25qMGJ6Y2cyNDBl&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:underline"
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
