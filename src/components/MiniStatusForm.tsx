import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  id: string;
  name: string;
}

interface MiniStatusFormProps {
  statusId: string;
  locationId: string;
  statuses: SelectOption[];
  locations: SelectOption[];
  currentStatusName: string;
  currentLocationName: string;
  onStatusChange: (id: string) => void;
  onLocationChange: (id: string) => void;
  onSave: () => void;
  isUpdating: boolean;
  hasChanges: boolean;
  getStatusColor?: (status: string) => string;
}

export const MiniStatusForm: React.FC<MiniStatusFormProps> = ({
  statusId,
  locationId,
  statuses,
  locations,
  currentStatusName,
  currentLocationName,
  onStatusChange,
  onLocationChange,
  onSave,
  isUpdating,
  hasChanges,
}) => {
  const [openDropdown, setOpenDropdown] = useState<'status' | 'location' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusClass = (status: string) => {
    if (status.toLowerCase() === 'entregado') {
      return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-800/40';
    }
    return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/40';
  };

  const getLocationClass = () => {
    return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/40';
  };

  return (
    <div ref={containerRef} className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-2 w-full">
      
      {/* Estado - Ocupa el espacio disponible */}
      <div className="relative flex-1 min-w-0">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
          className={`w-full h-8 flex items-center justify-between gap-1.5 px-2.5 rounded-lg text-xs font-medium transition-all border ${
            statusId 
              ? getStatusClass(currentStatusName)
              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          }`}
        >
          <span className="truncate flex-1 text-left">
            {statusId ? currentStatusName : 'Seleccionar estado'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
        </button>

        {openDropdown === 'status' && (
          <div className="absolute left-0 top-full mt-1 w-full min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto py-1">
            {statuses.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onStatusChange(s.id);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-all ${
                  s.id === statusId 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ubicación - Ocupa el espacio disponible */}
      <div className="relative flex-1 min-w-0">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
          className={`w-full h-8 flex items-center justify-between gap-1.5 px-2.5 rounded-lg text-xs font-medium transition-all border ${
            locationId 
              ? getLocationClass()
              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          }`}
        >
          <span className="truncate flex-1 text-left">
            {locationId ? currentLocationName : 'Seleccionar ubicación'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
        </button>

        {openDropdown === 'location' && (
          <div className="absolute left-0 top-full mt-1 w-full min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                onLocationChange('');
                setOpenDropdown(null);
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
            >
              Sin ubicación
            </button>
            {locations.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  onLocationChange(l.id);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-all ${
                  l.id === locationId 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Guardar y Pendiente */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges || isUpdating}
          className={`h-8 px-4 flex items-center justify-center rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-w-[60px] ${
            hasChanges && !isUpdating
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {isUpdating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-1.5 hidden sm:inline">Guardando</span>
              <span className="ml-1.5 sm:hidden">...</span>
            </>
          ) : (
            <span>Guardar</span>
          )}
        </button>

        {/* Indicador de cambios */}
        {hasChanges && (
          <div className="flex items-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="ml-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
              <span className="hidden xs:inline">Pendiente</span>
              <span className="xs:hidden">●</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};