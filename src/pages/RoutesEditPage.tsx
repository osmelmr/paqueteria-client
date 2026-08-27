import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useRoutes, useUpdateRoute, useConvertRouteHbls } from '../hooks/useRoutes';
import { useVehicles } from '../hooks/useVehicles';
import { useDrivers } from '../hooks/useDrivers';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import { useUpdateStatusBulk } from '../hooks/useBusiness';
import { CustomSelect } from '../components/CustomSelect';
import { DatePicker } from '../components/DatePicker';
import { dateInputToIso, todayDateInput } from '../utils/date';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

type BulkResult = {
  success: Array<{ hbl: string; package: { statusId?: string; locationId?: string | null } | null }>;
  failed: string[];
};

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

export default function RoutesEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: routes = [], isLoading } = useRoutes();
  const updateRoute = useUpdateRoute();
  const convertHbls = useConvertRouteHbls();
  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();
  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();
  const updateStatusBulk = useUpdateStatusBulk();

  const route = routes.find((r) => r.id === id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    departureDate: '',
    vehicleId: '',
    hbls: '',
  });
  const [notFoundHbls, setNotFoundHbls] = useState<string[]>([]);
  const [backendNotFoundHbls, setBackendNotFoundHbls] = useState<string[]>([]);
  const [newNotFoundHbl, setNewNotFoundHbl] = useState('');
  const [driverIds, setDriverIds] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const [bulkStatusId, setBulkStatusId] = useState('');
  const [bulkLocationId, setBulkLocationId] = useState('');
  const [bulkDate, setBulkDate] = useState('');
  const [bulkHbls, setBulkHbls] = useState('');
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  useEffect(() => {
    if (!route) return;
    const d = route.departureDate ? new Date(route.departureDate) : null;
    const local = d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : '';
    const parsedNotFound = parseNotFound(route.notFound);
    setForm({
      name: route.name,
      description: route.description ?? '',
      departureDate: local,
      vehicleId: route.vehicleId,
      hbls: route.packages?.flatMap((p) => p.hbls?.map((h) => h.hblCode) ?? []).join(', ') ?? '',
    });
    setNotFoundHbls(parsedNotFound);
    setBackendNotFoundHbls(parsedNotFound);
    setBulkHbls(
      route.packages?.flatMap((p) => p.hbls?.map((h) => h.hblCode) ?? []).join(', ') ?? '',
    );
    const routeDrivers = route.drivers?.map((r) => r.driverId) ?? [];
    if (routeDrivers.length > 0) {
      setDriverIds(routeDrivers);
    } else {
      setDriverIds(route.vehicle?.drivers?.map((dv) => dv.driverId) ?? []);
    }
  }, [route?.id, routes]);

  const handleVehicleChange = (vehicleId: string) => {
    setForm((prev) => ({ ...prev, vehicleId }));
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    setDriverIds(vehicle?.drivers?.map((d) => d.driverId) ?? []);
  };

  const toggleDriver = (driverId: string) => {
    setDriverIds((prev) =>
      prev.includes(driverId)
        ? prev.filter((d) => d !== driverId)
        : [...prev, driverId],
    );
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto w-full min-w-0"><div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]"><div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div></div></div>;
  }

  if (!route) {
    return <div className="max-w-7xl mx-auto w-full min-w-0"><div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">Ruta no encontrada</div></div>;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      await updateRoute.mutateAsync({
        id: id!,
        dto: {
          name: form.name,
          description: form.description || undefined,
          departureDate: form.departureDate ? new Date(form.departureDate).toISOString() : undefined,
          vehicleId: form.vehicleId || undefined,
          hbls: form.hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
          notFound: notFoundHbls,
          driverIds,
        },
      });
      await qc.refetchQueries({ queryKey: ['routes'] });
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Editar ruta</h2>
        {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Fecha de salida
            <DatePicker
              value={form.departureDate}
              onChange={(v) => setForm((prev) => ({ ...prev, departureDate: v }))}
              placeholder="Seleccionar fecha"
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Vehiculo
            <CustomSelect value={form.vehicleId} onChange={handleVehicleChange} options={vehicles} placeholder="Seleccionar" />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Choferes
            <CustomSelect value="" onChange={(id) => toggleDriver(id)} options={drivers.filter((d) => !driverIds.includes(d.id)).map((d) => ({ id: d.id, name: d.name }))} placeholder="Agregar chofer..." />
          </label>
          {driverIds.length > 0 && (
            <div className="col-span-full flex flex-wrap gap-2">
              {drivers.filter((d) => driverIds.includes(d.id)).map((d) => (
                <span key={d.id} className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100">
                  {d.name}
                  <button type="button" className="bg-transparent border-none cursor-pointer text-gray-500 dark:text-gray-400 hover:text-red-500 font-bold" onClick={() => toggleDriver(d.id)}>x</button>
                </span>
              ))}
            </div>
          )}
          <label className="col-span-full flex flex-col gap-1.5 font-medium">
            Descripcion
            <textarea className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
          </label>
          <label className="col-span-full flex flex-col gap-1.5 font-medium">
            HBLs (separados por coma, punto y coma o saltos de linea)
            <textarea className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.hbls} onChange={(e) => setForm((prev) => ({ ...prev, hbls: e.target.value }))} rows={3} />
          </label>
          <div className="col-span-full flex flex-col gap-1.5">
            <span className="flex items-center gap-2 font-medium">
              Paquetes faltantes
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                ({notFoundHbls.length} HBLs sin paquete asociado)
              </span>
            </span>
            <div className="flex flex-col gap-2">
              {notFoundHbls.map((hbl, idx) => (
                <span
                  key={`${hbl}-${idx}`}
                  className="flex items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 px-3 py-2"
                >
                  <span className="selectable-text flex-1 font-mono text-xs text-rose-700 dark:text-rose-400">{hbl}</span>
                  <button
                    type="button"
                    title="Quitar de la lista"
                    onClick={() => setNotFoundHbls((prev) => prev.filter((h) => h !== hbl))}
                    className="bg-transparent border-none cursor-pointer text-gray-500 dark:text-gray-400 hover:text-red-500 font-bold"
                  >
                    x
                  </button>
                </span>
              ))}
              {notFoundHbls.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sin HBLs pendientes de registro</p>
              )}
              <div className="flex gap-2">
                <input
                  className="border border-border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex-1"
                  value={newNotFoundHbl}
                  onChange={(e) => setNewNotFoundHbl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const hbl = newNotFoundHbl.trim();
                      if (hbl && !notFoundHbls.includes(hbl)) {
                        setNotFoundHbls((prev) => [...prev, hbl]);
                      }
                      setNewNotFoundHbl('');
                    }
                  }}
                  placeholder="Escribir un HBL faltante y presionar Enter"
                />
                <button
                  type="button"
                  onClick={() => {
                    const hbl = newNotFoundHbl.trim();
                    if (hbl && !notFoundHbls.includes(hbl)) {
                      setNotFoundHbls((prev) => [...prev, hbl]);
                    }
                    setNewNotFoundHbl('');
                  }}
                  className="bg-slate-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={updateRoute.isPending}>Guardar</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/routes')}>Cancelar</button>
          </div>
        </form>
        {backendNotFoundHbls.length > 0 && (
          <button
            type="button"
            onClick={async () => {
              try {
                await convertHbls.mutateAsync(id!);
                await qc.refetchQueries({ queryKey: ['routes'] });
              } catch (err) {
                setLocalError((err as Error).message);
              }
            }}
            disabled={convertHbls.isPending}
            className="mt-4 bg-emerald-500 text-white font-semibold rounded-xl px-4 py-2.5 text-sm cursor-pointer border-none hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {convertHbls.isPending ? 'Convirtiendo...' : `Convertir ${backendNotFoundHbls.length} HBL${backendNotFoundHbls.length !== 1 ? 's' : ''} a paquetes`}
          </button>
        )}
      </div>

      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Actualizar estado de los paquetes de la ruta</h2>
        {(bulkError || updateStatusBulk.error) && (
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
            {bulkError || (updateStatusBulk.error as Error).message}
          </div>
        )}
        {updateStatusBulk.isPending && (
          <div className="mb-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            Procesando...
          </div>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBulkError(null);
            setBulkResult(null);
            const parsed = bulkHbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
            if (parsed.length === 0) {
              setBulkError('No hay HBLs para actualizar');
              return;
            }
            if (!bulkStatusId) {
              setBulkError('Debes seleccionar un estado');
              return;
            }
            if (!bulkLocationId) {
              setBulkError('Debes seleccionar una ubicacion');
              return;
            }
            if (!bulkDate) {
              setBulkError('Debes seleccionar una fecha de cambio de estado');
              return;
            }
            try {
              const data = await updateStatusBulk.mutateAsync({
                hbls: parsed,
                statusId: bulkStatusId,
                locationId: bulkLocationId,
                statusDate: dateInputToIso(bulkDate),
              });
              setBulkResult(data as BulkResult);
              await qc.refetchQueries({ queryKey: ['routes'] });
            } catch (err) {
              setBulkError((err as Error).message);
            }
          }}
          className="grid grid-cols-2 gap-3.5"
        >
          <label className="col-span-full flex flex-col gap-1.5 font-medium">
            HBLs de la ruta (separados por coma, punto y coma o saltos de linea)
            <textarea className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={bulkHbls} onChange={(e) => setBulkHbls(e.target.value)} rows={3} />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Estado nuevo *
            <CustomSelect value={bulkStatusId} onChange={setBulkStatusId} options={statuses} placeholder="Seleccionar" />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Ubicacion nueva *
            <CustomSelect value={bulkLocationId} onChange={setBulkLocationId} options={locations} placeholder="Seleccionar" />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Fecha cambio de estado *
            <DatePicker value={bulkDate} onChange={setBulkDate} max={todayDateInput()} placeholder="Seleccionar fecha" className="w-full" />
          </label>
          <button type="submit" className="col-span-full bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2" disabled={updateStatusBulk.isPending}>
            {updateStatusBulk.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Actualizar estado de los paquetes
          </button>
        </form>

        {bulkResult && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 p-4 border border-border rounded-xl bg-white dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {bulkResult.success.length} actualizados
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 text-rose-700 dark:text-rose-400">
                <XCircle className="h-3.5 w-3.5" />
                {bulkResult.failed.length} no encontrados
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3 bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Paquetes actualizados
                </span>
                <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">{bulkResult.success.length}</span>
              </div>
              {bulkResult.success.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">Ningun paquete fue actualizado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <th className="px-4 py-2.5 font-semibold">HBL</th>
                        <th className="px-4 py-2.5 font-semibold">Estado</th>
                        <th className="px-4 py-2.5 font-semibold">Ubicacion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bulkResult.success.map((item) => (
                        <tr key={item.hbl} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-2.5 font-mono text-gray-900 dark:text-gray-100">{item.hbl}</td>
                          <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{statuses.find((s) => s.id === item.package?.statusId)?.name || '—'}</td>
                          <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{locations.find((l) => l.id === item.package?.locationId)?.name || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3 bg-rose-50 px-4 py-3 dark:bg-rose-900/20">
                <span className="flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-300">
                  <XCircle className="h-4 w-4" />
                  No encontrados
                </span>
                <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white">{bulkResult.failed.length}</span>
              </div>
              {bulkResult.failed.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">Todos los HBLs fueron encontrados.</p>
              ) : (
                <div className="flex flex-wrap gap-2 px-4 py-3.5">
                  {bulkResult.failed.map((hbl) => (
                    <span key={hbl} className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 font-mono text-xs text-rose-700 dark:text-rose-400">{hbl}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
