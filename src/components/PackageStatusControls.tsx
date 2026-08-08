import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Save } from 'lucide-react';
import { toLocalDateInput } from '../utils/date';

interface SelectOption {
  id: string;
  name: string;
}

interface PackageStatusControlsProps {
  statusId: string;
  locationId: string;
  statusDate: string;
  currentStatusName: string;
  currentLocationName: string;
  hasChanges: boolean;
  isUpdating: boolean;
  statuses: SelectOption[];
  locations: SelectOption[];
  onStatusChange: (id: string) => void;
  onLocationChange: (id: string) => void;
  onStatusDateChange: (date: string) => void;
  onSave: () => void;
  getStatusStyle: (status: string) => string;
}

export const PackageStatusControls: React.FC<PackageStatusControlsProps> = ({
  statusId,
  locationId,
  statusDate,
  currentStatusName,
  currentLocationName,
  hasChanges,
  isUpdating,
  statuses,
  locations,
  onStatusChange,
  onLocationChange,
  onStatusDateChange,
  onSave,
  getStatusStyle,
}) => {
  const [openDropdown, setOpenDropdown] = useState<'status' | 'location' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="flex items-center gap-3 not-lg:gap-1 max-w-50">
      <div className="flex flex-col gap-1 w-full min-w-0 sm:flex-none sm:min-w-30 sm:max-w-40">
        {/* Select Estado */}
        <div className="relative w-full sm:max-w-40 sm:min-w-40">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
            className={`w-full h-8 flex items-center justify-between gap-2 px-3 rounded-md text-sm font-medium transition-all ring-1 ring-inset ${getStatusStyle(currentStatusName)}`}
          >
            <span className="truncate">{currentStatusName}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
          </button>

          {openDropdown === 'status' && (
            <div className="absolute left-0 top-full mt-1 w-full min-w-[160px] max-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto py-1">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onStatusChange(s.id);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-all ${
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

        {/* Select Ubicación */}
        <div className="relative w-full sm:max-w-40 sm:min-w-30">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
            className="w-full h-8 flex items-center justify-between gap-2 px-3 rounded-md text-sm font-medium bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 transition-colors"
          >
            <span className="truncate">{currentLocationName}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
          </button>

          {openDropdown === 'location' && (
            <div className="absolute left-0 top-full mt-1 w-full min-w-[160px] max-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto py-1">
              <button
                type="button"
                onClick={() => {
                  onLocationChange('');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-2 text-sm italic text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
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
                  className={`w-full text-left px-3 py-2 text-sm transition-all ${
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
        {/* Fecha del cambio de estado */}
        <div className="relative w-full sm:max-w-40 sm:min-w-30">
          <input
            type="date"
            value={statusDate}
            max={toLocalDateInput(new Date().toISOString())}
            onChange={(e) => onStatusDateChange(e.target.value)}
            title="Fecha del cambio de estado"
            className="w-full h-8 px-2 rounded-md text-sm bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 transition-colors"
          />
        </div>
      </div>

      {/* Botón Guardar */}
      <button
        onClick={onSave}
        disabled={!hasChanges || isUpdating}
        title={hasChanges ? "Guardar cambios" : "Sin cambios para guardar"}
        className={`p-2 rounded-md transition-all shrink-0 ${
          hasChanges 
            ? 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900' 
            : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
        }`}
      >
        {isUpdating ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};