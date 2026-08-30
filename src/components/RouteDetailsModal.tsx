import { useState } from 'react';
import { Package as PackageIcon, Truck, Users, X, Eye } from 'lucide-react';
import { useRoute } from '../hooks/useRoute';
import { PackageDetailsModal } from './PackageDetailsModal';
import type { PackageItem } from '../types';
import type { Package } from '../api/packages.api';

interface RouteDetailsModalProps {
  isOpen: boolean;
  routeId: string | null;
  onClose: () => void;
}

function parseNotFound(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    /* ignorar y tratar como texto */
  }
  return raw
    .split(/[\r\n,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function RouteDetailsModal({ isOpen, routeId, onClose }: RouteDetailsModalProps) {
  const { data, isLoading, isError } = useRoute(routeId ?? undefined);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  if (!isOpen || !routeId) return null;

  return (
    <>
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
                      <div key={pkg.id} className="flex items-center justify-between gap-2 rounded-xl bg-white dark:bg-gray-950 border border-border p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {pkg.hbls?.[0]?.hblCode || 'HBL no disponible'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {pkg.recipient?.fullName || 'Destinatario no disponible'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPackage(pkg)}
                          title="Ver información del paquete"
                          aria-label={`Ver información del paquete ${pkg.hbls?.[0]?.hblCode ?? pkg.id}`}
                          className="shrink-0 p-2 rounded-lg text-slate-500 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No hay paquetes asociados a esta ruta.</p>
                )}
              </div>

              {parseNotFound(data.notFound).length > 0 && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-rose-800 dark:text-rose-300">
                    <X className="w-4 h-4" />
                    HBLs no encontrados
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {parseNotFound(data.notFound).length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parseNotFound(data.notFound).map((hbl, idx) => (
                      <span
                        key={`${hbl}-${idx}`}
                        className="selectable-text rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 font-mono text-xs text-rose-700 dark:text-rose-400"
                      >
                        {hbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
      <PackageDetailsModal
        isOpen={Boolean(selectedPackage)}
        packageId={selectedPackage?.id ?? ''}
        initialData={(selectedPackage ?? null) as Partial<Package> | null}
        onClose={() => setSelectedPackage(null)}
      />
    </>
  );
}
