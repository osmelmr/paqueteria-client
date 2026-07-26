import { useState, type FormEvent } from 'react';
import { useLocations, useUpdateLocation } from '../hooks/useLocations';
import { useNavigate, useParams } from 'react-router-dom';

export default function LocationsEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: items = [], isLoading } = useLocations();
  const updateEntity = useUpdateLocation();
  const navigate = useNavigate();
  const item = items.find((i) => i.id === id);
  const [name, setName] = useState(item?.name ?? '');
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <div className="loading-banner">Cargando...</div>;
  if (!item) return <div className="error-box">Ubicacion no encontrada</div>;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await updateEntity.mutateAsync({ id: id!, dto: { name } });
      navigate('/locations');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <h2>Editar ubicacion</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="simple-form two-column-form">
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="button-group">
            <button type="submit" disabled={updateEntity.isPending}>Actualizar ubicacion</button>
            <button type="button" className="secondary" onClick={() => navigate('/locations')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
