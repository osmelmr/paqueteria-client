import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  Clock,
  Eye,
  FileText,
  Hash,
  History,
  LogOut,
  MapPin,
  Moon,
  Package as PackageIcon,
  Search,
  Sun,
  Tag,
  User,
  User as UserIcon,
  Weight,
  X,
} from 'lucide-react';
import { usePartnerPackages, usePartnerGuides, usePartnerStats, usePartnerStory } from '../hooks/usePartner';
import { PaginationControls } from '../components/PaginationControls';
import { CustomSelect } from '../components/CustomSelect';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import type { PartnerPackage } from '../api/partner.api';

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

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </span>
      <span className="selectable-text text-sm text-gray-900 dark:text-gray-100 break-words">
        {value ?? '—'}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gray-100 dark:border-gray-800 first:border-t-0 pt-4 mt-4 first:pt-0 first:mt-0">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function DetailsModal({ pkg, onClose }: { pkg: PartnerPackage; onClose: () => void }) {
  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString('es-CU', { year: 'numeric', month: 'short', day: 'numeric' }) : null;

  const formatDateTime = (date?: string | null) =>
    date ? new Date(date).toLocaleString('es-CU', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <PackageIcon className="w-4 h-4 text-gray-500" /> Detalles del Paquete
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {/* Identificacion */}
          <div className="flex items-center gap-2 flex-wrap">
            {(pkg.hbls ?? []).map((h) => (
              <span
                key={h.hblCode}
                className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono font-semibold text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
              >
                {h.hblCode}
              </span>
            ))}
            {(pkg.hbls ?? []).length === 0 && (
              <span className="text-sm text-gray-400 dark:text-gray-500">Sin HBL</span>
            )}
            {pkg.alert === true && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> Alerta
              </span>
            )}
          </div>

          <Section title="Guía">
            <DetailItem icon={Tag} label="Guía" value={pkg.guide?.name} />
            <DetailItem icon={FileText} label="Tipo" value={pkg.guide?.type} />
            <DetailItem icon={Building2} label="Agencia" value={pkg.guide?.agency?.name} />
          </Section>

          <Section title="Destinatario">
            <DetailItem icon={User} label="Nombre" value={pkg.recipient?.fullName} />
            <DetailItem icon={Hash} label="Carnet de identidad" value={pkg.recipient?.idCard} />
            <DetailItem icon={FileText} label="Teléfono" value={pkg.recipient?.phone} />
          </Section>

          <Section title="Ubicación">
            <DetailItem icon={MapPin} label="Provincia" value={pkg.province?.name} />
            <DetailItem icon={MapPin} label="Municipio" value={pkg.municipe?.name} />
            <DetailItem icon={MapPin} label="Dirección" value={pkg.address} />
          </Section>

          <Section title="Estado">
            <DetailItem icon={Tag} label="Estado" value={pkg.status?.name} />
            <DetailItem icon={MapPin} label="Ubicación actual" value={pkg.location?.name} />
            <DetailItem icon={Calendar} label="Fecha de llegada" value={formatDate(pkg.arrivalDate)} />
          </Section>

          <Section title="Detalles del paquete">
            <DetailItem
              icon={Weight}
              label="Peso"
              value={pkg.weight != null ? `${Number(pkg.weight).toFixed(2)} kg` : null}
            />
            <DetailItem icon={PackageIcon} label="Contenido" value={pkg.content} />
            <DetailItem icon={FileText} label="Anotaciones" value={pkg.anotations} />
            {pkg.alert === true && (
              <DetailItem
                icon={AlertCircle}
                label="Descripción de alerta"
                value={pkg.alertDescription}
              />
            )}
          </Section>

          <Section title="Registro">
            <DetailItem icon={Clock} label="Creado" value={formatDateTime(pkg.createdAt)} />
            <DetailItem icon={Clock} label="Actualizado" value={formatDateTime(pkg.updatedAt)} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function PartnerPackageCard({
  pkg,
  onOpenDetails,
}: {
  pkg: PartnerPackage;
  onOpenDetails: (pkg: PartnerPackage) => void;
}) {
  const [showStory, setShowStory] = useState(false);
  const primaryHbl = pkg.hbls?.[0]?.hblCode || 'SIN HBL';
  const extraHblCount = (pkg.hbls?.length ?? 0) > 1 ? pkg.hbls.length - 1 : 0;
  const isAlert = pkg.alert === true;

  return (
    <>
      <li
        className="group w-full not-sm:flex-col gap-4 flex p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-base min-h-20"
      >
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
                <span className="selectable-text truncate text-sm font-medium">{pkg.recipient?.fullName || '—'}</span>
              </div>
            </div>
          </div>

          {/* COL 3: DESTINATARIO */}
          <div className="flex flex-col gap-1 min-w-0 not-lg:hidden">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="selectable-text truncate text-sm font-medium">{pkg.recipient?.fullName || '—'}</span>
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

          <button
            onClick={() => onOpenDetails(pkg)}
            title="Ver detalles"
            className="md:p-2 not-sm:p-2 not-lg:p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4" />
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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [guideId, setGuideId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [selectedPkg, setSelectedPkg] = useState<PartnerPackage | null>(null);

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const { data: guides = [] } = usePartnerGuides();

  // Búsqueda desde el backend con debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: pageData,
    isLoading,
    error,
  } = usePartnerPackages({
    search: search || undefined,
    page: currentPage,
    limit,
    guideId: guideId || undefined,
  });

  const packages = pageData?.items ?? [];

  const { data: stats } = usePartnerStats({
    search: search || undefined,
    guideId: guideId || undefined,
  });
  const paginationMeta = pageData?.pagination ?? {
    total: 0,
    page: currentPage,
    limit,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* Navbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 sm:px-6 bg-chrome border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shrink-0">
            <PackageIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">Paquetería</span>
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider leading-tight">Seguimiento</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-all"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{user?.username || 'Usuario'}</span>
              <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">{user?.role || 'Rol'}</span>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all shadow-sm"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por HBL, carné, teléfono o guía..."
                className="w-full pl-10 pr-9 py-2.5 border-2 border-border rounded-xl bg-surface text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-sm"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  title="Limpiar búsqueda"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <CustomSelect
              value={guideId}
              onChange={(id) => {
                setGuideId(id);
                setCurrentPage(1);
              }}
              options={guides.map((g) => ({ id: g.id, name: g.name }))}
              placeholder="Todas las guías"
              icon={FileText}
              allowClear
              className="w-full sm:w-60"
            />
          </div>
        </div>

        {/* Informe del filtrado */}
        {stats && stats.total > 0 && (
          <div className="mb-4 p-4 bg-surface dark:bg-gray-800/60 border border-border rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Informe del filtrado
              </h2>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                Total: <span className="font-bold text-gray-900 dark:text-gray-100">{stats.total}</span> paquete{stats.total !== 1 ? 's' : ''}
              </span>
            </div>

            {stats.byStatus.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {stats.byStatus.map((s) => (
                  <span
                    key={s.statusId}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getStatusStyle(s.name)}`}
                  >
                    <Tag className="w-3 h-3" />
                    {s.name}: {s.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

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

        {/* Package List */}
        {!isLoading && (
          <div className="mt-4">
            {packages.length === 0 ? (
              <div className="text-center py-16 bg-surface dark:bg-gray-800/60 rounded-2xl border border-border">
                <PackageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No se encontraron paquetes</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {search ? 'Prueba con otro término de búsqueda' : 'Aún no hay paquetes registrados para tu agencia'}
                </p>
              </div>
            ) : (
              <ul className="max-w-6xl mx-auto rounded-2xl overflow-hidden border border-border divide-y divide-border">
                {packages.map((pkg) => (
                  <PartnerPackageCard key={pkg.id} pkg={pkg} onOpenDetails={setSelectedPkg} />
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        <PaginationControls
          currentPage={paginationMeta.page}
          totalPages={paginationMeta.totalPages}
          totalItems={paginationMeta.total}
          itemsPerPage={paginationMeta.limit}
          hasNextPage={paginationMeta.hasNextPage}
          hasPreviousPage={paginationMeta.hasPreviousPage}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          loading={isLoading}
        />
      </div>
      </main>

      {/* Modal Detalles */}
      {selectedPkg && (
        <DetailsModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />
      )}
    </div>
  );
}
