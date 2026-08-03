import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGuides, useUpdateGuide } from '../hooks/useGuides';
import { useAgencies } from '../hooks/useAgencies';
import type { GuideType } from '../api/guides.api';

export default function GuidesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: guides = [], isLoading: guidesLoading } = useGuides();
  const { data: agencies = [] } = useAgencies();
  const updateGuide = useUpdateGuide();
  const [form, setForm] = useState<{ name: string; agencyId: string; type: GuideType }>({ name: '', agencyId: '', type: 'AEREA' });
  const [localError, setLocalError] = useState<string | null>(null);

  const guide = guides.find((g) => g.id === id);

  useEffect(() => {
    if (guide) {
      setForm({ name: guide.name, agencyId: guide.agencyId || '', type: guide.type });
    }
  }, [guide]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setLocalError(null);
    try {
      await updateGuide.mutateAsync({ id, dto: form });
      navigate('/guides');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  if (guidesLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">Guia no encontrada</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Editar guia</h2>
        {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-4.5 grid grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5 font-medium">
            Agencia
            <select className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.agencyId} onChange={(e) => setForm((prev) => ({ ...prev, agencyId: e.target.value }))} required>
              <option value="">Seleccionar agencia</option>
              {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Referencia externa
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Tipo
            <select className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as GuideType }))} required>
              <option value="AEREA">Aerea</option>
              <option value="MARITIMA">Maritima</option>
            </select>
          </label>
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={updateGuide.isPending}>Actualizar guia</button>
            <button type="button" className="secondary" onClick={() => navigate('/guides')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
