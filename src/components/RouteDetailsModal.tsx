import { Package as PackageIcon, Truck, Users, X } from 'lucide-react';
import { useRoute } from '../hooks/useRoute';

interface RouteDetailsModalProps {
  isOpen: boolean;
  routeId: string | null;
  onClose: () => void;
}

export function RouteDetailsModal({ isOpen, routeId, onClose }: RouteDetailsModalProps) {
  const { data, isLoading, isError } = useRoute(routeId ?? undefined);

  if (!isOpen || !routeId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Detalle de ruta</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Información rápida sobre la ruta seleccionada</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {isLoading && (
            <div className="text-sm text-slate-500 dark:text-slate-400">Cargando detalles de la ruta...</div>
          )}

          {isError && (
            <div className="text-sm text-red-600 dark:text-red-400">No se pudo cargar la ruta. Intenta nuevamente.</div>
          )}

          {!isLoading && !isError && data && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{data.description || 'Sin descripción'}</p>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-purple-500" />
                    <span>{data.vehicle?.name || 'Vehículo no asignado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{data.drivers?.length ? data.drivers.map((driver) => driver.driver.name).join(', ') : 'Sin choferes'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Salida:</span>
                    <span>{data.departureDate ? new Date(data.departureDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No definida'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Paquetes:</span>
                    <span>{data.packages?.length ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                  <PackageIcon className="w-4 h-4 text-slate-500" />
                  Paquetes en la ruta
                </div>
                {data.packages?.length ? (
                  <div className="max-h-64 overflow-y-auto pr-1 space-y-3">
                    {data.packages.map((pkg) => (
                      <div key={pkg.id} className="rounded-xl bg-white dark:bg-gray-950 border border-border p-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {pkg.hbls?.[0]?.hblCode || 'HBL no disponible'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {pkg.recipient?.fullName || 'Destinatario no disponible'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No hay paquetes asociados a esta ruta.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
