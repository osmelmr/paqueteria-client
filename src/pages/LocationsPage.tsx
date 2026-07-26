import { useEffect, useState, type FormEvent } from 'react';
import type { Location } from '../types';
import { api } from '../api';

function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [editing, setEditing] = useState<Location | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<Location[]>('/locations');
      setLocations(Array.isArray(data) ? data : (data as unknown as { data: Location[] }).data || []);
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
        await api(`/locations/${editing.id}`, 'PATCH', form);
      } else {
        await api('/locations', 'POST', form);
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

  const handleEdit = (loc: Location) => {
    setEditing(loc);
    setForm({ name: loc.name });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta ubicación?')) return;
    setLoading(true);
    try {
      await api(`/locations/${id}`, 'DELETE');
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
      <h2>Ubicaciones</h2>
      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Cargando...</div>}

      <form onSubmit={handleSubmit} className="simple-form two-column-form">
        <label>
          Nombre
          <input value={form.name} onChange={(e) => setForm({ name: e.target.value })} required />
        </label>
        <div className="button-group">
          <button type="submit" disabled={loading}>{editing ? 'Actualizar' : 'Crear'} ubicación</button>
          {editing && <button type="button" className="secondary" onClick={cancelEdit}>Cancelar</button>}
        </div>
      </form>

      <div className="list-card">
        <h3>Ubicaciones ({locations.length})</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {locations.map((l) => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.name}</td>
                <td>
                  <button type="button" className="small" onClick={() => handleEdit(l)}>Editar</button>
                  <button type="button" className="small secondary" onClick={() => handleDelete(l.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LocationsPage;
