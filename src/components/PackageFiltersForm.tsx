import type { Guide } from '../api/guides.api';

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
}

interface Props {
  filterForm: FilterFormState;
  setFilterForm: React.Dispatch<React.SetStateAction<FilterFormState>>;
  onSubmit: () => void;
  guides?: Guide[];
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
  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }} 
      className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm w-full"
    >
      {/* Guía */}
      <select 
        className="flex-1 min-w-[130px] h-9 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 text-xs bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
        value={filterForm.guideId} 
        onChange={(e) => setFilterForm((prev) => ({ ...prev, guideId: e.target.value }))}
      >
        <option value="">Todas las guías</option>
        {guides?.map((g) => <option key={g.id} value={g.id}>{g.externalRef || g.agency?.name}</option>)}
      </select>

      {/* Estado */}
      <select 
        className="flex-1 min-w-[120px] h-9 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 text-xs bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
        value={filterForm.statusId} 
        onChange={(e) => setFilterForm((prev) => ({ ...prev, statusId: e.target.value }))}
      >
        <option value="">Todos los estados</option>
        {statuses?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {filterForm.statusId && (
        <input 
          type="date"
          className="min-w-[140px] h-9 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 text-xs bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
          value={filterForm.statusDate} 
          onChange={(e) => setFilterForm((prev) => ({ ...prev, statusDate: e.target.value }))} 
          title="Fecha del estado"
        />
      )}

      {/* Localización */}
      <select 
        className="flex-1 min-w-[120px] h-9 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 text-xs bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
        value={filterForm.locationId} 
        onChange={(e) => setFilterForm((prev) => ({ ...prev, locationId: e.target.value }))}
      >
        <option value="">Todas las localizaciones</option>
        {locations?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>

      {/* Provincia */}
      <select 
        className="flex-1 min-w-[120px] h-9 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 text-xs bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
        value={filterForm.provinceId} 
        onChange={(e) => setFilterForm((prev) => ({ ...prev, provinceId: e.target.value }))}
      >
        <option value="">Todas las provincias</option>
        {provinces?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {/* Municipio */}
      <select 
        className="flex-1 min-w-[120px] h-9 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 text-xs bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
        value={filterForm.municipeId} 
        onChange={(e) => setFilterForm((prev) => ({ ...prev, municipeId: e.target.value }))}
      >
        <option value="">Todos los municipios</option>
        {municipes?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>

      {/* Agencia */}
      <select 
        className="flex-1 min-w-[130px] h-9 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 text-xs bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
        value={filterForm.agencyId} 
        onChange={(e) => setFilterForm((prev) => ({ ...prev, agencyId: e.target.value }))}
      >
        <option value="">Todas las agencias</option>
        {agencies?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      {/* HBL Input */}
      <input 
        className="flex-1 min-w-[110px] h-9 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 text-xs bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
        value={filterForm.hbl} 
        onChange={(e) => setFilterForm((prev) => ({ ...prev, hbl: e.target.value }))} 
        placeholder="HBL..." 
      />

      {/* Búsqueda general */}
      <input 
        className="flex-1 min-w-[130px] h-9 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 text-xs bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" 
        value={filterForm.search} 
        onChange={(e) => setFilterForm((prev) => ({ ...prev, search: e.target.value }))} 
        placeholder="Dirección, contenido..." 
      />

      {/* Solo con alerta */}
      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer shrink-0 h-9 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <input 
          type="checkbox"
          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
          checked={filterForm.alert === 'true'}
          onChange={(e) => setFilterForm((prev) => ({ ...prev, alert: e.target.checked ? 'true' : '' }))}
        />
        <span>Alerta</span>
      </label>

      {/* Botón de filtrar */}
      <button 
        type="submit" 
        className="h-9 px-4 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-medium rounded-lg text-xs transition-colors shadow-sm cursor-pointer shrink-0"
      >
        Filtrar
      </button>
    </form>
  );
}