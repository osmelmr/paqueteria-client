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
    <div className="page">
      <div className="panel">
        <h2 style={{ margin: 0, marginBottom: 16 }}>Nuevo destinatario</h2>
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
            <button type="submit" disabled={createRecipient.isPending}>Crear destinatario</button>
            <button type="button" className="secondary" onClick={() => navigate('/recipients')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
