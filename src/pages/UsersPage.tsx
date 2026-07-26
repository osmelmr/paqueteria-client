import { useEffect, useState, type FormEvent } from 'react';
import type { User } from '../types';
import { api } from '../api';

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'employee' });
  const [editing, setEditing] = useState<User | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<User[]>('/users');
      setUsers(Array.isArray(data) ? data : (data as unknown as { data: User[] }).data || []);
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
        const body: Record<string, string> = { fullName: form.fullName, role: form.role };
        if (form.email) body.email = form.email;
        if (form.password) body.password = form.password;
        await api(`/users/${editing.id}`, 'PATCH', body);
      } else {
        await api('/users', 'POST', form);
      }
      setForm({ username: '', password: '', fullName: '', email: '', role: 'employee' });
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (u: User) => {
    setEditing(u);
    setForm({ username: u.username, password: '', fullName: u.fullName, email: u.email || '', role: u.role });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este usuario?')) return;
    setLoading(true);
    try {
      await api(`/users/${id}`, 'DELETE');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ username: '', password: '', fullName: '', email: '', role: 'employee' });
  };

  return (
    <div className="panel">
      <h2>Usuarios</h2>
      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Cargando...</div>}

      <form onSubmit={handleSubmit} className="simple-form grid-form">
        <label>
          Usuario
          <input value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} required={!editing} disabled={!!editing} />
        </label>
        <label>
          Contraseña
          <input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required={!editing} placeholder={editing ? 'Dejar vacío para no cambiar' : ''} />
        </label>
        <label>
          Nombre completo
          <input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
        </label>
        <label>
          Rol
          <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
            <option value="employee">Empleado</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="button-group" style={{ gridColumn: '1 / -1' }}>
          <button type="submit" disabled={loading}>{editing ? 'Actualizar' : 'Crear'} usuario</button>
          {editing && <button type="button" className="secondary" onClick={cancelEdit}>Cancelar</button>}
        </div>
      </form>

      <div className="list-card">
        <h3>Usuarios ({users.length})</h3>
        <table>
          <thead>
            <tr><th>Usuario</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.fullName}</td>
                <td>{u.email || '—'}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? 'Sí' : 'No'}</td>
                <td>
                  <button type="button" className="small" onClick={() => handleEdit(u)}>Editar</button>
                  <button type="button" className="small secondary" onClick={() => handleDelete(u.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;
