import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '../hooks/useUsers';

export default function UsersCreatePage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'STOREKEEPER' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createUser.mutateAsync(form);
      navigate('/users');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Nuevo usuario</h2>
        </div>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="simple-form grid-form">
          <label>
            Usuario
            <input value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} required />
          </label>
          <label>
            Contrasena
            <input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
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
              <option value="STOREKEEPER">Almacenero</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <div className="button-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={createUser.isPending}>Crear usuario</button>
            <button type="button" className="secondary" onClick={() => navigate('/users')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
