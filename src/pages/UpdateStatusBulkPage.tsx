import { useState, type FormEvent } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Package as PackageIcon,
  XCircle,
} from 'lucide-react';
import { useUpdateStatusBulk } from '../hooks/useBusiness';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import { dateInputToIso, todayDateInput } from '../utils/date';
import { CustomSelect } from '../components/CustomSelect';

type BulkResult = {
  success: Array<{ hbl: string; package: { statusId?: string; locationId?: string | null } | null }>;
  failed: string[];
};

export default function UpdateStatusBulkPage() {
  const [hbls, setHbls] = useState('');
  const [statusId, setStatusId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [statusDate, setStatusDate] = useState('');
  const [result, setResult] = useState<BulkResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();
  const mutation = useUpdateStatusBulk();

  const error = mutation.error ? (mutation.error as Error).message : localError;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setResult(null);

    const parsed = hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    if (parsed.length === 0) {
      setLocalError('Ingresa al menos un HBL');
      return;
    }
    if (!statusId) {
      setLocalError('Debes seleccionar un estado');
      return;
    }
    if (!locationId) {
      setLocalError('Debes seleccionar una ubicación');
      return;
    }
    if (!statusDate) {
      setLocalError('Debes seleccionar una fecha de cambio de estado');
      return;
    }

    try {
      const data = await mutation.mutateAsync({
        hbls: parsed,
        statusId,
        locationId,
        statusDate: dateInputToIso(statusDate),
      });
      setResult(data as BulkResult);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
      <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Actualizar estado por HBL (bulk)</h2>
      {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
      {mutation.isPending && (
        <div className="mb-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          Procesando...
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
        <label className="col-span-full">
          HBLs (separados por coma, punto y coma o salto de linea) *
          <textarea className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            value={hbls}
            onChange={(e) => setHbls(e.target.value)}
            rows={5}
            placeholder="HBL001, HBL002, HBL003"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 font-medium">
          Estado nuevo *
          <CustomSelect value={statusId} onChange={setStatusId} options={statuses} placeholder="Seleccionar" />
        </label>
        <label className="flex flex-col gap-1.5 font-medium">
          Ubicacion nueva *
          <CustomSelect value={locationId} onChange={setLocationId} options={locations} placeholder="Seleccionar" />
        </label>
        <label className="flex flex-col gap-1.5 font-medium">
          Fecha cambio de estado *
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              className="w-full appearance-none border border-border rounded-xl py-2.5 pl-10 pr-10 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors hover:border-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:transition-opacity hover:[&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:opacity-70 dark:hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              type="date"
              max={todayDateInput()}
              value={statusDate}
              onChange={(e) => setStatusDate(e.target.value)}
              required
            />
          </div>
        </label>
        <button type="submit" className="col-span-full bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Actualizar
        </button>
      </form>

      {result && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 p-4 border border-border rounded-xl bg-white dark:bg-slate-900">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <PackageIcon className="h-4 w-4 text-purple-500" />
              Total procesados: {result.success.length + result.failed.length}
            </span>
            <button
              type="button"
              onClick={() => document.getElementById('bulk-success-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-emerald-700 dark:text-emerald-400 cursor-pointer transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {result.success.length} actualizados
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('bulk-failed-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 text-rose-700 dark:text-rose-400 cursor-pointer transition-colors hover:bg-rose-200 dark:hover:bg-rose-900/50"
            >
              <XCircle className="h-3.5 w-3.5" />
              {result.failed.length} no encontrados
            </button>
          </div>

          <div id="bulk-success-section" className="scroll-mt-4 overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3 bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Paquetes actualizados
              </span>
              <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                {result.success.length}
              </span>
            </div>
            {result.success.length === 0 ? (
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
                    {result.success.map((item) => (
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

          <div id="bulk-failed-section" className="scroll-mt-4 overflow-hidden rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3 bg-rose-50 px-4 py-3 dark:bg-rose-900/20">
              <span className="flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-300">
                <XCircle className="h-4 w-4" />
                No encontrados
              </span>
              <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                {result.failed.length}
              </span>
            </div>
            {result.failed.length === 0 ? (
              <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">Todos los HBLs fueron encontrados.</p>
            ) : (
              <div className="flex flex-wrap gap-2 px-4 py-3.5">
                {result.failed.map((hbl) => (
                  <span key={hbl} className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 font-mono text-xs text-rose-700 dark:text-rose-400">
                    {hbl}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}