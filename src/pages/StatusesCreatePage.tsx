import { useState, type FormEvent } from 'react';
import { useCreateStatus } from '../hooks/useStatuses';
import { useNavigate } from 'react-router-dom';

export default function StatusesCreatePage() {
  const createEntity = useCreateStatus();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createEntity.mutateAsync({ name });
      navigate('/statuses');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <h2>Nuevo estado</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="simple-form two-column-form">
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="button-group">
            <button type="submit" disabled={createEntity.isPending}>Crear estado</button>
            <button type="button" className="secondary" onClick={() => navigate('/statuses')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
