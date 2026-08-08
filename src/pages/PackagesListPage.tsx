import { Copy, Check, Route as RouteIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePackages, useUpdatePackageStatus, useDeletePackage } from '../hooks/usePackages';
import { useGuides } from '../hooks/useGuides';
import { useProvinces } from '../hooks/useProvinces';
import { useMunicipes } from '../hooks/useMunicipes';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import { useAgencies } from '../hooks/useAgencies';
import { PackageCard } from '../components/PackageCard.tsx';
import { PackageFiltersForm } from '../components/PackageFiltersForm.tsx';
import { PaginationControls } from '../components/PaginationControls.tsx';
import type { PackageFilters } from '../api/packages.api';
import { Plus, X, Package as PackageIcon } from 'lucide-react';

export default function PackagesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hblParam = searchParams.get('hbl') || '';
  const [filters, setFilters] = useState<PackageFilters>(() =>
    hblParam ? { hbl: hblParam } : {},
  );

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const {
    data: pageData,
    isLoading,
    error: queryError,
  } = usePackages(filters, { page: currentPage, limit });
  const packages = pageData?.items ?? [];
  const allHbls = pageData?.hbls ?? [];
  const paginationMeta = pageData?.pagination ?? {
    total: 0,
    page: currentPage,
    limit,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const updateStatus = useUpdatePackageStatus();
  const deletePackage = useDeletePackage();

  const { data: guides = [] } = useGuides();
  const { data: provinces = [] } = useProvinces();
  const { data: municipes = [] } = useMunicipes();
  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();
  const { data: agencies = [] } = useAgencies();

  const [filterForm, setFilterForm] = useState<{ 
    guideId: string; 
    statusId: string; 
    provinceIds: string[]; 
    municipeId: string; 
    hbl: string; 
    search: string; 
    alert: string; 
    statusDate: string; 
    locationId: string; 
    agencyId: string; 
    guideType: string;
  }>({ 
    guideId: '', 
    statusId: '', 
    provinceIds: [], 
    municipeId: '', 
    hbl: hblParam, 
    search: '', 
    alert: '', 
    statusDate: '', 
    locationId: '', 
    agencyId: '', 
    guideType: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [viewMode] = useState<'card' | 'list'>('card');
  const [copiedHbls, setCopiedHbls] = useState(false);

  const handleCopyHbls = async () => {
    if (allHbls.length === 0) return;
    const text = allHbls.join(', ');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedHbls(true);
    setTimeout(() => setCopiedHbls(false), 2000);
  };

  useEffect(() => {
    if (!hblParam) return;
    setFilterForm((prev) => ({ ...prev, hbl: hblParam }));
    setFilters({ hbl: hblParam });
    setCurrentPage(1);
  }, [hblParam]);

  const clearHblSearch = () => {
    setFilterForm((prev) => ({ ...prev, hbl: '' }));
    setFilters({});
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  const error = queryError ? (queryError as Error).message : localError;

  const applyFilters = () => {
    const f: PackageFilters = {};
    if (filterForm.guideId) f.guideId = filterForm.guideId;
    if (filterForm.statusId) f.status = filterForm.statusId;
    if (filterForm.provinceIds.length) f.provinceIds = filterForm.provinceIds;
    if (filterForm.municipeId === '__header__') {
      f.header = true;
    } else if (filterForm.municipeId) {
      f.municipeId = filterForm.municipeId;
    }
    if (filterForm.hbl) f.hbl = filterForm.hbl;
    if (filterForm.search) f.search = filterForm.search;
    if (filterForm.alert) f.alert = true;
    if (filterForm.statusDate) f.statusDate = filterForm.statusDate;
    if (filterForm.locationId) f.locationId = filterForm.locationId;
    if (filterForm.agencyId) f.agencyId = filterForm.agencyId;
    if (filterForm.guideType) f.guideType = filterForm.guideType as 'AEREA' | 'MARITIMA';
    setCurrentPage(1); // Resetear a página 1 al filtrar
    setFilters(f);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (pkgId: string, statusId: string, locationId: string, statusDate?: string) => {
    setLocalError(null);
    try {
      await updateStatus.mutateAsync({ id: pkgId, statusId, locationId: locationId || undefined, statusDate });
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este paquete?')) return;
    setLocalError(null);
    try {
      await deletePackage.mutateAsync(id);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <main className="flex-1 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Paquetes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gestiona y rastrea todos tus paquetes
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(`/routes/new?hbls=${encodeURIComponent(allHbls.join(','))}`)}
              disabled={allHbls.length === 0}
              title={allHbls.length === 0 ? 'No hay HBLs en los paquetes filtrados' : 'Crear ruta con los HBLs de los paquetes filtrados'}
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-border text-gray-900 dark:text-gray-100 font-semibold rounded-xl px-4 py-2.5 text-sm transition-all duration-200 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RouteIcon className="w-4 h-4" />
              {allHbls.length > 0 ? `Crear ruta (${allHbls.length})` : 'Crear ruta'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/packages/new')}
              className="flex items-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all duration-200 shadow-md shadow-purple-500/20 dark:shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/30 dark:hover:shadow-purple-500/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Nuevo paquete
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <X className="w-4 h-4" />
            </div>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center gap-3">
            <div className="inline-block w-5 h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Cargando paquetes...</span>
          </div>
        )}

        {/* HBL Search Banner */}
        {filters.hbl && (
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PackageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Buscando por <span className="font-mono font-bold text-purple-700 dark:text-purple-400">{filters.hbl}</span> —{' '}
                {isLoading ? '...' : `${paginationMeta.total} resultado${paginationMeta.total !== 1 ? 's' : ''}`}
              </span>
            </div>
            <button
              type="button"
              onClick={clearHblSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-400/10 dark:hover:bg-purple-400/20 text-purple-700 dark:text-purple-300 font-semibold text-sm transition-all"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          </div>
        )}

        {/* Filters */}
        <PackageFiltersForm
          filterForm={filterForm}
          setFilterForm={setFilterForm}
          onSubmit={applyFilters}
          guides={guides.map((g) => ({ id: g.id, name: g.name || g.agency?.name || 'Sin nombre' }))}
          statuses={statuses}
          provinces={provinces}
          municipes={municipes}
          locations={locations}
          agencies={agencies}
        />

        {/* Results Counter */}
        <div className="mt-4 mb-3 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {paginationMeta.total} paquete{paginationMeta.total !== 1 ? 's' : ''} encontrado{paginationMeta.total !== 1 ? 's' : ''}
          </span>
          {allHbls.length > 0 && (
            <button
              type="button"
              onClick={handleCopyHbls}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                copiedHbls
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                  : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50'
              }`}
            >
              {copiedHbls ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedHbls ? '¡Copiados!' : `Copiar HBLs (${allHbls.length})`}
            </button>
          )}
        </div>

        {/* Package List */}
        <div className="mt-4">
          {packages.length === 0 && !isLoading ? (
            <div className="text-center py-16 bg-surface dark:bg-gray-800/60 rounded-2xl border border-border">
              <PackageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No se encontraron paquetes</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Prueba ajustando los filtros o crea un nuevo paquete</p>
              <button
                type="button"
                onClick={() => navigate('/packages/new')}
                className="mt-4 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Crear paquete
              </button>
            </div>
          ) : (
            <div className={`grid justify-items-center max-w-6xl gap-4 mx-auto ${viewMode === 'card' ? 'grid-cols-1' : 'grid-cols-1'}`}>
              {packages.map((pkg: any) => (
                <PackageCard
                  key={`${pkg.id}-${pkg.statuses?.[0]?.id || ''}-${pkg.statuses?.[0]?.createdAt || ''}`}
                  data={pkg}
                  onEdit={(id) => navigate(`/packages/${id}/edit`)}
                  onDelete={handleDelete}
                  onUpdateStatus={handleUpdateStatus}
                  statuses={statuses}
                  locations={locations}
                />
              ))}
            </div>
          )}
        </div>

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
  );
}