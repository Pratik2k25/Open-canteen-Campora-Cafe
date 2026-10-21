import { useEffect, useRef } from 'react';

export interface UseAccessibleDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Accessible Dialog & Bottom Sheet Controller Hook
 * - Captures triggering element and restores focus upon modal dismissal
 * - Focuses first interactive element on mount
 * - Traps Tab / Shift+Tab keyboard cycling within the dialog
 * - Listens for Escape key to cleanly dismiss
 */
export function useAccessibleDialog({
  isOpen,
  onClose,
  initialFocusRef,
}: UseAccessibleDialogOptions) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture triggering element before focus shifts
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }

    // Move focus inside dialog on next paint
    const rAf = requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogRef.current.setAttribute('tabindex', '-1');
          dialogRef.current.focus();
        }
      }
    });

    // Keyboard trap and Escape listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(rAf);
      window.removeEventListener('keydown', handleKeyDown);

      // Restore focus to triggering element
      const trigger = triggerRef.current;
      if (trigger && typeof trigger.focus === 'function' && document.contains(trigger)) {
        trigger.focus();
      }
    };
  }, [isOpen, onClose, initialFocusRef]);

  return dialogRef;
}
