import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const showCancel = Boolean(onCancel && cancelText);

  useEffect(() => {
    if (!open) return;
    const nextFocus = showCancel ? cancelButtonRef.current : confirmButtonRef.current;
    nextFocus?.focus();
  }, [open, showCancel]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (onCancel) onCancel();
        else onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onCancel, onConfirm]);

  const focusableButtons = [cancelButtonRef.current, confirmButtonRef.current].filter(
    Boolean,
  ) as HTMLButtonElement[];

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      if (focusableButtons.length === 0) return;

      const firstButton = focusableButtons[0];
      const lastButton = focusableButtons[focusableButtons.length - 1];

      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      if (focusableButtons.length < 2) return;
      event.preventDefault();
      const currentIndex = focusableButtons.findIndex(
        (button) => button === document.activeElement,
      );
      const nextButton = focusableButtons[(currentIndex + 1) % focusableButtons.length];
      nextButton?.focus();
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      if (focusableButtons.length < 2) return;
      event.preventDefault();
      const currentIndex = focusableButtons.findIndex(
        (button) => button === document.activeElement,
      );
      const prevButton = focusableButtons[
        (currentIndex - 1 + focusableButtons.length) % focusableButtons.length
      ];
      prevButton?.focus();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (document.activeElement === confirmButtonRef.current) {
        event.preventDefault();
        onConfirm();
      } else if (document.activeElement === cancelButtonRef.current) {
        event.preventDefault();
        onCancel?.();
      }
    }
  };

  if (!open) return null;

  return (
    <div className="confirm-backdrop" role="presentation">
      <div
        className="confirm-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onKeyDown={handleDialogKeyDown}
        tabIndex={-1}
      >
        <h3 id="confirm-dialog-title">{title}</h3>
        <p id="confirm-dialog-message">{message}</p>
        <div className="confirm-actions">
          {showCancel ? (
            <button
              type="button"
              className="confirm-button confirm-cancel"
              onClick={onCancel}
              ref={cancelButtonRef}
            >
              {cancelText}
            </button>
          ) : null}
          <button
            type="button"
            className="confirm-button confirm-ok"
            onClick={onConfirm}
            ref={confirmButtonRef}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style jsx>{`
        .confirm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .confirm-dialog {
          width: min(100%, 420px);
          background: var(--surface-strong);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          color: var(--foreground);
          text-align: left;
          outline: none;
        }

        .confirm-dialog h3 {
          margin: 0 0 12px;
          font-size: 22px;
          color: var(--foreground);
        }

        .confirm-dialog p {
          margin: 0 0 24px;
          line-height: 1.6;
          color: var(--muted);
        }

        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .confirm-button {
          min-width: 100px;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .confirm-button:focus-visible {
          outline: 3px solid var(--accent);
          outline-offset: 4px;
        }

        .confirm-cancel {
          background: var(--surface-soft);
          color: var(--foreground);
        }

        .confirm-ok {
          background: var(--success);
          color: var(--foreground);
        }

        .confirm-ok:hover {
          background: var(--success);
          opacity: 0.8;
        }

        .confirm-cancel:hover {
          background: var(--surface);
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
