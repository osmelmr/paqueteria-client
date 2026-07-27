import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePackages, useUpdatePackageStatus, useDeletePackage } from '../hooks/usePackages';
import { useGuides } from '../hooks/useGuides';
import { useProvinces } from '../hooks/useProvinces';
import { useMunicipes } from '../hooks/useMunicipes';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import { useAgencies } from '../hooks/useAgencies';
import { PackageCard } from '../components/PackageCard.tsx';
import { PackageFiltersForm } from '../components/PackageFiltersForm.tsx';
import type { PackageFilters } from '../api/packages.api';
import { Plus, Package as PackageIcon } from 'lucide-react';

export default function PackagesListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PackageFilters>({});
  const { data: packages = [], isLoading, error: queryError } = usePackages(filters);
  const updateStatus = useUpdatePackageStatus();
  const deletePackage = useDeletePackage();

  const { data: guides = [] } = useGuides();
  const { data: provinces = [] } = useProvinces();
  const { data: municipes = [] } = useMunicipes();
  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();
  const { data: agencies = [] } = useAgencies();

  const [filterForm, setFilterForm] = useState({ guideId: '', statusId: '', provinceId: '', municipeId: '', hbl: '', search: '', alert: '', statusDate: '', locationId: '', agencyId: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const error = queryError ? (queryError as Error).message : localError;

  const applyFilters = () => {
    const f: PackageFilters = {};
    if (filterForm.guideId) f.guideId = filterForm.guideId;
    if (filterForm.statusId) f.status = filterForm.statusId;
    if (filterForm.provinceId) f.provinceId = filterForm.provinceId;
    if (filterForm.municipeId) f.municipeId = filterForm.municipeId;
    if (filterForm.hbl) f.hbl = filterForm.hbl;
    if (filterForm.search) f.search = filterForm.search;
    if (filterForm.alert) f.alert = true;
    if (filterForm.statusDate) f.statusDate = filterForm.statusDate;
    if (filterForm.locationId) f.locationId = filterForm.locationId;
    if (filterForm.agencyId) f.agencyId = filterForm.agencyId;
    setFilters(f);
  };

  const handleUpdateStatus = async (pkgId: string, statusId: string, locationId: string) => {
    setLocalError(null);
    try {
      await updateStatus.mutateAsync({ id: pkgId, statusId, locationId: locationId || undefined });
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este paquete?')) return;
    setLocalError(null);
    try {
      await deletePackage.mutateAsync(id);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <main className="flex-1 max-w-full overflow-x-auto dark:bg-slate-950 min-h-screen">
      <div className="w-full">
        <div className="p-5 border border-neutral-200 dark:border-slate-800 rounded-2xl bg-[#dbdbdb] dark:bg-slate-900 shadow-sm w-full">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <PackageIcon className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 m-0">
                Paquetes
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {packages.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/packages/new')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-xl px-3.5 py-2 text-xs transition-colors shadow-sm cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" />
              Nuevo paquete
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}
          {isLoading && (
            <div className="mb-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-medium">
              Cargando paquetes...
            </div>
          )}

          <PackageFiltersForm
            filterForm={filterForm}
            setFilterForm={setFilterForm}
            onSubmit={applyFilters}
            guides={guides}
            statuses={statuses}
            provinces={provinces}
            municipes={municipes}
            locations={locations}
            agencies={agencies}
          />

          <div className="mt-4">
            {packages.length === 0 && !isLoading ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                No se encontraron paquetes
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {packages.map((pkg: any) => (
                  <PackageCard
                    key={pkg.id}
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
        </div>
      </div>
    </main>
  );
}
