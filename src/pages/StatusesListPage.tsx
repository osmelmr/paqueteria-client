import { useStatuses, useDeleteStatus } from '../hooks/useStatuses';
import { useNavigate } from 'react-router-dom';

export default function StatusesListPage() {
  const { data: items = [], isLoading, error: queryError } = useStatuses();
  const deleteEntity = useDeleteStatus();
  const navigate = useNavigate();
  const error = queryError ? (queryError as Error).message : null;

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este estado?')) return;
    try {
      await deleteEntity.mutateAsync(id);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Estados</h2>
          <button type="button" onClick={() => navigate('/statuses/new')}>Nuevo estado</button>
        </div>
        {error && <div className="error-box">{error}</div>}
        {isLoading && <div className="loading-banner">Cargando...</div>}
        <div className="list-card">
          <table>
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    <div className="inline-actions">
                      <button type="button" className="small" onClick={() => navigate(`/statuses/${item.id}/edit`)}>Editar</button>
                      <button type="button" className="small secondary" onClick={() => handleDelete(item.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !isLoading && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>No hay estados registrados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
