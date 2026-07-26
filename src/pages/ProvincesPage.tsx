import { useEffect, useState, type FormEvent } from 'react';
import type { Province } from '../types';
import { api } from '../api';

function ProvincesPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [editing, setEditing] = useState<Province | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<Province[]>('/provinces');
      setProvinces(Array.isArray(data) ? data : (data as unknown as { data: Province[] }).data || []);
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
        await api(`/provinces/${editing.id}`, 'PATCH', form);
      } else {
        await api('/provinces', 'POST', form);
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

  const handleEdit = (province: Province) => {
    setEditing(province);
    setForm({ name: province.name });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta provincia?')) return;
    setLoading(true);
    try {
      await api(`/provinces/${id}`, 'DELETE');
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
      <h2>Provincias</h2>
      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Cargando...</div>}

      <form onSubmit={handleSubmit} className="simple-form two-column-form">
        <label>
          Nombre
          <input value={form.name} onChange={(e) => setForm({ name: e.target.value })} required />
        </label>
        <div className="button-group">
          <button type="submit" disabled={loading}>{editing ? 'Actualizar' : 'Crear'} provincia</button>
          {editing && <button type="button" className="secondary" onClick={cancelEdit}>Cancelar</button>}
        </div>
      </form>

      <div className="list-card">
        <h3>Provincias ({provinces.length})</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {provinces.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>
                  <button type="button" className="small" onClick={() => handleEdit(p)}>Editar</button>
                  <button type="button" className="small secondary" onClick={() => handleDelete(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProvincesPage;
