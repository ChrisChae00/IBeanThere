'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type ModalSize = 'sm' | 'md' | 'lg';
type ModalAlign = 'center' | 'top';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  footer?: ReactNode;
  size?: ModalSize;
  align?: ModalAlign;
  children: ReactNode;
  closeButton?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl'
};

const alignClasses: Record<ModalAlign, string> = {
  center: 'items-center',
  top: 'items-start pt-16'
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  align = 'center',
  children,
  closeButton = true
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const originalOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, mounted]);

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[1000] flex ${alignClasses[align]} justify-center px-4 sm:px-6 lg:px-8 backdrop-blur-sm bg-black/40`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`w-full ${sizeClasses[size]} relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-[var(--color-background)]/5 blur-3xl rounded-[40px]" />
        <div className="relative rounded-[32px] border border-[var(--color-border)]/60 bg-[var(--color-cardBackground)] shadow-[0_30px_80px_rgba(26,18,11,0.25)] transition-all duration-200">
          <div className="p-6 sm:p-8">
            {(title || closeButton) && (
              <div className="mb-6 flex items-start justify-between gap-6">
                {title && (
                  <div>
                    <h2
                      id="modal-title"
                      className="text-2xl font-semibold text-[var(--color-cardText)]"
                    >
                      {title}
                    </h2>
                    {description && (
                      <p className="mt-2 text-[var(--color-cardTextSecondary)]">
                        {description}
                      </p>
                    )}
                  </div>
                )}
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-cardText)] transition hover:bg-[var(--color-surface)]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    aria-label="Close modal"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                )}
              </div>
            )}

            <div className="space-y-6 text-[var(--color-cardText)]">
              {children}
            </div>
          </div>

          {footer && (
            <div className="border-t border-[var(--color-border)]/60 bg-[var(--color-surface)]/40 px-6 py-4 sm:px-8">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

