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
  Compass,
  History,
  Eye,
  X
} from 'lucide-react';
import { usePackageHistory } from '../hooks/usePackages';
import type { PackageHistoryItem } from '../api/packages.api';
import { MiniStatusForm } from './MiniStatusForm';

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
  onView?: (id: string) => void;
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
  onView,
  onUpdateStatus, 
  statuses = [], 
  locations = [] 
}) => {
  const primaryHbl = data.hbls[0]?.hblCode || 'SIN HBL';
  const extraHblCount = data.hbls.length > 1 ? data.hbls.length - 1 : 0;
  const isAlert = data.alert === true;

  const [statusId, setStatusId] = useState(data.status.id || '');
  const [locationId, setLocationId] = useState(data.location?.id || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const history = usePackageHistory(data.id, showHistory);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentStatusName = statuses.find(s => s.id === statusId)?.name || data.status.name;
  const currentLocationName = locations.find(l => l.id === locationId)?.name || data.location?.name || 'Sin ubicación';

  const hasChanges = statusId !== (data.status.id || '') || locationId !== (data.location?.id || '');

  const handleSaveChanges = async () => {
    if (!onUpdateStatus || !hasChanges) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(data.id, statusId, locationId);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'entregado': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      'en tránsito': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'pendiente': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      'en bodega': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    };
    return colors[status.toLowerCase()] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  };

  return (
    <div ref={containerRef} className="relative group bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 p-4">
      
      {/* Layout Principal */}
      <div className="flex flex-col gap-2.5">
        
        {/* Fila 1: HBL y acciones rápidas (Peso, Historial, Alerta) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
              <Package className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-mono text-base font-bold text-gray-900 dark:text-white truncate">
              {primaryHbl}
            </span>
            {extraHblCount > 0 && (
              <span className="text-[10px] font-semibold text-white bg-purple-500 dark:bg-purple-400 px-2 py-0.5 rounded-full shrink-0">
                +{extraHblCount}
              </span>
            )}
          </div>

          {/* Grupo: Peso, Historial, Alerta */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Peso */}
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200">
              <Weight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              {data.weight ? `${Number(data.weight).toFixed(1)} kg` : '--'}
            </span>

            {/* Historial */}
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-800/30 border border-amber-200 dark:border-amber-800/50 text-xs font-medium text-amber-700 dark:text-amber-300 transition-all duration-200"
              title="Ver historial"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Historial</span>
            </button>

            {/* Alerta */}
            {isAlert && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                <span className="text-[10px] font-medium text-red-700 dark:text-red-300">Alerta</span>
              </div>
            )}
          </div>
        </div>

        {/* Fila 2: Guía, Agencia, Estado (como información), Provincia y Municipio */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50 pb-2">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{data.guide?.externalRef || 'Sin guía'}</span>
          </span>
          
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">{data.guide?.agency?.name || 'Sin agencia'}</span>
          </span>

          {/* Estado como información visual */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(currentStatusName)}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
            {currentStatusName}
          </span>

          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">{data.province?.name || '—'}</span>
          </span>

          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">{data.municipe?.name || '—'}</span>
          </span>
        </div>

        {/* Fila 3: Destinatario y Ubicación (como información) */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            {maskName(data.recipient?.fullName)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            {currentLocationName}
          </span>
        </div>

        {/* Fila 4: MiniStatusForm y acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          {/* MiniStatusForm */}
          <div className="flex-1 ">
            <MiniStatusForm
              statusId={statusId}
              locationId={locationId}
              statuses={statuses}
              locations={locations}
              currentStatusName={currentStatusName}
              currentLocationName={currentLocationName}
              onStatusChange={setStatusId}
              onLocationChange={setLocationId}
              onSave={handleSaveChanges}
              isUpdating={isUpdating}
              hasChanges={hasChanges}
              getStatusColor={getStatusColor}
            />
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 shrink-0"></div>

          {/* Botones de acción - CON TEXTO en md+ */}
          <div className="flex-row sm:flex-col items-center gap-3 shrink-0">
            
            
            <button
              type="button"
              onClick={() => onEdit(data.id)}
              className="h-8 px-3 flex items-center md:min-w-22 gap-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-800/30 text-purple-600 dark:text-purple-400 transition-all duration-200 text-xs font-medium"
              title="Editar paquete"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Editar</span>
            </button>
            
            <button
              type="button"
              onClick={() => onDelete(data.id)}
              className="h-8 px-3 flex items-center mt-2 gap-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 transition-all duration-200 text-xs font-medium"
              title="Eliminar paquete"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de historial */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                Historial del paquete
              </h3>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {history.isLoading && (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Cargando historial...</p>
              </div>
            )}
            
            {history.isError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-700 dark:text-red-400 text-sm">
                No se pudo cargar el historial: {(history.error as Error)?.message}
              </div>
            )}
            
            {!history.isLoading && !history.isError && (!history.data || history.data.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">Sin movimientos registrados</p>
              </div>
            )}

            {history.data && history.data.length > 0 && (
              <ol className="relative border-l-2 border-purple-200 dark:border-purple-800 ml-3">
                {history.data.map((h: PackageHistoryItem, index: number) => (
                  <li key={h.id} className="mb-6 ml-6">
                    <span className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 ${
                      index === 0 
                        ? 'bg-purple-500 border-purple-500' 
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}></span>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {h.status?.name || 'Sin estado'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        📍 {h.location?.name || 'Sin ubicación'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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