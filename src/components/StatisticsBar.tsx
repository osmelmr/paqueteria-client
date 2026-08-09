import { useState } from 'react';
import { Clock, FileText, PackageCheck, Route as RouteIcon, Truck, Warehouse } from 'lucide-react';
import { useStatistics } from '../hooks/useStatistics';
import { RouteDetailsModal } from './RouteDetailsModal';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

export function StatisticsBar() {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const { data, isLoading, isError } = useStatistics();

  const items = [
    { label: 'Almacenados', value: data?.totalAlmacenados, icon: Warehouse, iconClass: 'text-amber-500' },
    { label: 'Entregados', value: data?.totalEntregados, icon: PackageCheck, iconClass: 'text-emerald-500' },
    { label: 'Guías activas', value: data?.totalGuiasActivas, icon: FileText, iconClass: 'text-sky-500' },
    { label: 'En espera', value: data?.totalEnEspera, icon: Clock, iconClass: 'text-purple-500' },
  ];

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-chrome border border-border shadow-sm min-w-0"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
              <item.icon className={`w-4 h-4 ${item.iconClass}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 m-0 truncate">
                {item.label}
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 m-0 leading-tight">
                {isLoading ? '—' : (item.value ?? 0)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && !isError && data && (
        <div className="rounded-xl bg-chrome border border-border shadow-sm p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <RouteIcon className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 m-0">
              Últimas rutas
            </h3>
          </div>
          {data.ultimasRutas.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Sin rutas registradas</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {data.ultimasRutas.map((r) => (
                <li key={r.id} className="py-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRouteId(r.id)}
                    className="w-full text-left rounded-xl px-3 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{r.name}</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">{r.vehicle?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(r.departureDate)}</span>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                          {r._count.packages} paq.
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <RouteDetailsModal
        isOpen={Boolean(selectedRouteId)}
        routeId={selectedRouteId}
        onClose={() => setSelectedRouteId(null)}
      />
    </div>
  );
}
