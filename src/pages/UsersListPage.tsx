import { useNavigate } from 'react-router-dom';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import type { User } from '../api/users.api';

export default function UsersListPage() {
  const navigate = useNavigate();
  const { data: users = [], isLoading, error: queryError } = useUsers();
  const deleteUser = useDeleteUser();
  const error = queryError ? (queryError as Error).message : null;

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este usuario?')) return;
    try {
      await deleteUser.mutateAsync(id);
    } catch (err) {
      // handled by react-query
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Usuarios</h2>
          <button type="button" onClick={() => navigate('/users/new')}>Nuevo usuario</button>
        </div>
        {error && <div className="error-box">{error}</div>}
        {isLoading && <div className="loading-banner">Cargando...</div>}
        <div className="list-card">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: User) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email || '—'}</td>
                  <td>{u.role === 'ADMIN' ? 'Admin' : 'Almacenero'}</td>
                  <td>{u.isActive ? 'Si' : 'No'}</td>
                  <td>
                    <div className="inline-actions">
                      <button type="button" className="small" onClick={() => navigate(`/users/${u.id}/edit`)}>Editar</button>
                      <button type="button" className="small secondary" onClick={() => handleDelete(u.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
