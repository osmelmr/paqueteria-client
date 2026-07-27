import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecipients, useUpdateRecipient } from '../hooks/useRecipients';

export default function RecipientsEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: recipients = [], isLoading } = useRecipients();
  const updateRecipient = useUpdateRecipient();
  const [form, setForm] = useState({ fullName: '', idCard: '', phone: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const recipient = recipients.find((r) => r.id === id);

  useEffect(() => {
    if (recipient) {
      setForm({ fullName: recipient.fullName, idCard: recipient.idCard, phone: recipient.phone || '' });
    }
  }, [recipient]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setLocalError(null);
    try {
      await updateRecipient.mutateAsync({ id, dto: form });
      navigate('/recipients');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-white/92 dark:bg-[#1e1f27] shadow-lg mb-[18px]">
          <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-white/92 dark:bg-[#1e1f27] shadow-lg mb-[18px]">
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">Destinatario no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-white/92 dark:bg-[#1e1f27] shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Editar destinatario</h2>
        {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-4.5 grid grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-900 dark:text-gray-100" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Carnet
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-900 dark:text-gray-100" value={form.idCard} onChange={(e) => setForm((prev) => ({ ...prev, idCard: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium col-span-full">
            Telefono
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-900 dark:text-gray-100" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          </label>
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={updateRecipient.isPending}>Actualizar destinatario</button>
            <button type="button" className="bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => navigate('/recipients')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
