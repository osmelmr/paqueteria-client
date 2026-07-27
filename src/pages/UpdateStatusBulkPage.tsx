import { useState, type FormEvent } from 'react';
import { useUpdateStatusBulk } from '../hooks/useBusiness';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';

type BulkResult = {
  success: Array<{ hbl: string; package: any }>;
  failed: string[];
};

export default function UpdateStatusBulkPage() {
  const [hbls, setHbls] = useState('');
  const [statusId, setStatusId] = useState('');
  const [locationId, setLocationId] = useState('');
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

    try {
      const data = await mutation.mutateAsync({
        hbls: parsed,
        statusId: statusId || undefined,
        locationId: locationId || undefined,
      });
      setResult(data as BulkResult);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-[#dbdbdb] dark:bg-[#1e1f27] shadow-lg mb-[18px]">
      <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Actualizar estado por HBL (bulk)</h2>
      {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
      {mutation.isPending && <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Procesando...</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
        <label className="col-span-full">
          HBLs (separados por coma, punto y coma o salto de linea)
          <textarea className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200"
            value={hbls}
            onChange={(e) => setHbls(e.target.value)}
            rows={5}
            placeholder="HBL001, HBL002, HBL003"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 font-medium">
          Estado nuevo
          <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={statusId} onChange={(e) => setStatusId(e.target.value)}>
            <option value="">Sin cambio</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 font-medium">
          Ubicacion nueva
          <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            <option value="">Sin cambio</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="col-span-full bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={mutation.isPending}>
          Actualizar
        </button>
      </form>

      {result && (
        <div className="mt-4 overflow-x-auto" style={{ marginTop: '1rem' }}>
          <h3>Resultados</h3>

          <h4>Actualizados ({result.success.length})</h4>
          {result.success.length === 0 ? (
            <p>Ningun paquete fue actualizado.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>HBL</th>
                  <th>ID Paquete</th>
                  <th>Estado</th>
                  <th>Ubicacion</th>
                </tr>
              </thead>
              <tbody>
                {result.success.map((item) => (
                  <tr key={item.hbl}>
                    <td>{item.hbl}</td>
                    <td>{item.package?.id}</td>
                    <td>{item.package?.statusId}</td>
                    <td>{item.package?.locationId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h4 style={{ marginTop: '1rem' }}>No encontrados ({result.failed.length})</h4>
          {result.failed.length === 0 ? (
            <p>Todos los HBLs fueron encontrados.</p>
          ) : (
            <table>
              <thead>
                <tr><th>HBL</th></tr>
              </thead>
              <tbody>
                {result.failed.map((hbl) => (
                  <tr key={hbl}><td>{hbl}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
