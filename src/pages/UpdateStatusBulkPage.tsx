import { useEffect, useState, type FormEvent } from 'react';
import type { Location, Status } from '../types';
import { api } from '../api';

type UpdatedItem = { hbl: string; package: any };
type FailedItem = string;

type BulkResult = {
  success: UpdatedItem[];
  failed: FailedItem[];
};

function UpdateStatusBulkPage() {
  const [hbls, setHbls] = useState('');
  const [statusId, setStatusId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadRefs = async () => {
    const [sData, lData] = await Promise.all([
      api<Status[]>('/statuses'),
      api<Location[]>('/locations'),
    ]);
    setStatuses(Array.isArray(sData) ? sData : (sData as unknown as { data: Status[] }).data || []);
    setLocations(Array.isArray(lData) ? lData : (lData as unknown as { data: Location[] }).data || []);
  };

  useEffect(() => { loadRefs(); }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const parsed = hbls
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length === 0) {
        setError('Ingresa al menos un HBL');
        setLoading(false);
        return;
      }
      const data = await api<BulkResult>('/business/update-status-bulk', 'POST', {
        hbls: parsed,
        statusId: statusId || undefined,
        locationId: locationId || undefined,
      });
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h2>Actualizar estado por HBL (bulk)</h2>
      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Procesando...</div>}

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
        <button type="submit" className="full-width" disabled={loading}>
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

export default UpdateStatusBulkPage;
