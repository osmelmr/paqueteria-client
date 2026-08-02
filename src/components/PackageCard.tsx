import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  User, 
  MapPin, 
  Package, 
  Weight, 
  Edit2, 
  Trash2, 
  FileText, 
  Building2,
  Activity,
  Compass,
  History,
  X
} from 'lucide-react';
import { usePackageHistory } from '../hooks/usePackages';
import type { PackageHistoryItem } from '../api/packages.api';

export interface PackageData {
  id: string;
  guide?: { externalRef: string; agency: { name: string } };
  recipient?: { fullName: string | null };
  province?: { name: string };
  municipe?: { name: string };
  weight?: number | string | null;
  status: { name: string; id?: string };
  location?: { name: string; id?: string };
  alert?: boolean | null;
  alertDescription?: string;
  hbls: { hblCode: string }[];
}

interface SelectOption {
  id: string;
  name: string;
}

interface PackageCardProps {
  data: PackageData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStatus?: (id: string, statusId: string, locationId: string) => void;
  statuses?: SelectOption[];
  locations?: SelectOption[];
}

const maskName = (fullName?: string | null) => {
  if (!fullName) return 'Sin nombre';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].length > 3 ? `${parts[0].slice(0, 3)}***` : parts[0];
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.slice(0, 3)}***${last.slice(-3)}`;
};

export const PackageCard: React.FC<PackageCardProps> = ({ 
  data, 
  onEdit, 
  onDelete, 
  onUpdateStatus, 
  statuses = [], 
  locations = [] 
}) => {
  const primaryHbl = data.hbls[0]?.hblCode || 'SIN HBL';
  const extraHblCount = data.hbls.length > 1 ? data.hbls.length - 1 : 0;
  const isAlert = data.alert === true;

  const [statusId, setStatusId] = useState(data.status.id || '');
  const [locationId, setLocationId] = useState(data.location?.id || '');

  const [openDropdown, setOpenDropdown] = useState<'status' | 'location' | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const history = usePackageHistory(data.id, showHistory);
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

  const currentStatusName = statuses.find(s => s.id === statusId)?.name || data.status.name;
  const currentLocationName = locations.find(l => l.id === locationId)?.name || data.location?.name || 'Sin ubicación';

  const handleSelectStatus = (id: string) => {
    setStatusId(id);
    setOpenDropdown(null);
    if (onUpdateStatus) onUpdateStatus(data.id, id, locationId);
  };

  const handleSelectLocation = (id: string) => {
    setLocationId(id);
    setOpenDropdown(null);
    if (onUpdateStatus) onUpdateStatus(data.id, statusId, id);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col sm:flex-row gap-4 p-3.5 border rounded-xl bg-[#b8b8b8] dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      
      {/* Bloque Principal (Datos del paquete) */}
      <div className="flex flex-1 flex-col gap-2.5 min-w-0">
        
        {/* Fila 1: HBL y Alerta alineada verticalmente con el peso */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Package className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {primaryHbl}
            </span>
            {extraHblCount > 0 && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full shrink-0">
                +{extraHblCount}
              </span>
            )}
          </div>

          {/* Alerta con el diseño de los botones de acción, alineada arriba con el peso */}
          {isAlert && (
            <div className="flex sm:w-28 shrink-0 justify-end sm:justify-center">
              <div 
                className="w-9 h-9 flex items-center justify-center rounded bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-help"
                title={data.alertDescription || "Paquete con alerta"}
              >
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              </div>
            </div>
          )}
        </div>

        {/* Fila 2: Guía y Agencia */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 pb-2">
          <span className="flex items-center gap-1.5 truncate max-w-[150px]" title="Guía">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{data.guide?.externalRef || 'Sin guía'}</span>
          </span>
          <span className="flex items-center gap-1.5 truncate max-w-[150px]" title="Agencia">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{data.guide?.agency?.name || 'Sin agencia'}</span>
          </span>
        </div>

        {/* Fila 3: Estado, Locación, Cliente, Destino y Peso en texto plano */}
        <div className="flex flex-wrap items-center  justify-between gap-3 pt-1 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Estado como texto plano */}
            <span className="flex items-center gap-1.5 truncate max-w-[150px]" title="Estado">
              <Activity className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-semibold uppercase text-xs">{currentStatusName}</span>
            </span>

            {/* Locación */}
            <span className="flex items-center gap-1.5 truncate max-w-[150px]" title="Ubicación">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate text-xs">{currentLocationName}</span>
            </span>

            <span className="flex items-center gap-1.5 truncate max-w-[160px]" title="Destinatario">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{maskName(data.recipient?.fullName)}</span>
            </span>

            {/* Destino: Provincia */}
            <span className="flex items-center gap-1.5 truncate max-w-[150px]" title="Provincia">
              <Compass className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{data.province?.name || '—'}</span>
            </span>

            {/* Destino: Municipio */}
            <span className="flex items-center gap-1.5 truncate max-w-[150px]" title="Municipio">
              <Compass className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{data.municipe?.name || '—'}</span>
            </span>

          </div>
          
          <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs shrink-0" title="Peso">
            <Weight className="w-4 h-4 text-slate-400 shrink-0" />
            {data.weight ? `${Number(data.weight).toFixed(1)} kg` : '--'}
          </span>
        </div>
      </div>

      {/* Sección Derecha: Grid 2x2 con separación vertical y hover más claro */}
      <div className="flex items-center justify-center sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4 shrink-0">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 w-full sm:w-28 package-card-actions">
          
          {/* Botón Cambiar Estado */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              className="w-full h-9 flex items-center justify-center rounded bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              title="Cambiar estado"
            >
              <Activity className="w-4 h-4 text-blue-500" />
            </button>

            {openDropdown === 'status' && (
              <div className="absolute right-0 sm:right-full sm:mr-2 top-full sm:top-0 mt-1 sm:mt-0 w-48 bg-[#dbdbdb] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-xl z-30 max-h-48 overflow-y-auto p-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                  Seleccionar Estado
                </div>
                {statuses.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStatus(s.id)}
                    className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                      s.id === statusId 
                        ? 'bg-slate-100 dark:bg-slate-800 font-bold' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón Cambiar Locación */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
              className="w-full h-9 flex items-center justify-center rounded bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              title="Cambiar ubicación"
            >
              <MapPin className="w-4 h-4 text-emerald-500" />
            </button>

            {openDropdown === 'location' && (
              <div className="absolute right-0 sm:right-full sm:mr-2 top-full sm:top-0 mt-1 sm:mt-0 w-48 bg-[#dbdbdb] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-xl z-30 max-h-48 overflow-y-auto p-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                  Seleccionar Ubicación
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectLocation('')}
                  className="w-full text-left px-2 py-1 text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded transition-colors"
                >
                  Sin ubicación
                </button>
                {locations.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleSelectLocation(l.id)}
                    className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                      l.id === locationId 
                        ? 'bg-slate-100 dark:bg-slate-800 font-bold' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón Editar */}
          <button
            type="button"
            onClick={() => onEdit(data.id)}
            className="w-full h-9 flex items-center justify-center rounded bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            title="Editar paquete"
          >
            <Edit2 className="w-4 h-4 text-purple-500" />
          </button>

          {/* Botón Eliminar */}
          <button
            type="button"
            onClick={() => onDelete(data.id)}
            className="w-full h-9 flex items-center justify-center rounded bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            title="Eliminar paquete"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>

        </div>

        {/* Botón Ver Historial */}
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="mt-2 w-full h-8 flex items-center justify-center gap-1.5 rounded bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors duration-200 cursor-pointer"
          title="Ver historial del paquete"
        >
          <History className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          Historial
        </button>
      </div>

      {/* Modal de historial */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="w-full max-w-md max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-[#dbdbdb] dark:bg-[#1e1f27] shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
                Historial del paquete
              </h3>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {history.isLoading && (
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Cargando historial...</p>
            )}
            {history.isError && (
              <p className="text-xs text-red-600 dark:text-red-400 m-0">
                No se pudo cargar el historial: {(history.error as Error)?.message}
              </p>
            )}
            {!history.isLoading && !history.isError && (!history.data || history.data.length === 0) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Sin movimientos registrados</p>
            )}

            {history.data && history.data.length > 0 && (
              <ol className="flex flex-col gap-0">
                {history.data.map((h: PackageHistoryItem, index: number) => (
                  <li key={h.id} className="flex gap-3 items-stretch">
                    <div className="flex flex-col items-center shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${index === 0 ? 'bg-purple-500' : 'bg-slate-400 dark:bg-slate-600'}`} />
                      {index < history.data.length - 1 && (
                        <span className="w-px flex-1 bg-slate-300 dark:bg-slate-700 min-h-6" />
                      )}
                    </div>
                    <div className="pb-3 min-w-0">
                      <p className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200 m-0">
                        {h.status?.name || 'Sin estado'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 m-0 truncate">
                        {h.location?.name || 'Sin ubicación'}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 m-0">
                        {new Date(h.createdAt).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

    </div>
  );
};