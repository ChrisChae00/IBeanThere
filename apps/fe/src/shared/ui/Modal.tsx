'use client';

import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './base/dialog';
import { cn } from '@/lib/cn';

/*
  Wrapper over the shadcn/Base UI dialog, keeping this repo's flat prop bag so none of
  the 8 calling pages changed.

  This is the component the whole shadcn decision was made for. The previous
  implementation was a portalled <div role="dialog" aria-modal="true"> that locked body
  scroll and closed on backdrop click — and did nothing else. It had no focus trap, no
  Escape handler and no focus restore, so a keyboard or screen-reader user could tab
  straight out of an open modal into the page behind it and never find their way back.
  Base UI supplies all three.

  MIGRATION: new code should use the compound API from '@/shared/ui/base/dialog'.
*/

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
  sm: 'sm:max-w-md',
  md: 'sm:max-w-2xl',
  lg: 'sm:max-w-4xl'
};

/* Base UI centres the popup; `top` is the only call sites' other option. */
const alignClasses: Record<ModalAlign, string> = {
  center: '',
  top: 'top-16 translate-y-0'
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
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={closeButton}
        style={{ zIndex }}
        className={cn(
          'rounded-(--card-radius) border-(--card-edge) bg-(--card-surface) p-6 sm:p-8',
          sizeClasses[size],
          alignClasses[align]
        )}
      >
        {/*
          Base UI requires a title for the accessible name. When a call site passes none,
          it still needs one, so the header is rendered only when there is something to
          show and the title falls back to a visually hidden node.
        */}
        {title ? (
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        ) : (
          <DialogTitle className="sr-only">Dialog</DialogTitle>
        )}

        <div className="space-y-6">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
