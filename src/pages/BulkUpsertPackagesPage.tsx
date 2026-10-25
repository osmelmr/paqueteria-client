import { useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Loader2,
  Package as PackageIcon,
  PenLine,
  XCircle,
} from 'lucide-react';
import { useBulkUpsertPackages } from '../hooks/usePackages';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import { CustomSelect } from '../components/CustomSelect';
import type { BulkUpsertResult } from '../api/packages.api';

const inputClass =
  'w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200';

export default function BulkUpsertPackagesPage() {
  const [hbls, setHbls] = useState('');
  const [statusId, setStatusId] = useState('');
  const [locationId, setLocationId] = useState('');

  // datos opcionales: se aplican solo si vienen con valor
  const [address, setAddress] = useState('');
  const [content, setContent] = useState('');
  const [weight, setWeight] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [anotations, setAnotations] = useState('');
  const [fullName, setFullName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [municipe, setMunicipe] = useState('');

  const [showExtra, setShowExtra] = useState(false);
  const [result, setResult] = useState<BulkUpsertResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();
  const mutation = useBulkUpsertPackages();

  const error = mutation.error ? (mutation.error as Error).message : localError;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setResult(null);

    const parsed = hbls
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
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

    const optional: Record<string, unknown> = {};
    if (address.trim()) optional.address = address.trim();
    if (content.trim()) optional.content = content.trim();
    if (anotations.trim()) optional.anotations = anotations.trim();
    if (weight.trim()) {
      const parsedWeight = parseFloat(weight.replace(',', '.'));
      if (!Number.isFinite(parsedWeight)) {
        setLocalError('El peso debe ser un número');
        return;
      }
      optional.weight = parsedWeight;
    }
    if (arrivalDate) optional.arrivalDate = arrivalDate;
    if (fullName.trim()) optional.fullName = fullName.trim();
    if (idCard.trim()) optional.idCard = idCard.trim();
    if (phone.trim()) optional.phone = phone.trim();
    if (province.trim()) optional.province = province.trim();
    if (municipe.trim()) optional.municipe = municipe.trim();

    try {
      const res = await mutation.mutateAsync({
        statusId,
        locationId,
        packages: parsed.map((hbl) => ({ hbls: [hbl], ...optional })),
      });
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
              Crear / Actualizar paquetes por HBL
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Los HBL que no existen se crean nuevos y los que ya existen se actualizan con los datos que vengas indicando
            </p>
          </div>
        </div>

        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Datos</h2>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl selectable-text">{error}</div>
          )}

          <div className="mb-4 p-3.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-xl text-sm selectable-text">
            Los campos opcionales vacíos <strong>no borran</strong> la información que ya tiene el paquete. El estado y la
            ubicación de arriba se usan solo para <strong>crear</strong> los paquetes nuevos.
          </div>

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
                Estado (para crear) *
                <CustomSelect
                  value={statusId}
                  onChange={setStatusId}
                  options={statuses}
                  placeholder="Seleccionar estado"
                />
              </label>
              <label className="flex flex-col gap-1.5 font-medium">
                Ubicación (para crear) *
                <CustomSelect
                  value={locationId}
                  onChange={setLocationId}
                  options={locations}
                  placeholder="Seleccionar ubicación"
                />
              </label>
            </div>

            <button
              type="button"
              className="self-start flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-transparent border-none cursor-pointer px-0 py-1 hover:text-purple-700 dark:hover:text-purple-300"
              onClick={() => setShowExtra((prev) => !prev)}
            >
              <PenLine className="w-4 h-4" />
              {showExtra ? 'Ocultar datos opcionales' : 'Agregar datos opcionales (dirección, destinatario, etc.)'}
            </button>

            {showExtra && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 border border-border rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <label className="flex flex-col gap-1.5 font-medium sm:col-span-2">
                  Dirección
                  <input className={inputClass} type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección del destinatario" />
                </label>
                <label className="flex flex-col gap-1.5 font-medium sm:col-span-2">
                  Contenido
                  <input className={inputClass} type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenido del paquete" />
                </label>
                <label className="flex flex-col gap-1.5 font-medium">
                  Peso (kg)
                  <input className={inputClass} type="number" step="0.1" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.0" />
                </label>
                <label className="flex flex-col gap-1.5 font-medium">
                  Fecha de llegada
                  <input className={inputClass} type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 font-medium">
                  Nombre del destinatario
                  <input className={inputClass} type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 font-medium">
                  Carné de identidad
                  <input className={inputClass} type="text" value={idCard} onChange={(e) => setIdCard(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 font-medium">
                  Teléfono
                  <input className={inputClass} type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 font-medium">
                  Provincia
                  <input className={inputClass} type="text" value={province} onChange={(e) => setProvince(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 font-medium">
                  Municipio
                  <input className={inputClass} type="text" value={municipe} onChange={(e) => setMunicipe(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5 font-medium sm:col-span-2">
                  Anotaciones
                  <textarea
                    className="w-full min-h-20 resize-y border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    value={anotations}
                    onChange={(e) => setAnotations(e.target.value)}
                    rows={3}
                  />
                </label>
              </div>
            )}

            <button
              type="submit"
              className="self-start flex items-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 text-white font-semibold rounded-xl px-5 py-3 text-sm transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageIcon className="h-4 w-4" />}
              Crear / Actualizar paquetes
            </button>
          </form>
        </div>

        {mutation.isPending && (
          <div className="mb-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            Procesando paquetes...
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
              <span className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-amber-700 dark:text-amber-400">
                <PenLine className="h-3.5 w-3.5" />
                {result.updated.length} actualizados
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 text-rose-700 dark:text-rose-400">
                <XCircle className="h-3.5 w-3.5" />
                {result.failed.length} fallidos
              </span>
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
                    {result.created.map((c) => c.hbls.join(', ')).join('\n')}
                  </pre>
                </div>
              </section>
            )}

            {result.updated.length > 0 && (
              <section className="overflow-hidden rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                  <PenLine className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Paquetes actualizados ({result.updated.length})
                  </span>
                </div>
                <div className="px-4 py-3">
                  <pre className="selectable-text cursor-text m-0 whitespace-pre-wrap break-words font-mono text-sm text-amber-700 dark:text-amber-300">
                    {result.updated.map((u) => u.hbls.join(', ')).join('\n')}
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
                      <span className="font-mono font-semibold">{f.hbls.join(', ')}</span>: {f.error}
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
