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
  zIndex?: number;
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
  closeButton = true,
  zIndex = 1000
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
      style={{ zIndex }}
      className={`fixed inset-0 flex ${alignClasses[align]} justify-center px-4 sm:px-6 lg:px-8 backdrop-blur-xs bg-black/40`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`w-full ${sizeClasses[size]} relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-background/5 blur-3xl rounded-[40px]" />
        <div className="relative rounded-[32px] border border-border/60 bg-cardBackground shadow-[0_30px_80px_rgba(26,18,11,0.25)] transition-all duration-200">
          <div className="p-6 sm:p-8">
            {(title || closeButton) && (
              <div className="mb-6 flex items-start justify-between gap-6">
                {title && (
                  <div>
                    <h2
                      id="modal-title"
                      className="text-2xl font-semibold text-cardText"
                    >
                      {title}
                    </h2>
                    {description && (
                      <p className="mt-2 text-cardTextSecondary">
                        {description}
                      </p>
                    )}
                  </div>
                )}
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-surface text-cardText transition hover:bg-surface/80 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Close modal"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                )}
              </div>
            )}

            <div className="space-y-6 text-cardText">
              {children}
            </div>
          </div>

          {footer && (
            <div className="border-t border-border/60 bg-surface/40 px-6 py-4 sm:px-8">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

