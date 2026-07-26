import { useEffect, useState, type FormEvent } from 'react';
import type { Status } from '../types';
import { api } from '../api';

function StatusesPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [editing, setEditing] = useState<Status | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<Status[]>('/statuses');
      setStatuses(Array.isArray(data) ? data : (data as unknown as { data: Status[] }).data || []);
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
        await api(`/statuses/${editing.id}`, 'PATCH', form);
      } else {
        await api('/statuses', 'POST', form);
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

  const handleEdit = (s: Status) => {
    setEditing(s);
    setForm({ name: s.name });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este estado?')) return;
    setLoading(true);
    try {
      await api(`/statuses/${id}`, 'DELETE');
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
      <h2>Estados</h2>
      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Cargando...</div>}

      <form onSubmit={handleSubmit} className="simple-form two-column-form">
        <label>
          Nombre
          <input value={form.name} onChange={(e) => setForm({ name: e.target.value })} required />
        </label>
        <div className="button-group">
          <button type="submit" disabled={loading}>{editing ? 'Actualizar' : 'Crear'} estado</button>
          {editing && <button type="button" className="secondary" onClick={cancelEdit}>Cancelar</button>}
        </div>
      </form>

      <div className="list-card">
        <h3>Estados ({statuses.length})</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {statuses.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>
                  <button type="button" className="small" onClick={() => handleEdit(s)}>Editar</button>
                  <button type="button" className="small secondary" onClick={() => handleDelete(s.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StatusesPage;
