import { useState, type FormEvent } from 'react';
import { useAgencies, useUpdateAgency } from '../hooks/useAgencies';
import { useNavigate, useParams } from 'react-router-dom';

export default function AgenciesEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: items = [], isLoading } = useAgencies();
  const updateEntity = useUpdateAgency();
  const navigate = useNavigate();
  const item = items.find((i) => i.id === id);
  const [name, setName] = useState(item?.name ?? '');
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <div className="loading-banner">Cargando...</div>;
  if (!item) return <div className="error-box">Agencia no encontrada</div>;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await updateEntity.mutateAsync({ id: id!, dto: { name } });
      navigate('/agencies');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <h2>Editar agencia</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="simple-form two-column-form">
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="button-group">
            <button type="submit" disabled={updateEntity.isPending}>Actualizar agencia</button>
            <button type="button" className="secondary" onClick={() => navigate('/agencies')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
