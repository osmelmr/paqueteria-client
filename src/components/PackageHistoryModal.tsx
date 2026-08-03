import React from 'react';
import { History, X } from 'lucide-react';
import type { PackageHistoryItem } from '../api/packages.api';

interface PackageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: {
    data: PackageHistoryItem[] | undefined;
    isLoading: boolean;
  };
}

export const PackageHistoryModal: React.FC<PackageHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  if (!isOpen) return null;

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
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{h.status?.name || 'Sin estado'}</span>
                    <span className="text-xs text-gray-500">{h.location?.name || 'Sin ubicación'} - {new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};