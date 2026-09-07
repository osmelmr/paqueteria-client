import React, { useState } from 'react';
import { History, Trash2, X } from 'lucide-react';
import type { PackageHistoryItem } from '../api/packages.api';
import { useAuthStore } from '../store/auth.store';
import { useDeletePackageHistory } from '../hooks/usePackages';
import { useConfirm } from '../hooks/useConfirm';

interface PackageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  history: {
    data: PackageHistoryItem[] | undefined;
    isLoading: boolean;
  };
}

export const PackageHistoryModal: React.FC<PackageHistoryModalProps> = ({
  isOpen,
  onClose,
  packageId,
  history,
}) => {
  const isAdmin = useAuthStore((s) => s.user?.role) === 'ADMIN';
  const deleteHistory = useDeletePackageHistory();
  const [confirmModal, confirm] = useConfirm();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (historyId: string) => {
    const ok = await confirm({
      message: '¿Eliminar este movimiento del historial?',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    setDeletingId(historyId);
    try {
      await deleteHistory.mutateAsync({ packageId, historyId });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md max-h-[85vh] flex flex-col rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" /> Historial de Movimientos
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {history.isLoading && <div className="text-center py-6 text-sm text-gray-500">Cargando...</div>}
          {history.data && (
            <div className="border-l border-gray-200 dark:border-gray-700 ml-2 space-y-4">
              {history.data.map((h: PackageHistoryItem, i: number) => (
                <div key={h.id} className="relative pl-5">
                  <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-gray-900 ${i === 0 ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{h.status?.name || 'Sin estado'}</span>
                      <span className="text-xs text-gray-500">{h.location?.name || 'Sin ubicación'} - {new Date(h.createdAt).toLocaleDateString()}</span>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(h.id)}
                        disabled={deletingId === h.id}
                        title="Eliminar movimiento"
                        className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                      >
                        {deletingId === h.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {confirmModal}
    </div>
  );
};