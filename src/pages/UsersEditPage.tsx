import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers, useUpdateUser } from '../hooks/useUsers';
import { usersApi, type User } from '../api/users.api';
import { CustomSelect } from '../components/CustomSelect';
import { useAgencies } from '../hooks/useAgencies';

const ROLE_OPTIONS = [
  { id: 'STOREKEEPER', name: 'Almacenero' },
  {id:'WORKER',name:'Trabajador'},
  {id:'PARTNER',name:'Socio'},
  { id: 'OWNER', name: 'Admin' },
  { id: 'ADMIN', name: 'Admin' },
];

function UserEditForm({ user }: { user: User }) {
  const navigate = useNavigate();
  const { data: agencies = [] } = useAgencies();
  const updateUser = useUpdateUser();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    role: user.role,
    password: '',
    agencyId: user.agencyId || '',
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const dto: { fullName?: string; email?: string; role?: string; isActive?: boolean; agencyId?: string } = {
        fullName: form.fullName || undefined,
        role: form.role,
      };
      if (form.email) dto.email = form.email;
      if (form.agencyId) dto.agencyId = form.agencyId;
      await updateUser.mutateAsync({ id: user.id, dto });
      if (form.password) {
        await usersApi.changePassword(user.id, form.password);
      }
      navigate('/users');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Editar usuario</h2>
        </div>
        {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5 font-medium">
            Usuario
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={user.username} disabled />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Contrasena
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Dejar vacio para no cambiar" />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre completo
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Email
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Rol
            <CustomSelect value={form.role} onChange={(selectedRole) => setForm((prev) => ({ ...prev, role: selectedRole }))} options={ROLE_OPTIONS} placeholder="Seleccionar" />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Agencia
            <CustomSelect value={form.agencyId} onChange={(selectedAgencyId) => setForm((prev) => ({ ...prev, agencyId: selectedAgencyId }))} options={agencies} placeholder="Seleccionar" />
          </label>
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={updateUser.isPending}>Actualizar usuario</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/users')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: users = [], isLoading: loadingUsers, error: queryError } = useUsers();

  const user: User | undefined = users.find((u: User) => u.id === id);

  if (loadingUsers) {
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{(queryError as Error).message}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">Usuario no encontrado</div>
        </div>
      </div>
    );
  }

  return <UserEditForm key={user.id} user={user} />;
}
