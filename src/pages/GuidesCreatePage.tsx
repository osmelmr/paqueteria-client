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
    <div className="page">
      <div className="panel">
        <h2 style={{ margin: 0, marginBottom: 16 }}>Nueva guia</h2>
        {localError && <div className="error-box">{localError}</div>}
        <form onSubmit={handleSubmit} className="simple-form grid-form">
          <label>
            Agencia
            <select value={form.agencyId} onChange={(e) => setForm((prev) => ({ ...prev, agencyId: e.target.value }))} required>
              <option value="">Seleccionar agencia</option>
              {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label>
            Referencia externa
            <input value={form.externalRef} onChange={(e) => setForm((prev) => ({ ...prev, externalRef: e.target.value }))} required />
          </label>
          <div className="button-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={createGuide.isPending}>Crear guia</button>
            <button type="button" className="secondary" onClick={() => navigate('/guides')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
