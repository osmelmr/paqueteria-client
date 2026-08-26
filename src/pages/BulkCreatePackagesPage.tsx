import { useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Loader2,
  Package as PackageIcon,
  XCircle,
} from 'lucide-react';
import { useBulkCreatePackages } from '../hooks/usePackages';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import { CustomSelect } from '../components/CustomSelect';

type BulkResult = {
  created: Array<{ hbl: string; packageId: string }>;
  failed: Array<{ hbl: string; error: string }>;
  total: number;
};

export default function BulkCreatePackagesPage() {
  const [hbls, setHbls] = useState('');
  const [statusId, setStatusId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [result, setResult] = useState<BulkResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();
  const mutation = useBulkCreatePackages();

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

    try {
      const res = await mutation.mutateAsync({ hbls: parsed, statusId, locationId });
      setResult(res);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <main className="flex-1 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Crear paquetes por HBL
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Crea varios paquetes a partir de una lista de HBLs con un estado y ubicación comunes
            </p>
          </div>
        </div>

        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Datos</h2>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl selectable-text">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5 font-medium">
              HBLs (separados por coma, punto y coma o salto de linea) *
              <textarea
                className="w-full min-h-32 resize-y border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                value={hbls}
                onChange={(e) => setHbls(e.target.value)}
                rows={6}
                placeholder={'HBL001\nHBL002\nHBL003'}
                required
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label className="flex flex-col gap-1.5 font-medium">
                Estado *
                <CustomSelect
                  value={statusId}
                  onChange={setStatusId}
                  options={statuses}
                  placeholder="Seleccionar estado"
                />
              </label>
              <label className="flex flex-col gap-1.5 font-medium">
                Ubicación *
                <CustomSelect
                  value={locationId}
                  onChange={setLocationId}
                  options={locations}
                  placeholder="Seleccionar ubicación"
                />
              </label>
            </div>
            <button
              type="submit"
              className="self-start flex items-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 text-white font-semibold rounded-xl px-5 py-3 text-sm transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageIcon className="h-4 w-4" />}
              Crear paquetes
            </button>
          </form>
        </div>

        {mutation.isPending && (
          <div className="mb-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            Creando paquetes...
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 p-4 border border-border rounded-xl bg-surface">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <PackageIcon className="h-4 w-4 text-purple-500" />
                Total: {result.total}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.created.length} creados
              </span>
              {result.failed.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 text-rose-700 dark:text-rose-400">
                  <XCircle className="h-3.5 w-3.5" />
                  {result.failed.length} fallidos
                </span>
              )}
            </div>

            {result.created.length > 0 && (
              <section className="overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Paquetes creados ({result.created.length})
                  </span>
                </div>
                <div className="px-4 py-3">
                  <pre className="selectable-text cursor-text m-0 whitespace-pre-wrap break-words font-mono text-sm text-emerald-700 dark:text-emerald-300">
                    {result.created.map((c) => c.hbl).join('\n')}
                  </pre>
                </div>
              </section>
            )}

            {result.failed.length > 0 && (
              <section className="overflow-hidden rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 bg-rose-50 px-4 py-3 dark:bg-rose-900/20">
                  <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                    Fallidos ({result.failed.length})
                  </span>
                </div>
                <div className="px-4 py-3">
                  {result.failed.map((f, i) => (
                    <p key={i} className="text-sm text-rose-700 dark:text-rose-300 mb-1">
                      <span className="font-mono font-semibold">{f.hbl}</span>: {f.error}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
