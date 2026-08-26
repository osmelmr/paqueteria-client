import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '../hooks/useUsers';
import { CustomSelect } from '../components/CustomSelect';
import { useAgencies } from '../hooks/useAgencies';
import { useAuthStore } from '../store/auth.store';

const ROLE_OPTIONS = [
  { id: 'STOREKEEPER', name: 'Almacenero' },
  {id:'WORKER',name:'Trabajador'},
  {id:'PARTNER',name:'Socio'},
  { id: 'OWNER', name: 'Admin' },
  { id: 'ADMIN', name: 'Admin' },
];

export default function UsersCreatePage() {
  const navigate = useNavigate();
  const { data: agencies = [] } = useAgencies();
  const currentUserRole = useAuthStore((s) => s.user?.role);
  const roleOptions = ROLE_OPTIONS.filter(
    (o) => o.id !== 'ADMIN' && (o.id !== 'OWNER' || currentUserRole === 'ADMIN'),
  );
  const createUser = useCreateUser();
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'STOREKEEPER', agencyId: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const { agencyId, ...rest } = form;
      await createUser.mutateAsync({ ...rest, ...(agencyId && { agencyId }) });
      navigate('/users');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }} className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Nuevo usuario</h2>
        </div>
        {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-4.5 grid-form">
          <label className="flex flex-col gap-1.5 font-medium">
            Usuario
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Contrasena
            <input type="password" className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre completo
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Email
            <input type="email" className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Rol
            <CustomSelect value={form.role} onChange={(id) => setForm((prev) => ({ ...prev, role: id, ...(id !== 'PARTNER' && { agencyId: '' }) }))} options={roleOptions} placeholder="Seleccionar" />
          </label>
          {form.role === 'PARTNER' && (
            <label className="flex flex-col gap-1.5 font-medium">
              Agencia
              <CustomSelect value={form.agencyId} onChange={(id) => setForm((prev) => ({ ...prev, agencyId: id }))} options={agencies} placeholder="Seleccionar" />
            </label>
          )}
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={createUser.isPending} className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50">Crear usuario</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/users')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
