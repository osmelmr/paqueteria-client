import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateGuide } from '../hooks/useGuides';
import { useAgencies } from '../hooks/useAgencies';

export default function GuidesCreatePage() {
  const navigate = useNavigate();
  const { data: agencies = [] } = useAgencies();
  const createGuide = useCreateGuide();
  const [form, setForm] = useState({ externalRef: '', agencyId: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      await createGuide.mutateAsync(form);
      navigate('/guides');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 style={{ margin: 0, marginBottom: 16 }} className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Nueva guia</h2>
        {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-4.5 grid-form">
          <label className="flex flex-col gap-1.5 font-medium">
            Agencia
            <select className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.agencyId} onChange={(e) => setForm((prev) => ({ ...prev, agencyId: e.target.value }))} required>
              <option value="">Seleccionar agencia</option>
              {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Referencia externa
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.externalRef} onChange={(e) => setForm((prev) => ({ ...prev, externalRef: e.target.value }))} required />
          </label>
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={createGuide.isPending} className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50">Crear guia</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/guides')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
