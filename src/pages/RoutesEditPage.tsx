import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoutes, useUpdateRoute } from '../hooks/useRoutes';
import { useVehicles } from '../hooks/useVehicles';
import { useDrivers } from '../hooks/useDrivers';
import { CustomSelect } from '../components/CustomSelect';
import { DatePicker } from '../components/DatePicker';
import { CreateMissingPackageModal } from '../components/CreateMissingPackageModal';

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
  const { data: routes = [], isLoading } = useRoutes();
  const updateRoute = useUpdateRoute();
  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();

  const route = routes.find((r) => r.id === id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    departureDate: '',
    vehicleId: '',
    hbls: '',
  });
  const [notFoundHbls, setNotFoundHbls] = useState<string[]>([]);
  const [newNotFoundHbl, setNewNotFoundHbl] = useState('');
  const [editingHbl, setEditingHbl] = useState<string | null>(null);
  const [driverIds, setDriverIds] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!route) return;
    const d = route.departureDate ? new Date(route.departureDate) : null;
    const local = d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : '';
    setForm({
      name: route.name,
      description: route.description ?? '',
      departureDate: local,
      vehicleId: route.vehicleId,
      hbls: route.packages?.flatMap((p) => p.hbls?.map((h) => h.hblCode) ?? []).join(', ') ?? '',
    });
    setNotFoundHbls(parseNotFound(route.notFound));
    const routeDrivers = route.drivers?.map((r) => r.driverId) ?? [];
    if (routeDrivers.length > 0) {
      setDriverIds(routeDrivers);
    } else {
      setDriverIds(route.vehicle?.drivers?.map((dv) => dv.driverId) ?? []);
    }
  }, [route?.id]);

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
      navigate('/routes');
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
                    onClick={() => setEditingHbl(hbl)}
                    className="bg-rose-500 text-white font-semibold rounded-lg px-3 py-1.5 text-xs cursor-pointer border-none hover:bg-rose-600 transition-colors"
                  >
                    Editar paquete
                  </button>
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
      </div>
      <CreateMissingPackageModal
        isOpen={editingHbl !== null}
        hbl={editingHbl ?? ''}
        onClose={() => setEditingHbl(null)}
        onCreated={(hbl) => {
          setNotFoundHbls((prev) => prev.filter((h) => h !== hbl));
          setForm((prev) => {
            const list = prev.hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
            if (!list.includes(hbl)) list.push(hbl);
            return { ...prev, hbls: list.join(', ') };
          });
          setEditingHbl(null);
        }}
      />
    </div>
  );
}
