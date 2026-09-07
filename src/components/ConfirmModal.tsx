import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
              danger
                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white m-0">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 m-0 whitespace-pre-wrap break-words">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-end gap-2.5 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${
              danger
                ? 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-600'
                : 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-400 dark:hover:bg-purple-500'
            } text-white font-semibold rounded-xl px-4 py-2.5 text-sm cursor-pointer border-none transition-colors`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}