import { useState } from 'react';
import {
  AlertCircle,
  Building2,
  FileText,
  History,
  MapPin,
  Package as PackageIcon,
  Search,
  User,
  Weight,
  X,
} from 'lucide-react';
import { usePartnerPackages, usePartnerStory } from '../hooks/usePartner';
import type { PartnerPackage } from '../api/partner.api';

const maskName = (fullName?: string | null) => {
  if (!fullName) return '—';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].length > 3 ? `${parts[0].slice(0, 3)}***` : parts[0];
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.slice(0, 3)}***${last.slice(-3)}`;
};

const getStatusStyle = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('entregado')) return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 ring-emerald-600/20';
  if (s.includes('tránsito') || s.includes('transito')) return 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 ring-blue-600/20';
  if (s.includes('bodega')) return 'text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 ring-purple-600/20';
  return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 ring-amber-600/20';
};

function StoryModal({
  packageId,
  hbl,
  onClose,
}: {
  packageId: string;
  hbl: string;
  onClose: () => void;
}) {
  const { data: story, isLoading } = usePartnerStory(packageId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md max-h-[85vh] flex flex-col rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" />
            Historial — <span className="font-mono">{hbl}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {isLoading && <div className="text-center py-6 text-sm text-gray-500">Cargando...</div>}
          {story && (
            <div className="border-l border-gray-200 dark:border-gray-700 ml-2 space-y-4">
              {story.map((h, i) => (
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
}

function PartnerPackageCard({ pkg }: { pkg: PartnerPackage }) {
  const [showStory, setShowStory] = useState(false);
  const primaryHbl = pkg.hbls?.[0]?.hblCode || 'SIN HBL';
  const extraHblCount = (pkg.hbls?.length ?? 0) > 1 ? pkg.hbls.length - 1 : 0;
  const isAlert = pkg.alert === true;

  return (
    <>
      <li className="group w-full not-sm:flex-col gap-4 flex p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-base min-h-20">
        <div className="mb-4 flex gap-4 flex-1 not-sm:w-full not-sm:justify-center">
          {/* COL 1: IDENTIFICADOR + PESO + HBLs */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md shrink-0 ${isAlert ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                {isAlert ? <AlertCircle className="w-4 h-4" /> : <PackageIcon className="w-4 h-4" />}
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
                <Weight className="w-3 h-3" /> {pkg.weight ? `${Number(pkg.weight).toFixed(1)} kg` : 'Sin peso'}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> {pkg.guide?.name || 'Sin guía'}
              </span>
            </div>
          </div>

          {/* COL 2: ORIGEN + AGENCIA + DESTINATARIO */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="selectable-text truncate text-sm font-medium">{pkg.guide?.agency?.name || 'Sin agencia'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3 shrink-0" />
              <div className="truncate not-lg:flex-col flex gap-1">
                <span>{pkg.province?.name || '—'}</span>
                <span>{pkg.municipe?.name || '—'}</span>
              </div>
            </div>
            <div className="not-lg:block hidden">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="selectable-text truncate text-sm font-medium">{maskName(pkg.recipient?.fullName)}</span>
              </div>
            </div>
          </div>

          {/* COL 3: DESTINATARIO */}
          <div className="flex flex-col gap-1 min-w-0 not-lg:hidden">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="selectable-text truncate text-sm font-medium">{maskName(pkg.recipient?.fullName)}</span>
            </div>
          </div>
        </div>

        {/* COL 4: ESTADO + UBICACIÓN + ACCIONES */}
        <div className="flex flex-col items-stretch gap-3 not-lg:gap-1 md:justify-end md:max-w-2/5 w-full sm:flex-row sm:items-center justify-center sm:justify-around">
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getStatusStyle(pkg.status?.name ?? '')}`}>
              {pkg.status?.name || 'Sin estado'}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {pkg.location?.name || 'Ubicación pendiente'}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 flex-shrink-0 hidden sm:block"></div>

          <button
            onClick={() => setShowStory(true)}
            title="Ver historial"
            className="md:p-2 not-sm:p-2 not-lg:p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </li>

      {showStory && (
        <StoryModal packageId={pkg.id} hbl={primaryHbl} onClose={() => setShowStory(false)} />
      )}
    </>
  );
}

export default function SeguimientoPage() {
  const { data: packages = [], isLoading, error } = usePartnerPackages();
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const filtered = q
    ? packages.filter((pkg) => {
        const haystack = [
          ...pkg.hbls.map((h) => h.hblCode),
          pkg.guide?.name ?? '',
          pkg.guide?.agency?.name ?? '',
          pkg.province?.name ?? '',
          pkg.municipe?.name ?? '',
          pkg.status?.name ?? '',
          pkg.location?.name ?? '',
          pkg.content ?? '',
          pkg.address ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
    : packages;

  return (
    <main className="flex-1 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Seguimiento
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Consulta el estado de tus paquetes en tránsito
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por HBL, destinatario, guía..."
              className="w-full pl-10 pr-9 py-2.5 border-2 border-border rounded-xl bg-surface text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                title="Limpiar búsqueda"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <X className="w-4 h-4" />
            </div>
            <span className="flex-1">{(error as Error).message}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center gap-3">
            <div className="inline-block w-5 h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Cargando paquetes...</span>
          </div>
        )}

        {/* Results Counter */}
        <div className="mt-4 mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} paquete{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Package List */}
        {!isLoading && (
          <div className="mt-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-surface dark:bg-gray-800/60 rounded-2xl border border-border">
                <PackageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No se encontraron paquetes</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {search ? 'Prueba con otro término de búsqueda' : 'Aún no hay paquetes registrados para tu agencia'}
                </p>
              </div>
            ) : (
              <ul className="max-w-6xl mx-auto rounded-2xl overflow-hidden border border-border divide-y divide-border">
                {filtered.map((pkg) => (
                  <PartnerPackageCard key={pkg.id} pkg={pkg} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
