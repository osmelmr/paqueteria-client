import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function useConfirm(): [ReactNode, (opts: string | ConfirmOptions) => Promise<boolean>] {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback((opts: string | ConfirmOptions) => {
    const normalized: ConfirmOptions = typeof opts === 'string' ? { message: opts } : opts;
    setOptions(normalized);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current(true);
    setOptions(null);
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current(false);
    setOptions(null);
  }, []);

  const element: ReactNode = (
    <ConfirmModal
      isOpen={options !== null}
      title={options?.title}
      message={options?.message ?? ''}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      danger={options?.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return [element, confirm];
}