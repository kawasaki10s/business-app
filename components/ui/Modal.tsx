'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** If true, clicking the backdrop does not close (used for the receipt, which requires an explicit "Tayyor" tap) */
  disableBackdropClose?: boolean;
}

export function Modal({ open, onClose, children, disableBackdropClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={disableBackdropClose ? undefined : onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="animate-scaleIn max-w-full">
        {children}
      </div>
    </div>,
    document.body
  );
}
