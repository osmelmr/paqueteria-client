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
      <div className="page">
        <div className="panel">
          <div className="loading-banner">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="page">
        <div className="panel">
          <div className="error-box">Destinatario no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel">
        <h2 style={{ margin: 0, marginBottom: 16 }}>Editar destinatario</h2>
        {localError && <div className="error-box">{localError}</div>}
        <form onSubmit={handleSubmit} className="simple-form grid-form">
          <label>
            Nombre
            <input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
          </label>
          <label>
            Carnet
            <input value={form.idCard} onChange={(e) => setForm((prev) => ({ ...prev, idCard: e.target.value }))} required />
          </label>
          <label className="full-width">
            Telefono
            <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          </label>
          <div className="button-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={updateRecipient.isPending}>Actualizar destinatario</button>
            <button type="button" className="secondary" onClick={() => navigate('/recipients')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
