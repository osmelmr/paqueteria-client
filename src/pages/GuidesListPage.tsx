import { useNavigate } from 'react-router-dom';
import { useGuides, useDeleteGuide } from '../hooks/useGuides';

export default function GuidesListPage() {
  const navigate = useNavigate();
  const { data: guides = [], isLoading, error: queryError } = useGuides();
  const deleteGuide = useDeleteGuide();

  const error = queryError ? (queryError as Error).message : null;

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta guia?')) return;
    try {
      await deleteGuide.mutateAsync(id);
    } catch (err) {
      /* error is ignored in list page */
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Guias</h2>
          <button type="button" onClick={() => navigate('/guides/new')}>Nueva guia</button>
        </div>
        {error && <div className="error-box">{error}</div>}
        {isLoading && <div className="loading-banner">Cargando...</div>}
        <div className="list-card">
          <table>
            <thead>
              <tr><th>ID</th><th>Agencia</th><th>Referencia</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {guides.map((g) => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td>{g.agency?.name || '—'}</td>
                  <td>{g.externalRef}</td>
                  <td>
                    <div className="inline-actions">
                      <button type="button" className="small" onClick={() => navigate(`/guides/${g.id}/edit`)}>Editar</button>
                      <button type="button" className="small secondary" onClick={() => handleDelete(g.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
