import { useEffect, useState, type FormEvent } from 'react';
import type { Agency, Guide } from '../types';
import { api } from '../api';

function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ externalRef: '', agencyId: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [gData, aData] = await Promise.all([
        api<Guide[]>('/guides'),
        api<Agency[]>('/agencies'),
      ]);
      setGuides(Array.isArray(gData) ? gData : (gData as unknown as { data: Guide[] }).data || []);
      setAgencies(Array.isArray(aData) ? aData : (aData as unknown as { data: Agency[] }).data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api('/guides', 'POST', form);
      setForm({ externalRef: '', agencyId: '' });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta guía?')) return;
    setLoading(true);
    try {
      await api(`/guides/${id}`, 'DELETE');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h2>Guías</h2>
      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Cargando...</div>}

      <form onSubmit={handleSubmit} className="simple-form grid-form">
        <label>
          Agencia
          <select value={form.agencyId} onChange={(e) => setForm((prev) => ({ ...prev, agencyId: e.target.value }))} required>
            <option value="">Seleccionar agencia</option>
            {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <label>
          Referencia externa
          <input value={form.externalRef} onChange={(e) => setForm((prev) => ({ ...prev, externalRef: e.target.value }))} required />
        </label>
        <button type="submit" disabled={loading}>Crear guía</button>
      </form>

      <div className="list-card">
        <h3>Guías ({guides.length})</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Agencia</th><th>Referencia</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {guides.map((g) => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.agency?.name || '—'}</td>
                <td>{g.externalRef}</td>
                <td><button type="button" className="small secondary" onClick={() => handleDelete(g.id)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GuidesPage;
