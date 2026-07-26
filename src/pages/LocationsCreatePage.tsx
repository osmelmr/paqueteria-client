import { useState, type FormEvent } from 'react';
import { useCreateLocation } from '../hooks/useLocations';
import { useNavigate } from 'react-router-dom';

export default function LocationsCreatePage() {
  const createEntity = useCreateLocation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createEntity.mutateAsync({ name });
      navigate('/locations');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <h2>Nueva ubicacion</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="simple-form two-column-form">
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="button-group">
            <button type="submit" disabled={createEntity.isPending}>Crear ubicacion</button>
            <button type="button" className="secondary" onClick={() => navigate('/locations')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
