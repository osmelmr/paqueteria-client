import { useEffect, useState, type FormEvent } from 'react';
import type { Agency } from '../types';
import { api } from '../api';

function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [editing, setEditing] = useState<Agency | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<Agency[]>('/agencies');
      setAgencies(Array.isArray(data) ? data : (data as unknown as { data: Agency[] }).data || []);
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
      if (editing) {
        await api(`/agencies/${editing.id}`, 'PATCH', form);
      } else {
        await api('/agencies', 'POST', form);
      }
      setForm({ name: '' });
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agency: Agency) => {
    setEditing(agency);
    setForm({ name: agency.name });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta agencia?')) return;
    setLoading(true);
    try {
      await api(`/agencies/${id}`, 'DELETE');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '' });
  };

  return (
    <div className="panel">
      <h2>Agencias</h2>
      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Cargando...</div>}

      <form onSubmit={handleSubmit} className="simple-form two-column-form">
        <label>
          Nombre
          <input value={form.name} onChange={(e) => setForm({ name: e.target.value })} required />
        </label>
        <div className="button-group">
          <button type="submit" disabled={loading}>{editing ? 'Actualizar' : 'Crear'} agencia</button>
          {editing && <button type="button" className="secondary" onClick={cancelEdit}>Cancelar</button>}
        </div>
      </form>

      <div className="list-card">
        <h3>Agencias ({agencies.length})</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {agencies.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>
                  <button type="button" className="small" onClick={() => handleEdit(a)}>Editar</button>
                  <button type="button" className="small secondary" onClick={() => handleDelete(a.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AgenciesPage;
