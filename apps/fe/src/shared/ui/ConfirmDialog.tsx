'use client';

import Modal from './Modal';
import Button from './Button';

/*
  A dialog, not `confirm()`: the browser's own blocks the page, cannot be translated,
  and cannot be told what it is about to undo. Same shape the unfollow confirmation
  already uses -- body text, then cancel beside the action, the action on the right.

  Every string is passed in. Nothing here reaches for a namespace, because the three
  places that ask a question like this read from three different ones.
*/

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-ink-secondary">{body}</p>
      <div className="mt-6 flex justify-end gap-2">
        {/*
          Cancel keeps the outline and sits first: leaving is the cheaper choice, and
          the one a reader lands on if they press the dialog open by accident.
        */}
        <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} size="md" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
