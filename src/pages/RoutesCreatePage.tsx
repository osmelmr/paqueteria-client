import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  Copy,
  Plus,
  XCircle,
} from 'lucide-react';
import { useCreateRoute } from '../hooks/useRoutes';
import { useVehicles } from '../hooks/useVehicles';
import { useDrivers } from '../hooks/useDrivers';
import type { CreateRouteDto, CreateRouteResult } from '../api/routes.api';
import { CustomSelect } from '../components/CustomSelect';

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
  const [result, setResult] = useState<CreateRouteResult | null>(null);
  const [copied, setCopied] = useState(false);

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

  const resetForm = () => {
    setForm({ name: '', description: '', departureDate: '', vehicleId: '', hbls: '' });
    setDriverIds([]);
    setResult(null);
    setCopied(false);
    setLocalError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setResult(null);
    setCopied(false);

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
      const res = await createRoute.mutateAsync(dto);
      setResult(res);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleCopyNotFound = async () => {
    if (!result || result.notFound.length === 0) return;
    const text = result.notFound.join('\n');
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) {
    const totalHbls = result.totalHbls ?? result.notFound.length + result.foundPackages;
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-emerald-200 dark:border-emerald-900/50 rounded-xl bg-surface shadow-lg mb-[18px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0">Ruta creada correctamente</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 m-0 uppercase">{result.route.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-4 border border-border rounded-xl bg-white dark:bg-slate-900 mb-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Total consultados: {totalHbls}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {result.foundPackages} paquetes encontrados
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 text-rose-700 dark:text-rose-400">
              <XCircle className="h-3.5 w-3.5" />
              {result.notFound.length} HBLs no encontrados
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3 bg-rose-50 px-4 py-3 dark:bg-rose-900/20">
              <span className="flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-300">
                <XCircle className="h-4 w-4" />
                HBLs no encontrados
              </span>
              <div className="flex items-center gap-2">
                {result.notFound.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopyNotFound}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-rose-700 dark:bg-slate-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                    }`}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? '¡Copiados!' : 'Copiar'}
                  </button>
                )}
                <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {result.notFound.length}
                </span>
              </div>
            </div>
            {result.notFound.length === 0 ? (
              <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                Todos los HBLs fueron encontrados y agregados a la ruta.
              </p>
            ) : (
              <div className="px-4 py-3.5">
                <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
                  Selecciona el texto para copiarlo.
                </p>
                <pre className="selectable-text cursor-text m-0 whitespace-pre-wrap break-words font-mono text-sm text-rose-700 dark:text-rose-300">
                  {result.notFound.join('\n')}
                </pre>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 flex-wrap mt-5">
            <button
              type="button"
              onClick={() => navigate(`/routes/${result.route.id}`)}
              className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors"
            >
              Ver ruta creada
            </button>
            <button
              type="button"
              onClick={() => navigate('/routes')}
              className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Ver rutas
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear otra ruta
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <CustomSelect value={form.vehicleId} onChange={handleVehicleChange} options={vehicles} placeholder={vehiclesLoading ? 'Cargando vehiculos...' : 'Seleccionar'} />
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