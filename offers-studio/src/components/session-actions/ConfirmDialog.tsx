import { useEffect, useRef } from 'react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    // Focus the confirm button when dialog opens
    const confirmButton = dialogRef.current?.querySelector<HTMLButtonElement>('[data-confirm-button]');
    confirmButton?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantColors = {
    danger: {
      icon: '⚠️',
      iconBg: 'bg-red-900/50',
      iconText: 'text-red-400',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      confirmText: 'text-white',
    },
    warning: {
      icon: '⚡',
      iconBg: 'bg-yellow-900/50',
      iconText: 'text-yellow-400',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      confirmText: 'text-gray-900',
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-900/50',
      iconText: 'text-blue-400',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      confirmText: 'text-white',
    },
  };

  const colors = variantColors[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-700">
          <div className={`flex-none w-10 h-10 rounded-full ${colors.iconBg} flex items-center justify-center text-xl`}>
            {colors.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
          </div>
        </div>

        {/* Message */}
        <div className="p-4">
          <p className="text-gray-300 whitespace-pre-line">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 p-4 bg-gray-900/50 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            data-confirm-button
            onClick={onConfirm}
            className={`px-4 py-2 rounded ${colors.confirmBg} ${colors.confirmText} transition-colors font-medium`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
