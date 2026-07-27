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
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-white/92 dark:bg-[#1e1f27] shadow-lg mb-[18px]">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }} className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Nuevo usuario</h2>
        </div>
        {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-4.5 grid-form">
          <label className="flex flex-col gap-1.5 font-medium">
            Usuario
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-900 dark:text-gray-100" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Contrasena
            <input type="password" className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-900 dark:text-gray-100" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre completo
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-900 dark:text-gray-100" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Email
            <input type="email" className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-900 dark:text-gray-100" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Rol
            <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-900 dark:text-gray-100" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
              <option value="STOREKEEPER">Almacenero</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={createUser.isPending} className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50">Crear usuario</button>
            <button type="button" className="bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => navigate('/users')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
