import React, { useState } from 'react';
import { 
  AlertCircle, 
  User, 
  MapPin, 
  Package, 
  Weight, 
  Edit2, 
  Download, 
  FileText, 
  Building2,
  History,
  Eye
} from 'lucide-react';
import { usePackageHistory } from '../hooks/usePackages';
import { useDownloadPackagePdf } from '../hooks/useDownloadPackagePdf';
import { PackageStatusControls } from './PackageStatusControls';
import { PackageHistoryModal } from './PackageHistoryModal';
import { toLocalDateInput, dateInputToIso, todayDateInput } from '../utils/date';
import type { PackageHistoryItem } from '../api/packages.api';

export interface PackageData {
  id: string;
  guide?: { name: string; agency: { name: string } };
  recipient?: { fullName: string | null };
  province?: { name: string };
  municipe?: { name: string };
  weight?: number | string | null;
  status: { name: string; id?: string };
  location?: { name: string; id?: string };
  alert?: boolean | null;
  alertDescription?: string;
  hbls: { hblCode: string }[];
  statuses?: PackageHistoryItem[];
}

interface SelectOption {
  id: string;
  name: string;
}

interface PackageListRowProps {
  data: PackageData;
  onEdit: (id: string) => void;
  onView?: (id: string) => void;
  onUpdateStatus?: (id: string, statusId: string, locationId: string, statusDate?: string) => void;
  statuses?: SelectOption[];
  locations?: SelectOption[];
}

