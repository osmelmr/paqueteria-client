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
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-[#dbdbdb] dark:bg-[#1e1f27] shadow-lg mb-[18px]">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0">Usuarios</h2>
          <button type="button" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors" onClick={() => navigate('/users/new')}>Nuevo usuario</button>
        </div>
        {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
        {isLoading && <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Usuario</th>
                <th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Nombre</th>
                <th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Email</th>
                <th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Rol</th>
                <th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Activo</th>
                <th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: User) => (
                <tr key={u.id}>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">{u.username}</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">{u.fullName}</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">{u.email || '—'}</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">{u.role === 'ADMIN' ? 'Admin' : 'Almacenero'}</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">{u.isActive ? 'Si' : 'No'}</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="bg-purple-500 dark:bg-purple-400 text-white rounded-xl px-2.5 py-2 text-xs cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors" onClick={() => navigate(`/users/${u.id}/edit`)}>Editar</button>
                      <button type="button" className="bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => handleDelete(u.id)}>Eliminar</button>
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
