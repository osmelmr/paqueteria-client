import { X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar mensaje de error"
        title="Cerrar mensaje de error"
        className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-500 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
      <span className="flex-1 selectable-text">{message}</span>
    </div>
  );
}