import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers, useUpdateUser } from '../hooks/useUsers';
import type { User } from '../api/users.api';

export default function UsersEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: users = [], isLoading: loadingUsers, error: queryError } = useUsers();
  const updateUser = useUpdateUser();
  const [error, setError] = useState<string | null>(null);

  const user: User | undefined = users.find((u: User) => u.id === id);

  const [form, setForm] = useState({ fullName: '', email: '', role: 'STOREKEEPER', password: '' });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role,
        password: '',
      });
    }
  }, [user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const dto: { fullName?: string; email?: string; role?: string; isActive?: boolean } = {
        fullName: form.fullName || undefined,
        role: form.role,
      };
      if (form.email) dto.email = form.email;
      await updateUser.mutateAsync({ id: id!, dto });
      navigate('/users');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loadingUsers) {
    return (
      <div className="page">
        <div className="panel">
          <div className="loading-banner">Cargando...</div>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="page">
        <div className="panel">
          <div className="error-box">{(queryError as Error).message}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <div className="panel">
          <div className="error-box">Usuario no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Editar usuario</h2>
        </div>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="simple-form grid-form">
          <label>
            Usuario
            <input value={user.username} disabled />
          </label>
          <label>
            Contrasena
            <input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Dejar vacio para no cambiar" />
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
            <button type="submit" disabled={updateUser.isPending}>Actualizar usuario</button>
            <button type="button" className="secondary" onClick={() => navigate('/users')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
