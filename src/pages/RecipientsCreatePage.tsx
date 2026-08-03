import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRecipient } from '../hooks/useRecipients';

export default function RecipientsCreatePage() {
  const navigate = useNavigate();
  const createRecipient = useCreateRecipient();
  const [form, setForm] = useState({ fullName: '', idCard: '', phone: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      await createRecipient.mutateAsync(form);
      navigate('/recipients');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 style={{ margin: 0, marginBottom: 16 }} className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Nuevo destinatario</h2>
        {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-4.5 grid-form">
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Carnet
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.idCard} onChange={(e) => setForm((prev) => ({ ...prev, idCard: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium col-span-full">
            Telefono
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          </label>
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={createRecipient.isPending} className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50">Crear destinatario</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/recipients')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