const maskName = (fullName?: string | null) => {
  if (!fullName) return '—';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].length > 3 ? `${parts[0].slice(0, 3)}***` : parts[0];
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.slice(0, 3)}***${last.slice(-3)}`;
};

export const PackageCard: React.FC<PackageListRowProps> = ({ 
  data, 
  onEdit, 
  onView,
  onUpdateStatus, 
  statuses = [], 
  locations = [] 
}) => {
  const primaryHbl = data.hbls[0]?.hblCode || 'SIN HBL';
  const extraHblCount = data.hbls.length > 1 ? data.hbls.length - 1 : 0;
  const isAlert = data.alert === true;

  const lastChange = data.statuses?.length
    ? [...data.statuses].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0]
    : undefined;
  const baselineStatusId = data.status.id || '';
  const baselineLocationId = data.location?.id || '';
  const minStatusDate = toLocalDateInput(lastChange?.createdAt);

  const [statusId, setStatusId] = useState(baselineStatusId);
  const [locationId, setLocationId] = useState(baselineLocationId);
  const [statusDate, setStatusDate] = useState(todayDateInput());
  const [isUpdating, setIsUpdating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [statusDateTouched, setStatusDateTouched] = useState(false);

  const history = usePackageHistory(data.id, showHistory);
  const { downloadPdf, loading } = useDownloadPackagePdf();

  const currentStatusName = statuses.find(s => s.id === statusId)?.name || lastChange?.status?.name || data.status.name;
  const currentLocationName = locations.find(l => l.id === locationId)?.name || lastChange?.location?.name || data.location?.name || 'Ubicación pendiente';

  const hasChanges = statusId !== baselineStatusId || locationId !== baselineLocationId;

  const handleSaveChanges = async () => {
    if (!onUpdateStatus || !hasChanges) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(data.id, statusId, locationId, dateInputToIso(statusDate));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('entregado')) return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 ring-emerald-600/20';
    if (s.includes('tránsito')) return 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 ring-blue-600/20';
    if (s.includes('bodega')) return 'text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 ring-purple-600/20';
    return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 ring-amber-600/20';
  };

  return (
    <li className="group w-full not-sm:flex-col gap-4 flex p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-base min-h-20">
      <div className="mb-4 flex gap-4 flex-1 not-sm:w-full not-sm:justify-center">
      {/* COL 1: IDENTIFICADOR + PESO + HBLs */}
      <div className="flex flex-col gap-1 min-w-0">
        {/*icono de paquete o alerta hbl y simbolo de 1 o mas hbls */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md shrink-0 ${isAlert ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
            {isAlert ? <AlertCircle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
          </div>
          <span className="selectable-text font-mono font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
            {primaryHbl}
          </span>
          {extraHblCount > 0 && (
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              +{extraHblCount}
            </span>
          )}
        </div>
        <div className="md:flex-row items-center gap-3 text-xs text-gray-500 pl-7 flex flex-col">
          <span className="flex items-center gap-1">
            <Weight className="w-3 h-3" /> {data.weight ? `${Number(data.weight).toFixed(1)} kg` : 'Sin peso'}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" /> {data.guide?.name || 'Sin guía'}
          </span>
        </div>
      </div>

      {/* COL 2: ORIGEN + AGENCIA + UBICACIÓN */}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="selectable-text truncate text-sm font-medium">{data.guide?.agency?.name || 'Sin agencia'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="w-3 h-3 shrink-0" />
          <div className="truncate not-lg:flex-col flex">
          <span className="">{data.province?.name || '—'}</span>
          <span className="">{data.municipe?.name || '—'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 min-w-0 not-lg:block hidden">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="selectable-text truncate text-sm font-medium">{maskName(data.recipient?.fullName)}</span>
        </div>
        <div className="text-xs text-gray-400 pl-6">
          {/* Espacio para más información si es necesario */}
        </div>
      </div>
      </div>

      {/* COL 3: DESTINATARIO */}
      <div className="flex flex-col gap-1 min-w-0 not-lg:hidden">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="selectable-text truncate text-sm font-medium">{maskName(data.recipient?.fullName)}</span>
        </div>
        <div className="text-xs text-gray-400 pl-6">
          {/* Espacio para más información si es necesario */}
        </div>
      </div>
       </div>
       
        
      {/* COL 4: SELECTS + BOTÓN GUARDAR + ACCIONES */}
      <div className="flex flex-col items-stretch gap-3 not-lg:gap-1 md:justify-end md:max-w-2/5 w-full sm:flex-row sm:items-center justify-center sm:justify-around">
        <div className='not-sm:w-full justify-center not-sm:flex'>
        <PackageStatusControls
          statusId={statusId}
          locationId={locationId}
          statusDate={statusDate}
          minStatusDate={minStatusDate}
          currentStatusName={currentStatusName}
          currentLocationName={currentLocationName}
          hasChanges={hasChanges}
          isUpdating={isUpdating}
          statuses={statuses}
          locations={locations}
          onStatusChange={(id) => {
            if (!statusDateTouched && id !== baselineStatusId) {
              setStatusDate(todayDateInput());
            }
            setStatusId(id);
          }}
          onLocationChange={setLocationId}
          onStatusDateChange={(d) => {
            setStatusDateTouched(true);
            setStatusDate(d);
          }}
          onSave={handleSaveChanges}
          getStatusStyle={getStatusStyle}
        />
        </div>
        {/* Separador */}
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 flex-shrink-0 hidden sm:block"></div>

        {/* Botones de acción */}
        <div className='not-sm:w-full justify-center not-sm:flex '>
        <div className="not-sm:pr-8 flex items-center md:gap-1 max-w-50 sm:shrink-0 justify-start not-sm:min-w-40 not-sm:justify-between">
          <button onClick={() => setShowHistory(true)} title="Ver historial" className="md:p-2 not-sm:p-2 not-lg:p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <History className="w-4 h-4" />
          </button>
          
          {onView && (
            <button onClick={() => onView(data.id)} title="Ver detalles" className="md:p-2 not-sm:p-2 not-lg:p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          )}

          <button onClick={() => onEdit(data.id)} title="Editar paquete" className="md:p-2 not-sm:p-2 not-lg:p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>

          <button onClick={() => downloadPdf(data.id)} title="Descargar PDF" className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-md transition-colors" disabled={loading}>
            <Download className="w-4 h-4" />
          </button>
        </div>
        </div>
      </div>

      {/* Modal Historial */}
      <PackageHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
      />
    </li>
  );
};