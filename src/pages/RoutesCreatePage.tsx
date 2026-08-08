import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateRoute } from '../hooks/useRoutes';
import { useVehicles } from '../hooks/useVehicles';
import { useDrivers } from '../hooks/useDrivers';
import type { CreateRouteDto } from '../api/routes.api';

export default function RoutesCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hblsParam = searchParams.get('hbls') || '';
  const createRoute = useCreateRoute();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: drivers = [] } = useDrivers();

  const [form, setForm] = useState({
    name: '',
    description: '',
    departureDate: '',
    vehicleId: '',
    hbls: hblsParam,
  });
  const [driverIds, setDriverIds] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleVehicleChange = (vehicleId: string) => {
    setForm((prev) => ({ ...prev, vehicleId }));
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    setDriverIds(vehicle?.drivers?.map((d) => d.driverId) ?? []);
  };

  const toggleDriver = (id: string) => {
    setDriverIds((prev) =>
      prev.includes(id)
        ? prev.filter((d) => d !== id)
        : [...prev, id],
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!form.departureDate) {
      setLocalError('La fecha de salida es obligatoria');
      return;
    }
    if (!form.vehicleId) {
      setLocalError('Selecciona un vehiculo');
      return;
    }

    try {
      const dto: CreateRouteDto = {
        name: form.name,
        description: form.description || undefined,
        departureDate: new Date(form.departureDate).toISOString(),
        vehicleId: form.vehicleId,
        hbls: form.hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
        driverIds,
      };
      await createRoute.mutateAsync(dto);
      navigate('/routes');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Nueva ruta</h2>
        {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Fecha de salida
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" type="datetime-local" value={form.departureDate} onChange={(e) => setForm((prev) => ({ ...prev, departureDate: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Vehiculo
            <select className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.vehicleId} onChange={(e) => handleVehicleChange(e.target.value)} required>
              <option value="">{vehiclesLoading ? 'Cargando vehiculos...' : 'Seleccionar'}</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Choferes
            <select className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value="" onChange={(e) => { if (e.target.value) toggleDriver(e.target.value); }}>
              <option value="">Agregar chofer...</option>
              {drivers.filter((d) => !driverIds.includes(d.id)).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
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
          {vehicles.length === 0 && !vehiclesLoading && (
            <div className="col-span-full p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl text-sm text-gray-900 dark:text-gray-100">
              No hay vehiculos registrados.{' '}
              <button type="button" className="bg-transparent border-none underline cursor-pointer text-purple-600 dark:text-purple-400 font-semibold" onClick={() => navigate('/vehicles/new')}>Crear uno primero</button>
            </div>
          )}
          <label className="col-span-full flex flex-col gap-1.5 font-medium">
            Descripcion
            <textarea className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
          </label>
          <label className="col-span-full flex flex-col gap-1.5 font-medium">
            HBLs (separados por coma, punto y coma o saltos de linea)
            {form.hbls && (
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                {form.hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).length} HBLs cargados desde el filtro de paquetes
              </span>
            )}
            <textarea className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.hbls} onChange={(e) => setForm((prev) => ({ ...prev, hbls: e.target.value }))} rows={3} placeholder="HBL001, HBL002" />
          </label>
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={createRoute.isPending}>Crear ruta</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/routes')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
