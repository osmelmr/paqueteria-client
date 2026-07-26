import { useEffect, useState, type FormEvent } from 'react';
import type { Recipient } from '../types';
import { api } from '../api';

function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', idCard: '', phone: '' });
  const [editing, setEditing] = useState<Recipient | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<Recipient[]>('/recipients');
      setRecipients(Array.isArray(data) ? data : (data as unknown as { data: Recipient[] }).data || []);
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
        await api(`/recipients/${editing.id}`, 'PATCH', form);
      } else {
        await api('/recipients', 'POST', form);
      }
      setForm({ fullName: '', idCard: '', phone: '' });
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (r: Recipient) => {
    setEditing(r);
    setForm({ fullName: r.fullName, idCard: r.idCard, phone: r.phone || '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este destinatario?')) return;
    setLoading(true);
    try {
      await api(`/recipients/${id}`, 'DELETE');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ fullName: '', idCard: '', phone: '' });
  };

  return (
    <div className="panel">
      <h2>Destinatarios</h2>
      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Cargando...</div>}

      <form onSubmit={handleSubmit} className="simple-form grid-form">
        <label>
          Nombre
          <input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
        </label>
        <label>
          Carnet
          <input value={form.idCard} onChange={(e) => setForm((prev) => ({ ...prev, idCard: e.target.value }))} required />
        </label>
        <label className="full-width">
          Teléfono
          <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
        </label>
        <div className="button-group" style={{ gridColumn: '1 / -1' }}>
          <button type="submit" disabled={loading}>{editing ? 'Actualizar' : 'Crear'} destinatario</button>
          {editing && <button type="button" className="secondary" onClick={cancelEdit}>Cancelar</button>}
        </div>
      </form>

      <div className="list-card">
        <h3>Destinatarios ({recipients.length})</h3>
        <table>
          <thead>
            <tr><th>Nombre</th><th>Carnet</th><th>Teléfono</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {recipients.map((r) => (
              <tr key={r.id}>
                <td>{r.fullName}</td>
                <td>{r.idCard}</td>
                <td>{r.phone || '—'}</td>
                <td>
                  <button type="button" className="small" onClick={() => handleEdit(r)}>Editar</button>
                  <button type="button" className="small secondary" onClick={() => handleDelete(r.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecipientsPage;
