import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGuides, useUpdateGuide } from '../hooks/useGuides';
import { useAgencies } from '../hooks/useAgencies';

export default function GuidesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: guides = [], isLoading: guidesLoading } = useGuides();
  const { data: agencies = [] } = useAgencies();
  const updateGuide = useUpdateGuide();
  const [form, setForm] = useState({ externalRef: '', agencyId: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const guide = guides.find((g) => g.id === id);

  useEffect(() => {
    if (guide) {
      setForm({ externalRef: guide.externalRef, agencyId: guide.agencyId || '' });
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
      <div className="page">
        <div className="panel">
          <div className="loading-banner">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="page">
        <div className="panel">
          <div className="error-box">Guia no encontrada</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel">
        <h2 style={{ margin: 0, marginBottom: 16 }}>Editar guia</h2>
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
            <button type="submit" disabled={updateGuide.isPending}>Actualizar guia</button>
            <button type="button" className="secondary" onClick={() => navigate('/guides')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
