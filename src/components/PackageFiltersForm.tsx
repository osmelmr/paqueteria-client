import type { Guide } from '../api/guides.api';
import { 
  Filter, 
  Search, 
  FileText, 
  Activity, 
  MapPin, 
  Compass, 
  Building2, 
  Plane, 
  AlertTriangle,
  Calendar,
  Hash,
  Search as SearchIcon,
  RotateCcw
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface FilterFormState {
  guideId: string;
  statusId: string;
  provinceId: string;
  municipeId: string;
  hbl: string;
  search: string;
  alert: string;
  statusDate: string;
  locationId: string;
  agencyId: string;
  guideType: string;
}

interface Props {
  filterForm: FilterFormState;
  setFilterForm: React.Dispatch<React.SetStateAction<FilterFormState>>;
  onSubmit: () => void;
  guides?: { id: string; name: string }[];
  statuses?: { id: string; name: string }[];
  provinces?: { id: string; name: string }[];
  municipes?: { id: string; name: string }[];
  locations?: { id: string; name: string }[];
  agencies?: { id: string; name: string }[];
}

export function PackageFiltersForm({ 
  filterForm, 
  setFilterForm, 
  onSubmit, 
  guides = [], 
  statuses = [], 
  provinces = [],
  municipes = [],
  locations = [],
  agencies = [],
}: Props) {
  const hasActiveFilters = Object.values(filterForm).some(v => v !== '');
  const shouldSubmitOnClear = useRef(false);

  const clearFilters = () => {
    // Marcar que debemos enviar la limpieza
    shouldSubmitOnClear.current = true;
    // Reiniciar todos los campos del formulario
    setFilterForm({
      guideId: '',
      statusId: '',
      provinceId: '',
      municipeId: '',
      hbl: '',
      search: '',
      alert: '',
      statusDate: '',
      locationId: '',
      agencyId: '',
      guideType: '',
    });
  };

  // Efecto para aplicar la limpieza cuando el formulario se ha actualizado
  useEffect(() => {
    if (shouldSubmitOnClear.current) {
      const allEmpty = Object.values(filterForm).every(v => v === '');
      if (allEmpty) {
        shouldSubmitOnClear.current = false;
        onSubmit();
      }
    }
  }, [filterForm, onSubmit]);

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <form 
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }} 
        className="space-y-4"
      >
        {/* Header con título */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Filter className="w-4 h-4 text-purple-500" />
            Filtros
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                Activos
              </span>
            )}
          </div>
        </div>

        {/* Grid de filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {/* Guía */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <select 
              className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70 appearance-none" 
              value={filterForm.guideId} 
              onChange={(e) => setFilterForm((prev) => ({ ...prev, guideId: e.target.value }))}
            >
              <option value="">Guía</option>
              {guides?.map((g) => <option key={g.id} value={g.id}>{g.name || 'Sin nombre'}</option>)}
            </select>
          </div>

          {/* Estado */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Activity className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <select 
              className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70 appearance-none" 
              value={filterForm.statusId} 
              onChange={(e) => setFilterForm((prev) => ({ ...prev, statusId: e.target.value }))}
            >
              <option value="">Estado</option>
              {statuses?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Fecha de estado */}
          {filterForm.statusId && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input 
                type="date"
                className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70" 
                value={filterForm.statusDate} 
                onChange={(e) => setFilterForm((prev) => ({ ...prev, statusDate: e.target.value }))} 
              />
            </div>
          )}

          {/* Ubicación */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <select 
              className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70 appearance-none" 
              value={filterForm.locationId} 
              onChange={(e) => setFilterForm((prev) => ({ ...prev, locationId: e.target.value }))}
            >
              <option value="">Ubicación</option>
              {locations?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          {/* Provincia */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Compass className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <select 
              className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70 appearance-none" 
              value={filterForm.provinceId} 
              onChange={(e) => setFilterForm((prev) => ({ ...prev, provinceId: e.target.value }))}
            >
              <option value="">Provincia</option>
              {provinces?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Municipio */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <select 
              className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70 appearance-none" 
              value={filterForm.municipeId} 
              onChange={(e) => setFilterForm((prev) => ({ ...prev, municipeId: e.target.value }))}
            >
              <option value="">Municipio</option>
              {municipes?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          {/* Agencia */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <select 
              className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70 appearance-none" 
              value={filterForm.agencyId} 
              onChange={(e) => setFilterForm((prev) => ({ ...prev, agencyId: e.target.value }))}
            >
              <option value="">Agencia</option>
              {agencies?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Tipo de guía */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Plane className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <select 
              className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70 appearance-none" 
              value={filterForm.guideType} 
              onChange={(e) => setFilterForm((prev) => ({ ...prev, guideType: e.target.value }))}
            >
              <option value="">Tipo guía</option>
              <option value="AEREA">Aérea</option>
              <option value="MARITIMA">Marítima</option>
            </select>
          </div>

          {/* HBL Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input 
              className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70" 
              value={filterForm.hbl} 
              onChange={(e) => setFilterForm((prev) => ({ ...prev, hbl: e.target.value }))} 
              placeholder="HBL..." 
            />
          </div>

          {/* Búsqueda general */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input 
              className="w-full h-10 pl-9 pr-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all hover:bg-white dark:hover:bg-gray-700/70" 
              value={filterForm.search} 
              onChange={(e) => setFilterForm((prev) => ({ ...prev, search: e.target.value }))} 
              placeholder="Buscar..." 
            />
          </div>

          {/* Alerta Checkbox personalizado */}
          <label className="flex items-center gap-2 h-10 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-all cursor-pointer group">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <div className="relative flex items-center">
              <input 
                type="checkbox"
                className="sr-only peer"
                checked={filterForm.alert === 'true'}
                onChange={(e) => setFilterForm((prev) => ({ ...prev, alert: e.target.checked ? 'true' : '' }))}
              />
              <div className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-purple-600 peer-checked:border-purple-600 dark:peer-checked:bg-purple-500 dark:peer-checked:border-purple-500 transition-all duration-200 flex items-center justify-center">
                <svg 
                  className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alerta</span>
          </label>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          {/* Limpiar filtros - solo visible si hay filtros activos */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
          
          <button 
            type="submit" 
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-purple-500/20 dark:shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/30 dark:hover:shadow-purple-500/20 w-full sm:w-auto justify-center"
          >
            <Search className="w-4 h-4" />
            Aplicar filtros
          </button>
        </div>
      </form>
    </div>
  );
}