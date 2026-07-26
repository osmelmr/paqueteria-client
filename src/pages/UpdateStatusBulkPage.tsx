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
    <div className="panel">
      <h2>Actualizar estado por HBL (bulk)</h2>
      {error && <div className="error-box">{error}</div>}
      {mutation.isPending && <div className="loading-banner">Procesando...</div>}

      <form onSubmit={handleSubmit} className="simple-form grid-form">
        <label className="full-width">
          HBLs (separados por coma, punto y coma o salto de linea)
          <textarea
            value={hbls}
            onChange={(e) => setHbls(e.target.value)}
            rows={5}
            placeholder="HBL001, HBL002, HBL003"
            required
          />
        </label>
        <label>
          Estado nuevo
          <select value={statusId} onChange={(e) => setStatusId(e.target.value)}>
            <option value="">Sin cambio</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label>
          Ubicacion nueva
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            <option value="">Sin cambio</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="full-width" disabled={mutation.isPending}>
          Actualizar
        </button>
      </form>

      {result && (
        <div className="list-card" style={{ marginTop: '1rem' }}>
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
